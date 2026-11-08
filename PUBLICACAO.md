# Publicar com Supabase e Cloudflare

O banco escolhido e o Supabase do projeto `ubwswitfmjmzquloanzo`.
O endereco `https://ubwswitfmjmzquloanzo.supabase.co/rest/v1/` e a URL da API, nao uma chave.
A integracao esta preparada localmente. As tabelas e os secrets precisam ser configurados antes da publicacao.

## 1. Criar o banco da agenda

1. Abra https://supabase.com/dashboard/project/ubwswitfmjmzquloanzo/sql/new
2. Copie todo o arquivo [supabase/schema.sql](supabase/schema.sql) para o SQL Editor.
3. Execute com Run. O script cria a tabela, o indice de bloqueio e a funcao de gravacao.

O script e para um projeto novo. Se existir uma tabela `agendamentos` com outra estrutura, confira a estrutura antes de executar.
O arquivo `migrations/0001_agendamentos.sql` e da versao antiga D1 e nao deve ser executado no Supabase.
RLS fica ativo; usuarios anonimos nao acessam a tabela. Somente o Worker com a chave secreta consulta e grava os dados.
A funcao serializa as gravacoes para evitar conflitos entre solicitacoes, aprovacoes e bloqueios simultaneos.

## 2. Configurar os secrets da Cloudflare

No terminal desta pasta:

```powershell
npx wrangler login
npx wrangler secret put SUPABASE_SECRET_KEY
```

Quando solicitado, cole a Secret key (`sb_secret_...`) do projeto Supabase, disponivel nas configuracoes de API Keys.
Tambem e aceito o formato legado service_role. Nao use a chave publica anon/publishable para essa integracao.
Nao coloque a chave no HTML, arquivo.js, wrangler.jsonc ou chat.
A URL publica do projeto ja esta em `wrangler.jsonc`.

Depois configure a senha do administrador:

```powershell
npx wrangler secret put ADMIN_PASSWORD
```

Digite uma senha exclusiva quando solicitado. O usuario do painel e `admin`.
Como alternativa aos comandos de secrets, use o painel Cloudflare > Worker `projeto-barber-novo` > Settings > Variables and Secrets e cadastre os dois valores como Secret.

## 3. Verificar e publicar

```powershell
node --test agenda.test.mjs
node preparar-publicacao.mjs
npx wrangler deploy
```

O nome do Worker continua `projeto-barber-novo`, mantendo o endereco existente.
O teste automatizado usa respostas simuladas do Supabase para verificar autenticacao, filtragem de dados pessoais e tratamento de conflitos no Worker; ele nao executa o SQL em um banco real.
A validacao completa depende de executar o SQL e testar a conexao com as credenciais do projeto.

## 4. Conferir no computador e no celular

1. Entre no painel como administrador e bloqueie um horario futuro.
2. Abra o mesmo dia no celular: em ate 15 segundos a grade atualiza; ao voltar para a aba, tambem ocorre uma consulta.
3. Tente reservar um horario bloqueado: o servidor deve recusar, mesmo se a tela estiver desatualizada.
4. Desbloqueie pelo celular e confira a liberacao no computador.
5. Na tabela `agendamentos` do Supabase, confira se os registros aparecem.

Sem conexao, a pagina informa que a agenda esta indisponivel e nao confirma um salvamento que falhou.

## Dados antigos

Os registros antigos continuam no localStorage do navegador onde foram criados. Eles nao sao apagados nem importados automaticamente.
Confira os bloqueios antigos no computador e registre os que ainda valem no painel compartilhado antes de atender novos pedidos.
A senha antiga exibida no site deixa de valer: o servidor usa exclusivamente ADMIN_PASSWORD.

Documentacao oficial: https://supabase.com/docs/guides/api/creating-routes e https://supabase.com/docs/guides/database/functions.
