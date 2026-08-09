
20 endpoints

## Fluxo de uma requisição
1. app.js recebe a requisição e manda pro routes/index.js
2. routes/index.js redireciona pro arquivo de rotas do recurso (ex: /users -> user.routes.js)
3. O arquivo de rotas decide qual função do controller chamar, baseado no verbo HTTP
4. O controller executa a lógica (Prisma) e devolve a resposta

## Prisma
O schema.prisma é onde você define a estrutura dos seus dados — quais campos existem, quais tipos, quais relações. Isso é fixo, é a "planta" do banco. Ele não sabe (nem deveria saber) quais campos uma rota específica quer devolver numa resposta

## Routes
routes/index.js -> onde as coisas estão (organização geral da API)
routes/***.routes.js -> o que existe nesse recurso (o cardápio de operações de category, recurring, transaction, user...)

## Controllers
controllers/***.controller.js -> Como cada operação funciona de verdade

req.params — dados que vêm embutidos na própria URL
req.body — dados que vêm no corpo da requisição, geralmente um JSON

**where** -> Qual registro eu devo modificar
**data** -> Quais valores eu devo escrever nessa linha
**select** -> O que eu devolvo pra você, depois de terminar

## Fluxo de trabalho com Git

1. Criar branch nova a partir da main:
   git checkout -b feat/<entidade>-crud

2. Desenvolver e testar a funcionalidade

3. Conferir o que será commitado:
   git status

4. Adicionar as mudanças ao staging:
   git add .

5. Commitar (Conventional Commits):
   git commit -m "feat: descrição da mudança"

6. Subir a branch pro GitHub (primeira vez, associando com o remoto):
   git push -u origin feat/<entidade>-crud
   (nas vezes seguintes, dentro da mesma branch, só "git push")

7. Abrir um Pull Request no GitHub (Draft PR se ainda não terminou tudo)

8. Quando terminar: finalizar o PR e dar merge na main (pela interface do GitHub)

9.  Voltar pra main localmente:
   git checkout main

10. Puxar as atualizações que vieram do merge:
    git pull

11. Apagar a branch local que já foi mergeada:
    git branch -d feat/<entidade>-crud


### Comandos
#### Visualizar .md no vscode
preview .md ⇧⌘V

#### Rodar prisma server
npx prisma studio
