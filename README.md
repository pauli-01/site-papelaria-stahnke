# Papelaria Stahnke — Essencial

Loja com busca, filtros, detalhes de produtos, sacola e montagem de listas escolares por etapas. Mantém a identidade verde da proposta 01 e o catálogo como principal caminho de compra. A seção “Por onde vamos começar?” foi removida.

**Comece aqui:** abra a pasta que contém `package.json` no VS Code e execute `npm ci` e `npm run dev`. Acesse http://localhost:3000. O projeto foi recuperado do ZIP original, mantendo HTML, CSS, JavaScript, logo e integração com Google Planilhas.

## O que funciona e o que falta

- Catálogo, busca, navegação, sacola, listas do colégio e personalizadas.
- “Já tenho”, “Escolher depois”, revisão sem duplicação e retomada da lista neste navegador.
- Integração preparada com Google Planilhas: depende das credenciais no servidor e de permissão de leitura. Sem isso, funciona com exemplos sem preços confirmados.
- Foto/PDF é somente seleção local. Não é enviado à loja.
- Pagamentos, pedidos reais, frete e reserva de estoque ainda não estão implementados.

O repositório de destino é [pauli-01/site-papelaria-stahnke](https://github.com/pauli-01/site-papelaria-stahnke). Enviar o código a ele não altera a publicação atual automaticamente. O ZIP original não inclui histórico Git nem vínculo interno com o Sites.

## Tecnologias

HTML define a página; CSS cuida do visual; JavaScript controla telas, filtros e sacola. Node.js serve os arquivos e conversa com o Google pelo servidor. Não há React, banco de dados, bundler ou dependências externas de execução. Os testes usam o próprio Node.

## Abrir no VS Code: Windows ou Ubuntu

1. Instale [VS Code](https://code.visualstudio.com/), [Node.js](https://nodejs.org/) versão 22.13 ou superior e [Git](https://git-scm.com/downloads). O npm acompanha o Node.
2. Use a pasta extraída do ZIP ou, depois do primeiro envio ao GitHub, baixe o projeto com os comandos abaixo. Não trabalhe dentro do arquivo compactado.

```sh
git clone https://github.com/pauli-01/site-papelaria-stahnke.git
cd site-papelaria-stahnke
```

3. No VS Code, escolha **Arquivo → Abrir pasta** e selecione a pasta que contém `package.json`. Neste workspace ela é `/workspace/site-papelaria-stahnke`.
4. Abra **Terminal → Novo terminal**. Confira:

```sh
node --version
npm --version
git --version
```

5. Execute um comando por vez:

```sh
npm ci
npm run dev
```

6. Abra http://localhost:3000. Deixe o terminal funcionando.
7. Edite, salve com Ctrl+S e atualize o navegador. O servidor reinicia ao mudar os módulos que ele usa; mudanças na interface precisam de atualização manual da página.
8. Para parar, pressione Ctrl+C no terminal.

Não use apenas Live Server nem abra `index.html` por duplo clique: a leitura da planilha precisa do servidor. Não precisa configurar `.env` para testar os exemplos.

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd ci` e `npm.cmd run dev`, ou abra um terminal de Prompt de Comando. Se a porta 3000 estiver ocupada, copie `.env.example` para `.env`, altere `PORT=3001` e acesse http://localhost:3001. Se um comando não for encontrado após instalar, feche e abra o VS Code.

## Mapa dos arquivos

| Caminho | Para que serve |
| --- | --- |
| `public/index.html` | Título da aba, descrição, ícone e ordem de carregamento dos arquivos |
| `public/loja.js` | Cabeçalho, rodapé, catálogo, detalhes, busca, sacola e navegação |
| `public/listas-escolares.js` | Cabeçalho final (`accessibleHeader()`), página inicial, escolha de colégio, lista personalizada e etapas |
| `public/categorias.js` | Nomes centralizados de categorias e subcategorias; serviços desativados |
| `public/dados-exemplo.js` | Produtos e requisitos fictícios para demonstração |
| `public/catalogo-planilha.js` | Consulta a API e adapta a interface aos produtos reais |
| `public/estilos.css` | Estilos gerais, cores, fontes e layouts |
| `public/listas-escolares.css` | Ajustes da proposta Essencial e telas de listas; carrega depois do CSS geral |
| `public/categorias.css` | Estilos dos filtros e categorias |
| `public/responsivo.css` | Ajustes finais de celular e tablet; carrega por último |
| `public/assets/` | Logo e ilustrações; coloque aqui as imagens locais |
| `server/servidor.mjs` | Inicia o servidor local; expõe somente os arquivos públicos e a API |
| `server/catalogo.mjs` | Autenticação Google, preços, validações, cache e conferência da sacola |
| `scripts/configurar-google.mjs` | Cria `.env` a partir da chave Google guardada no seu computador |
| `scripts/gerar-build.mjs` | Gera pacote opcional para Cloudflare Workers em `dist/` |
| `tests/` | Testes de preços, servidor, catálogo, listas e sacola |
| `docs/GUIA-DA-PLANILHA.md` | Como cadastrar produtos e listas na planilha |
| `docs/INTEGRACAO-E-HOSPEDAGEM.md` | Configuração detalhada do Google e opções de hospedagem |
| `docs/estrutura-planilha.json` | Estrutura das abas e colunas |
| `docs/VERIFICACAO.md` | Resultados e limites dos testes |
| `package.json` | Comandos e requisito de versão do Node |
| `package-lock.json` | Registro de instalação do npm: publique junto do projeto |
| `.env.example` | Modelo de configuração sem chave; pode ir para o GitHub |
| `.gitignore` | Lista de arquivos que o Git deve ignorar |

## Onde editar — exemplos práticos

Use **Ctrl+Shift+F** para procurar um texto em todo o projeto. Altere uma coisa de cada vez e confira no navegador.

### Textos

A apresentação “Espaço para suas…” fica na função `schoolHome()` em `public/listas-escolares.js`. Troque somente as palavras entre as tags. Por exemplo, procure `próximas ideias.` e substitua por `novas descobertas.`. Preserve `<span>`, `</span>` e as expressões `${...}`: elas montam o HTML.

A base do cabeçalho e o rodapé estão em `header()` e `footer()` de `public/loja.js`. O cabeçalho exibido passa por `accessibleHeader()` em `public/listas-escolares.js`, que acrescenta Lista escolar e os acessos rápidos. O título inicial da aba fica em `<title>` de `public/index.html`; `render()` em `loja.js` o atualiza ao navegar.

### Imagens

O original da logo está em `public/assets/logo.png`. A interface e o ícone usam a versão otimizada `public/assets/logo-web.png`. Substitua a imagem exibida mantendo o nome ou atualize suas referências em `brand()` de `loja.js` e em `index.html`. Preserve o original para futuras exportações.

Para uma foto de exemplo, coloque `caneta.jpg` em `public/assets/` e acrescente ao objeto correspondente em `dados-exemplo.js`:

```js
image: "assets/caneta.jpg",
alt: "Caneta preta vista de lado",
```

O campo `art` usa as ilustrações SVG existentes quando não há `image`. Para produtos reais, use `imagem_url` (URL HTTPS direta) e `imagem_alt` na planilha. Não coloque um caminho do seu computador na planilha.

### Cores e fontes

No começo de `public/estilos.css`, o seletor `body` define variáveis como `--green`, `--ink`, `--bg` e `--soft`. Para experimentar outro verde, altere `--green: #006238` e veja o resultado. Alguns blocos têm cores próprias em `listas-escolares.css`, `categorias.css` e `responsivo.css`; use a busca pelo seletor ou pelo código da cor quando a mudança não atingir um bloco.

A fonte principal está em `font-family` e os títulos usam `--title`. Você pode usar `Verdana, Arial, sans-serif` nos dois. Existem declarações locais de fonte e tamanho: procure `font-family` e `font:` para ajustes específicos. Confira celular, contraste e zoom depois de mudar a tipografia.

### Produtos e preços

**Dados reais:** use a aba **Produtos** da [planilha](https://docs.google.com/spreadsheets/d/1H_TDXrhTimsJlNUN5QFlZm1PQ9M73j49j5uHGoQnVOI/edit). Altere `nome`, `preco`, `categoria`, `imagem_url` e `disponibilidade`. `ativo=não` retira o produto. Nunca altere o ID para mudar apenas o nome. O guia de cadastro está em `docs/GUIA-DA-PLANILHA.md`.

Com a integração autenticada, o navegador consulta a cada 30 segundos e o servidor mantém cache por até 15 segundos. Em condições normais, a alteração deve aparecer em até 60 segundos, inclusive com a página aberta. Falhas de rede e abas suspensas podem atrasar.

**Exemplos locais:** edite `products`, `schoolProducts` e `materials` em `public/dados-exemplo.js`. Os preços desses exemplos são intencionalmente tratados como não confirmados por `catalogo-planilha.js`. Para testar preços reais, configure uma planilha de teste. Não remova essa proteção para fingir uma conexão.

Os IDs em `materials.products` precisam corresponder aos IDs dos produtos. Listas oficiais são cadastradas nas abas **Listas** e **Itens_listas**, nunca inventadas no código.

## Partes que foram mantidas para preservar o funcionamento

- Os scripts do navegador compartilham funções. A ordem em `index.html` é: categorias, dados de exemplo, listas escolares, loja e integração. Não troque essa ordem nem adicione `type="module"` isoladamente.
- `catalogo-planilha.js` guarda algumas funções originais e acrescenta o comportamento da planilha. Isso evita duplicar telas, mas significa que um texto pode ser ajustado ali quando o catálogo estiver conectado. Procure o texto no projeto inteiro antes de editar.
- As telas são geradas por funções JavaScript com HTML entre crases. Formatamos o JavaScript, mas preservamos os espaços internos desses textos para não mudar a aparência.
- As chaves Google e a validação dos preços ficam no servidor. Essa separação é necessária: código em `public/` pode ser lido por qualquer visitante.
- A navegação usa `#/essencial/...`. O trecho depois do `#` escolhe a tela, sem precisar de um arquivo HTML por página.
- A lista salva fica neste navegador (`localStorage`), não em uma conta online. A sacola é mantida na sessão da página; recarregar pode esvaziá-la.

## Configurar o Google Planilhas

Sem credenciais, o site exibe os exemplos originais, identificados como ilustrativos e sem preços confirmados. Não há conta de serviço nem chave privada incluída no projeto.

1. No Google Cloud, habilite a API Google Sheets e obtenha uma conta de serviço autorizada pelo responsável pela planilha.
2. Guarde o JSON da conta fora do repositório, ou dentro de `credentials/`, que é ignorada pelo Git.
3. Compartilhe a planilha como **Leitor** com o `client_email` dessa conta.
4. Na pasta do projeto, execute:

```sh
npm run configurar -- "caminho/conta-servico.json" "ID_DA_PLANILHA"
```

Esse comando cria `.env` com permissão restrita e não sobrescreve um arquivo existente. Outra opção é copiar `.env.example` para `.env` e preencher localmente `GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL` e `GOOGLE_PRIVATE_KEY`. A chave PKCS8 deve ficar entre aspas, com `\n` entre linhas. Nunca cole esses valores em `public/`, no README ou no GitHub.

5. Reinicie `npm run dev`. Consulte http://localhost:3000/api/catalog: `mode: "connected"` indica uma leitura autenticada concluída. `unconfigured` mantém os exemplos; erros exigem conferir permissões, variáveis e acesso de rede.

O ID da planilha já aparece no modelo original e não é uma credencial. Uma planilha privada continua exigindo autorização. Na hospedagem, cadastre as três variáveis no painel privado do servidor. A leitura real e a atualização de preços precisam ser conferidas depois dessa configuração; os testes sem credenciais usam transporte simulado. Consulte [o guia de integração](docs/INTEGRACAO-E-HOSPEDAGEM.md) para detalhes.

## Enviar ao GitHub

O destino existente é [pauli-01/site-papelaria-stahnke](https://github.com/pauli-01/site-papelaria-stahnke). No workspace, `origin` já está configurado; não é necessário criar outro repositório nem executar `git init` ou `git remote add` novamente. Estes comandos descrevem o envio; a presença deles no README não confirma que um push foi concluído.

Na pasta do projeto, confira os arquivos e o branch:

```sh
npm test
git status
git branch --show-current
```

Se este ainda for o checkout inicial vazio no branch `work`, renomeie-o para `main` com `git branch -m main` antes do primeiro envio. Em uma cópia já no branch `main`, pule essa etapa. Configure nome/email somente se o Git solicitar, usando seus dados reais:

```sh
git config user.name "Seu nome"
git config user.email "Seu email do GitHub"
```

Depois revise e envie:

```sh
git add .
git diff --cached --name-only
git diff --cached --check
git commit -m "Importa projeto original da Papelaria Stahnke"
git push -u origin main
```

Antes do commit, confirme que `.env`, JSON de conta de serviço, chaves e dados pessoais não estão entre os arquivos preparados. Revise também o conteúdo com `git diff --cached`. Conclua a autenticação pelo Git/VS Code quando solicitada; não escreva tokens em comandos, arquivos ou URLs do remoto. Se o envio for negado, confira a permissão da conta no repositório. Não use `--force` para contornar divergências.

Depois do envio, outro computador pode usar os comandos de `git clone` descritos no começo deste README. Se estiver usando uma extração do ZIP sem pasta `.git`, o caminho mais simples é clonar o repositório já enviado e abrir a cópia clonada no VS Code.

## Atualizar depois

Edite, salve e confira o site. Em seguida:

```sh
npm test
git diff
git add .
git status
git commit -m "Atualiza texto da página inicial"
git push
```

O commit é um ponto salvo no histórico; o push envia esses pontos ao GitHub. No VS Code, **Controle do Código-Fonte** mostra as alterações para revisão. Se editar em outro computador, use `git pull --ff-only` antes de começar, com suas alterações locais já salvas em commit. Se houver divergência, não use `--force`: resolva o conflito antes.

**Enviar ao GitHub não publica automaticamente o site atual.** A hospedagem precisa ser conectada ao repositório ou receber uma publicação separada. GitHub Pages sozinho não executa o servidor Node necessário à planilha. Para uma hospedagem Node, use `npm start`, configure as variáveis privadas no painel e `HOST=0.0.0.0` conforme a plataforma.

## O que não enviar ao GitHub

Não envie `.env`, chaves JSON de conta de serviço, tokens, senhas, arquivos `.pem`/`.key`, dados de clientes ou cópias de pedidos. Guarde chaves fora do projeto, ou em `credentials/` (ignorada). Um JSON com nome aleatório fora dessa pasta não será automaticamente reconhecido como segredo.

O `.gitignore` também exclui `node_modules/`, `dist/`, logs e configurações locais. Ele não remove arquivos que já estavam versionados. Se publicou uma chave por engano, revogue-a no serviço, gere outra e trate o histórico; apagar o arquivo no último commit não resolve o vazamento.

Pode publicar `.env.example` vazio, README, `public/`, `server/`, `scripts/`, `tests/`, `docs/`, `package.json`, `package-lock.json` e `.gitignore`. O ID da planilha não é uma chave de acesso; preserve suas permissões de compartilhamento.

## Comandos úteis

| Comando | Resultado |
| --- | --- |
| `npm ci` | Prepara o projeto preservando o arquivo de dependências travadas |
| `npm run dev` | Inicia o servidor com reinício após mudanças no servidor |
| `npm start` | Inicia o servidor sem monitoramento |
| `npm test` | Executa os testes existentes, sem credenciais Google |
| `npm run configurar -- "caminho/conta-servico.json"` | Cria `.env`; leia antes o guia de integração |
| `npm run build` | Gera `dist/server/index.js` para Worker; não é necessário no VS Code |

O build exportado não inclui o manifesto interno da hospedagem Sites. Para hospedá-lo lá novamente, é necessário associá-lo ao projeto existente. Na hospedagem Node não há etapa de build obrigatória.

Referência do fluxo Git: [documentação oficial do GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

## Navegação, categorias e subcategorias

O cabeçalho mantém estes seis links, nesta ordem: **Lista escolar**, **Todos os produtos**, **Escritório**, **Escola**, **A papelaria**, **Contato**. No celular, o botão Menu abre os links; Escape fecha o menu e devolve o foco ao botão.

O catálogo usa seis categorias fixas, inclusive quando não há produtos: **Escritório**, **Escola**, **Arte e Artesanato**, **Criativo**, **Presentes e Festas** e **Variedades**. Use os filtros Categoria e Subcategoria no catálogo. O nome antigo **Papelaria Criativa** continua aceito como **Criativo**, inclusive em links antigos, sem trocar IDs ou modificar a planilha.

### Onde configurar

- `public/categorias.js`: fonte única dos nomes de categorias, subcategorias, descrições dos grupos e configuração dos serviços.
- `public/categorias.css`: apresentação dos filtros de categorias.
- `public/responsivo.css`: ajustes finais de responsividade, carregados por último.
- `public/loja.js`: menus, filtros, busca e caminho da navegação.
- `public/catalogo-planilha.js`: atualização dos dados e diagnóstico de categorias para revisão.
- `server/catalogo.mjs`: lê `subcategoria` como opcional, preservando IDs, preços e requisitos das listas.
- `public/dados-exemplo.js`: somente os exemplos locais foram classificados; nenhum produto real foi reclassificado.

A ordem dos scripts em `index.html` passa a ser: categorias → dados de exemplo → listas escolares → loja → catálogo da planilha. Os estilos carregam nesta ordem: `estilos.css` → `listas-escolares.css` → `categorias.css` → `responsivo.css`.

### Como cadastrar

Na aba Produtos, mantenha os cabeçalhos existentes. O campo `subcategoria` é opcional: sua ausência ou uma célula vazia não impede a leitura. Para utilizá-lo, adicione o cabeçalho em O1, depois de `numero_materias`, sem deslocar os campos existentes. Esta preparação local não altera nem confirma o conteúdo da planilha remota. O servidor lê A:O. Se mover a coluna para depois de O, ajuste esse intervalo em `server/catalogo.mjs`.

Exemplo de classificação (preencha a linha do produto com seus dados confirmados):

| Campo | Valor |
| --- | --- |
| categoria | Escola |
| subcategoria | Cadernos e fichários |

Digite os nomes exatamente como em `categorias.js`. Não coloque os exemplos descritivos junto do nome: use `Organização`, não `Organização: caixas organizadoras e etiquetas`; use `Desenho`, `Embalagens` e `Datas comemorativas` da mesma forma.

Subcategoria vazia é aceita: o produto aparece em Todos os produtos, na categoria principal e na busca. Um valor antigo como `Estudar` não é transformado automaticamente em `Escola`: o produto permanece no catálogo geral e pode ser encontrado pela busca. Corrija manualmente a mesma linha, sem trocar seu ID. A classificação comercial não altera os IDs compatíveis das listas oficiais.

Para revisar cadastros, abra o site com a planilha conectada, pressione F12, abra **Console** e execute `console.table(revisarCategorias())`. A tabela mostra IDs, nomes e motivos (categoria desconhecida, subcategoria vazia ou incompatível). O console também emite o aviso a cada alteração de catálogo que contenha pendências. Esse diagnóstico não modifica nenhum produto. Subcategoria vazia é uma pendência opcional, não um erro de preço.

Para criar uma nova subcategoria, adicione seu nome ao array `subcategorias` da categoria correta em `categorias.js`, salve e use o mesmo texto na planilha. O link “Montar lista escolar” no filtro Escola abre o montador; não deve ser cadastrado como produto.

### Serviços

Tudo fica desativado por padrão. Em `categorias.js`, `servicosLoja.ativo` habilita o grupo e `confirmado` autoriza cada serviço individualmente. Só mude ambos após confirmação da loja. Edite `descricao` com informações confirmadas. O link Serviços aparece no rodapé apenas quando há pelo menos um serviço confirmado. Os seis links do cabeçalho permanecem na ordem descrita acima. Não há upload, preços ou pedidos de serviços; o atendimento usa a página de contato existente.

### Verificação

Execute `npm test` para conferir a lógica e o servidor e `npm run build` para verificar a geração do pacote opcional. Os testes automatizados de lógica não substituem o uso em navegador. Resultados da verificação deste workspace, larguras exercitadas e pendências estão em [docs/VERIFICACAO.md](docs/VERIFICACAO.md).

A conexão real com Google Planilhas depende das credenciais configuradas separadamente. Pedidos, pagamentos, upload e publicação na hospedagem anterior não são implementados ou ativados por esses comandos.
