# Finance App — Backend

API REST para controle de finanças domésticas compartilhadas entre dois usuários. Projeto de aprendizado prático, construído com foco em entender o "porquê" de cada decisão técnica, não só o "como" implementar.

## Stack

- **Runtime:** Node.js (ESM — `import/export`)
- **Framework:** Express
- **ORM:** Prisma 7, com driver adapter `@prisma/adapter-pg`
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT (`jsonwebtoken`) + hash de senha (`bcryptjs`)
- **Testes de API:** Postman
- **Hospedagem:** Firebase / Google Cloud (serverless) — Cloud Functions (2ª gen), rodando sobre Cloud Run, região `southamerica-east1`. Já deployado.
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

## Infraestrutura e Deploy

**Cloud SQL — edição Enterprise (não Enterprise Plus)**
Para instâncias PostgreSQL 16+, o Cloud SQL usa Enterprise Plus como edição padrão — mas essa edição não oferece os tiers de máquina mais baratos (shared-core), obrigando um tamanho mínimo de máquina desnecessário para um ambiente de desenvolvimento sem tráfego real. Selecionando Enterprise explicitamente, foi possível usar o preset "Sandbox" (2 vCPU, 8 GB RAM), reduzindo o custo de milhares para poucos dólares por mês. Trade-off aceito: Enterprise Plus oferece SLA maior, cache de dados e recuperação mais rápida — recursos que fazem sentido para produção com tráfego real, não para este estágio do projeto.

**IP privado, sem IP público**
A instância do Cloud SQL não possui IP público — só é acessível de dentro da VPC do projeto. Decisão consciente de segurança: elimina a superfície de ataque de um banco de dados exposto à internet, mesmo que protegido por firewall/IAM. Trade-off aceito: acesso administrativo (rodar migrations, inspecionar dados) da máquina local exige uma camada extra de infraestrutura (ver Bastion VM, abaixo), já que a rede privada não é alcançável diretamente de fora do Google Cloud.

**VPC Connector (Serverless VPC Access)**
Cloud Functions, por padrão, não tem acesso à rede privada (VPC) do projeto — precisa de uma ponte explícita. O VPC Connector cumpre esse papel, permitindo que a função alcance o IP privado do Cloud SQL. Configurado com `vpcConnectorEgressSettings: PRIVATE_RANGES_ONLY`, para que só o tráfego destinado a IPs privados passe pela VPC — chamadas a serviços externos continuam saindo direto pela internet, sem overhead desnecessário.

**Bastion VM + IAP para acesso administrativo**
Como o Cloud SQL não tem IP público, a máquina local não consegue se conectar diretamente para rodar migrations ou inspecionar dados. A solução: uma VM pequena (`e2-micro`) dentro da mesma VPC, sem IP público próprio, acessada via SSH através do Identity-Aware Proxy (IAP) — que autentica pela conta Google, sem expor porta SSH à internet. Um túnel de encaminhamento de porta (`ssh -L`) usa essa VM como ponte: a máquina local conecta em `localhost:5433`, que é encaminhado pela VM até o IP privado do banco. O Prisma, do lado do desenvolvedor, não sabe que está atravessando esse túnel — só enxerga `localhost`.

**Secret Manager para a `DATABASE_URL`**
Em ambiente local, a string de conexão do banco vive no `.env` (fora do controle de versão). Em produção, não existe arquivo `.env` — a Cloud Function usa o Secret Manager do Google Cloud, que guarda o segredo de forma criptografada e o disponibiliza como variável de ambiente somente em runtime. A string nunca fica escrita em nenhum arquivo do repositório ou do container.

**Prisma 7 sem engine Rust (`provider = "prisma-client"`)**
Deploys de Prisma em ambiente serverless historicamente sofrem com um problema: o Prisma Client é gerado com um "engine" binário específico da plataforma onde `prisma generate` foi executado (ex: macOS), que não é compatível com o Linux do ambiente de produção. A partir do Prisma 7, o gerador `prisma-client` (usado neste projeto, junto com o driver adapter `@prisma/adapter-pg`) elimina esse binário: a conexão passa a ser feita via driver JavaScript puro (`pg`), sem depender de nenhum engine compilado. Esse problema simplesmente não existe nesta configuração.

