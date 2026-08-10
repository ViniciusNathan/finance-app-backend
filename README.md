# Finance App — Backend

API REST para controle de finanças domésticas compartilhadas entre dois usuários. Projeto de aprendizado prático, construído com foco em entender o "porquê" de cada decisão técnica, não só o "como" implementar.

## Stack

- **Runtime:** Node.js (ESM — `import/export`)
- **Framework:** Express
- **ORM:** Prisma 7, com driver adapter `@prisma/adapter-pg`
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT (`jsonwebtoken`) + hash de senha (`bcryptjs`)
- **Testes de API:** Postman
- **Hospedagem planejada:** Firebase / Google Cloud (serverless)
- **Cliente:** app Flutter consumindo essa API (em desenvolvimento futuro)

## Fluxo de uma requisição

1. `app.js` recebe a requisição e encaminha pra `routes/index.js`
2. `routes/index.js` redireciona pro arquivo de rotas do recurso (ex: `/users` → `user.routes.js`)
3. O arquivo de rotas decide qual função do controller chamar, baseado no verbo HTTP
4. O controller executa a lógica (Prisma) e devolve a resposta

## Estrutura do projeto

- `routes/index.js` → organização geral da API (onde as coisas estão)
- `routes/*.routes.js` → o cardápio de operações de cada recurso (category, transaction, user, recurring-transaction)
- `controllers/*.controller.js` → como cada operação funciona de verdade
- `prisma/schema.prisma` → a "planta" do banco: campos, tipos e relações. Não sabe (nem deveria saber) quais campos uma rota específica quer devolver
- `lib/prisma.js` → instância única do Prisma Client, usando o driver adapter do Postgres

**Sobre requisições:**
- `req.params` — dados que vêm embutidos na própria URL (ex: `/users/5`)
- `req.body` — dados que vêm no corpo da requisição, geralmente JSON

**Sobre queries Prisma:**
- `where` → qual registro modificar/buscar
- `data` → quais valores escrever
- `select` → o que devolver na resposta (controle explícito do que sai da API)

## Decisões técnicas

**Prisma 7 + driver adapter (`@prisma/adapter-pg`)**
Prisma 7 trouxe mudanças estruturais: a `DATABASE_URL` saiu do `schema.prisma` e foi para `prisma.config.ts`, e o uso de um driver adapter passou a ser necessário para conectar ao Postgres. O client gerado também passou a ser ESM por padrão — o que motivou migrar o projeto inteiro de CommonJS para ESM no meio do desenvolvimento, para não conviver com dois sistemas de módulos diferentes.

**ESM em vez de CommonJS**
Decisão consciente de usar sempre as práticas mais modernas do ecossistema JS/Node, mesmo quando exige mais trabalho de adaptação (como essa migração). ESM é o padrão para onde o ecossistema Node está convergindo, e é o formato que o Prisma 7 já assume por padrão.

**bcryptjs em vez de bcrypt**
`bcrypt` (biblioteca original) depende de compilação de código nativo (C++) durante a instalação, o que pode falhar silenciosamente em ambientes de build restritos — como o esperado em Cloud Functions/Cloud Run no Firebase. `bcryptjs` é uma reimplementação 100% em JavaScript, sem essa dependência, priorizando portabilidade em troca de uma diferença de performance irrelevante para a escala deste app.

**JWT em vez de sessão**
Sessão exige que o servidor mantenha estado (guardar cada sessão ativa em memória ou em um storage como Redis), o que se encaixa mal em arquitetura serverless, onde instâncias não compartilham memória entre si. JWT é stateless: o servidor verifica a autenticidade do token matematicamente, sem consultar nenhum armazenamento. Isso combina melhor com o par Firebase (serverless) + Flutter (cliente mobile, sem o conceito nativo de cookies do navegador).

Trade-off aceito conscientemente: tokens JWT são difíceis de revogar antes da expiração, já que o servidor não mantém registro deles. Mitigado, por ora, com uma expiração de 30 dias. Um sistema de *refresh token* (par de tokens — um de vida curta para autenticação, outro de vida longa para renovação silenciosa, com capacidade de revogação) fica documentado como melhoria futura.

**Senhas: hash com salt, nunca texto puro**
Senhas nunca são armazenadas nem comparadas em texto puro. No cadastro, a senha passa por `bcryptjs.hash()` com custo (`saltRounds`) 12 antes de ser salva. No login, a senha recebida é comparada ao hash salvo via `bcryptjs.compare()` — que extrai o salt já embutido no hash armazenado, hasheia a senha recebida com o mesmo salt, e compara os resultados. O hash nunca é "desfeito": a comparação é sempre feita recriando o hash, nunca revertendo-o.

**Mensagens de erro genéricas no login**
Login com email inexistente e login com senha incorreta retornam exatamente a mesma resposta (401, "email ou senha incorreto"). Isso evita *user enumeration* — um ataque onde mensagens diferentes ("usuário não encontrado" vs "senha incorreta") permitiriam a alguém descobrir quais emails têm conta no sistema, mesmo sem saber nenhuma senha.

**Categorias por usuário (1-para-muitos, não muitos-para-muitos)**
Cada usuário tem suas próprias categorias, de forma independente — dois usuários podem ter categorias com o mesmo nome sem conflito. Modelagem simples, sem necessidade de uma tabela de junção.

## Segurança — decisões conscientes e pendências

- ✅ Senhas hasheadas com salt (bcryptjs, custo 12)
- ✅ Autenticação via JWT, chave secreta fora do código-fonte (variável de ambiente, nunca commitada)
- ✅ Mensagens de erro de login não vazam se o problema foi o email ou a senha
- ⏳ Middleware de autenticação para proteger rotas (em andamento)
- 🔜 OAuth "Continue com Google" — planejado para depois da autenticação por senha estar sólida, já que o cadastro via Google não usa `passwordHash`
- 🔜 Refresh token — para permitir revogar acesso sem esperar a expiração do JWT

## Fluxo de trabalho com Git

1. Criar branch nova a partir da main:
2. Desenvolver e testar a funcionalidade
3. Conferir o que será commitado:
4. Adicionar as mudanças ao staging:
5. Commitar (Conventional Commits):
6. Subir a branch pro GitHub (primeira vez, associando com o remoto):
   git push -u origin feat/<entidade-ou-funcionalidade>
   (nas vezes seguintes, dentro da mesma branch, só `git push`)
7. Abrir um Pull Request no GitHub (Draft PR se ainda não terminou tudo)
8. Quando terminar: finalizar o PR e dar merge na main (pela interface do GitHub)
9. Voltar pra main localmente: git checkout main
10. Puxar as atualizações que vieram do merge:
git pull
11. Apagar a branch local que já foi mergeada:
git branch -d feat/<entidade-ou-funcionalidade>

## Comandos úteis

**Preview de `.md` no VS Code:** `⇧⌘V`

**Rodar servidor de desenvolvimento:**
npm run dev

**Abrir Prisma Studio (inspeção visual do banco):**
npx prisma studio

**Rodar migration do Prisma:**
npx prisma migrate dev