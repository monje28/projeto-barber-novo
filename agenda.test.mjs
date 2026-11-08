import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

test('Worker Supabase: autenticacao, privacidade e tratamento dos bloqueios', async t => {
  const rows = [];
  const env = {ADMIN_PASSWORD:'senha-teste', SUPABASE_URL:'https://example.supabase.co', SUPABASE_SECRET_KEY:'sb_secret_test'};
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin,env.SUPABASE_URL);
    assert.equal(options.headers.apikey,env.SUPABASE_SECRET_KEY);
    assert.equal(options.headers.Authorization,undefined);
    if (url.pathname.endsWith('/agendamentos')) {
      if (url.searchParams.has('status')) return Response.json(rows.filter(r => r.status === 'aprovado').map(({id,data,horario,status}) => ({id,data,horario,status})));
      return Response.json(rows);
    }
    assert.equal(url.pathname,'/rest/v1/rpc/gravar_agendamento');
    const {p_acao, p_dados: body} = JSON.parse(options.body);
    const row = rows.find(r => r.id === body.id);
    const blocked = rows.some(r => r.id !== body.id && r.data === (row || body).data && r.horario === (row || body).horario && r.status === 'aprovado');
    if ((p_acao === 'criar' || body.status === 'aprovado') && blocked) return Response.json({code:'23505',message:'horario_bloqueado'},{status:409});
    if (p_acao === 'criar') rows.push({...body,id:crypto.randomUUID()});
    if (p_acao === 'alterar' && row) row.status = body.status;
    if (p_acao === 'excluir' && row) rows.splice(rows.indexOf(row),1);
    return Response.json({alterados: p_acao === 'criar' || row ? 1 : 0});
  });
  const call = (method, body, admin = false, path = '/api/agendamentos') => worker.fetch(new Request('https://barbearia.test'+path, {
    method, headers:{'Content-Type':'application/json', ...(admin ? {Authorization:'Basic '+btoa('admin:senha-teste')} : {})},
    ...(body ? {body:JSON.stringify(body)} : {})
  }),env);
  const booking = {nome:'Cliente',telefone:'17999999999',servico:'Corte',data:'2026-11-09',horario:'10:00',status:'pendente'};
  assert.equal((await call('POST',booking)).status,201);
  assert.equal((await call('POST',booking)).status,201);
  assert.deepEqual(await (await call('GET')).json(),[]);
  let list = await (await call('GET',null,true)).json();
  const id = list[0].id;
  const competingId = list[1].id;
  assert.equal((await call('PATCH',{id,status:'aprovado'})).status,401);
  assert.equal((await call('PATCH',{id,status:'aprovado'},true)).status,200);
  assert.equal((await call('PATCH',{id:competingId,status:'aprovado'},true)).status,409);
  list = await (await call('GET')).json();
  assert.equal(list[0].status,'aprovado');
  assert.equal(list[0].nome,undefined);
  assert.equal((await call('POST',booking)).status,409);
  assert.equal((await call('POST',{...booking,status:'aprovado'},true)).status,409);
  assert.equal((await call('PATCH',{id,status:'recusado'},true)).status,200);
  assert.equal((await call('POST',booking)).status,201);
  assert.equal((await call('POST',{},false,'/api/login')).status,401);
  assert.equal((await call('POST',{},true,'/api/login')).status,200);
  assert.equal((await call('POST',{...booking,data:'2026-11-08'})).status,400);
  assert.equal((await call('DELETE',{id},true)).status,200);
  assert.equal((await call('PATCH',{id,status:'aprovado'},true)).status,404);
});
