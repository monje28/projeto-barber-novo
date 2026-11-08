const horas = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const json = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store'}});
async function supabase(env, path, options = {}) {
  const response = await fetch(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path, {
    ...options,
    headers: {'apikey':env.SUPABASE_SECRET_KEY, 'Content-Type':'application/json',
      ...(env.SUPABASE_SECRET_KEY.startsWith('eyJ') ? {Authorization:'Bearer '+env.SUPABASE_SECRET_KEY} : {})},
    signal:AbortSignal.timeout(15000)
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Erro no banco de dados.');
    error.code = data.code;
    throw error;
  }
  return data;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY || !env.ADMIN_PASSWORD) return json({erro: 'Agenda ainda não configurada na hospedagem.'}, 503);
    const admin = request.headers.get('Authorization') === 'Basic ' + btoa('admin:' + env.ADMIN_PASSWORD);
    if (!['GET','HEAD'].includes(request.method) && request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return json({erro:'Origem inválida.'},403);
    try {
      if (url.pathname === '/api/login' && request.method === 'POST') return admin ? json({ok:true}) : json({erro:'Usuário ou senha incorretos.'},401);
      if (url.pathname !== '/api/agendamentos') return json({erro:'Não encontrado.'},404);
      if (request.method === 'GET') {
        // Paginate so projects with >1000 requests still show all occupied slots.
        const rows = [];
        for (let offset = 0; ; offset += 500) {
          const query = admin ? 'select=*&order=data,horario,id' : 'select=id,data,horario,status&status=eq.aprovado&order=data,horario,id';
          const page = await supabase(env, `agendamentos?${query}&limit=500&offset=${offset}`);
          rows.push(...page);
          if (page.length < 500) break;
        }
        return json(rows);
      }
      if (Number(request.headers.get('Content-Length') || 0) > 8192) return json({erro:'Dados muito grandes.'},413);
      const raw = await request.text();
      if (raw.length > 8192) return json({erro:'Dados muito grandes.'},413);
      const body = JSON.parse(raw);
      if (request.method === 'POST') {
        if (!admin && body.status !== 'pendente') return json({erro:'Acesso administrativo necessário.'},401);
        if (!['pendente','aprovado'].includes(body.status) || !horas.includes(body.horario) || !/^\d{4}-\d{2}-\d{2}$/.test(body.data)) return json({erro:'Data ou horário inválido.'},400);
        const date = new Date(body.data + 'T12:00:00Z');
        if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== body.data || date.getUTCDay() === 0) return json({erro:'Selecione um dia de atendimento.'},400);
        if (!['nome','telefone','servico'].every(key => typeof body[key] === 'string' && body[key].trim() && body[key].length <= 200)) return json({erro:'Preencha nome, telefone e serviço.'},400);
        await supabase(env, 'rpc/gravar_agendamento', {method:'POST',body:JSON.stringify({p_acao:'criar',p_dados:body})});
        return json({ok:true},201);
      }
      if (!admin) return json({erro:'Acesso administrativo necessário.'},401);
      if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return json({erro:'Identificador inválido.'},400);
      if (request.method === 'PATCH' && ['aprovado','recusado'].includes(body.status)) {
        const result = await supabase(env, 'rpc/gravar_agendamento', {method:'POST',body:JSON.stringify({p_acao:'alterar',p_dados:body})});
        return result.alterados ? json({ok:true}) : json({erro:'Agendamento não encontrado.'},404);
      }
      if (request.method === 'DELETE') {
        await supabase(env, 'rpc/gravar_agendamento', {method:'POST',body:JSON.stringify({p_acao:'excluir',p_dados:body})});
        return json({ok:true});
      }
      return json({erro:'Operação inválida.'},400);
    } catch (error) {
      if (error.code === '23505' || /horario_bloqueado/.test(error.message)) return json({erro:'Esse horário já está bloqueado. Atualize a agenda e escolha outro.'},409);
      if (error instanceof SyntaxError) return json({erro:'Dados inválidos.'},400);
      console.error(error);
      return json({erro:'Não foi possível salvar. Tente novamente.'},500);
    }
  }
};