## Autenticação

**Fluxo:**
1. Usuário se cadastra (`POST /users`) — a senha é hasheada com `bcryptjs` antes de ser salva
2. Usuário faz login (`POST /users/login`) com email e senha
3. Servidor valida as credenciais e retorna um JWT (`jsonwebtoken`), válido por 30 dias, contendo o `id` do usuário
4. Em requisições futuras a rotas protegidas, o cliente envia esse token no header:
5. Um middleware (`src/middlewares/auth.middleware.js`) intercepta a requisição antes do controller: extrai o token do header, verifica sua validade com `jwt.verify()`, e — se válido — anexa o `id` do usuário em `req.userId`, disponível para o controller seguinte usar

**Erros tratados pelo middleware:**
- Header `Authorization` ausente → 401
- Token malformado (sem a parte após "Bearer") → 401
- Token inválido, adulterado ou expirado → 401 (capturado via `try/catch`, já que `jwt.verify` lança uma exceção em vez de retornar `null`)

## Segurança — decisões conscientes e pendências

- ✅ Senhas hasheadas com salt (bcryptjs, custo 12)
- ✅ Autenticação via JWT, chave secreta fora do código-fonte (variável de ambiente, nunca commitada)
- ✅ Mensagens de erro de login não vazam se o problema foi o email ou a senha
- ✅ Middleware de autenticação protegendo rotas sensíveis, validando o token via header `Authorization`
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

## Testes manuais (Postman)

Todos os endpoints são testados manualmente via Postman antes de cada commit, cobrindo:
- Caminho feliz (dado válido, resposta esperada)
- Ausência de campos obrigatórios
- IDs inexistentes (404 ou objeto vazio, dependendo do endpoint)
- Rotas protegidas: sem token, com token inválido, e com token válido — confirmando que o middleware bloqueia os dois primeiros casos e libera o terceiro

## Comandos úteis

**Preview de `.md` no VS Code:** `⇧⌘V`

**Rodar servidor de desenvolvimento:**
npm run dev

**Abrir Prisma Studio (inspeção visual do banco):**
npx prisma studio

**Rodar migration do Prisma:**
npx prisma migrate dev

**Abrir túnel SSH até o Cloud SQL (dev), via bastion VM:**
gcloud compute ssh bastion-db \
  --zone=southamerica-east1-a \
  --tunnel-through-iap \
  -- -L 5433:IP_PRIVADO_DO_CLOUD_SQL:5432 -N

(mantenha esse terminal aberto enquanto for rodar comandos contra o banco cloud)

**Conectar no banco cloud via psql (com túnel aberto):**
psql "host=localhost port=5433 dbname=postgres user=postgres sslmode=require"

**Rodar migration contra o banco cloud:**
Trocar temporariamente a `DATABASE_URL` do `.env` para apontar para `localhost:5433` (com `sslmode=require`), com o túnel SSH aberto, depois:
npx prisma migrate dev

**Deploy da Cloud Function:**
cd functions
npx prisma generate
firebase deploy --only functions

## Ambientes

Ter apenas "ambiente local" e "produção" cria um problema clássico: código que só foi testado na máquina do desenvolvedor pode falhar de formas inesperadas assim que roda em condições reais de nuvem (rede, variáveis de ambiente, permissões, latência) — o clássico "funciona na minha máquina". Um ambiente intermediário, que espelha a infraestrutura de produção mas não tem usuários reais, existe justamente para capturar esse tipo de problema antes que ele chegue a quem usa o app de verdade.

Por isso, o projeto usa três camadas:

- **Local** — Postgres rodando na própria máquina do desenvolvedor. Usado no dia a dia de desenvolvimento e testes rápidos, sem custo, sem depender de rede.
- **Dev (nuvem)** — instância `finance-app-db-dev` no Cloud SQL, com a Cloud Function já deployada e acessível publicamente. Usado para validar que a integração com a infraestrutura real (rede privada, Secret Manager, ambiente serverless) funciona antes de existir produção de verdade. Não tem garantia de disponibilidade ou dados persistentes — pode ser resetado a qualquer momento.
- **Produção** — ainda não criada. Será uma segunda instância Cloud SQL (`finance-app-db-prod`) e uma segunda