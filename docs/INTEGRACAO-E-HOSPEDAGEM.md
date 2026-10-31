# Guia avançado: integração e hospedagem

Para começar no VS Code, use o [README principal](../README.md). Esta cópia exportada não contém o manifesto interno `.openai/hosting.json`. O build é um Worker independente; publicação via Sites exige associar o projeto existente.

# Papelaria Stahnke — Essencial

Projeto funcional do catálogo e da lista escolar, baseado na versão 01 existente. HTML/CSS/JavaScript reaproveitados; servidor Node.js sem dependências externas e API compartilhada com o build opcional para Worker. Essa escolha evita uma reescrita desnecessária e facilita abrir o código no VS Code.

## Estado da entrega

- Site de referência informado: https://stahnke-tres-conceitos.mateuspaulistahnke.chatgpt.site
- Planilha indicada nos arquivos originais: https://docs.google.com/spreadsheets/d/1H_TDXrhTimsJlNUN5QFlZm1PQ9M73j49j5uHGoQnVOI/edit
- Esses endereços são referências do projeto original. Esta preparação local não confirma o conteúdo, as permissões ou o estado atual dessas publicações remotas.
- **Autenticação entre servidor e Google Planilhas pendente.** É necessário configurar a conta de serviço abaixo. Nenhuma credencial foi fornecida e o site não se apresenta como conectado.
- Enquanto faltar configuração, o site preserva o catálogo ilustrativo, sem preços inventados, e as listas de demonstração.
- Depois de uma conexão bem-sucedida, o catálogo mostra apenas as linhas ativas válidas da aba Produtos e deixa de exibir os exemplos locais. Se a aba contiver somente os cabeçalhos, o catálogo ficará vazio. O conteúdo da planilha remota não foi conferido nesta preparação.
- Pedidos, pagamento, frete, reserva de estoque e envio de foto/PDF não foram habilitados. A conferência de preços é funcional quando o catálogo estiver autenticado, mas não confirma uma compra.

## Abrir no VS Code — Windows e Ubuntu

1. Instale Node.js 22.13 ou superior, com npm. Confira `node --version` e `npm --version`.
2. Extraia o ZIP para uma pasta sua; no VS Code, use **Arquivo → Abrir pasta** e selecione a pasta que contém `package.json`.
3. Abra **Terminal → Novo terminal** e execute:

```sh
npm ci
npm run dev
```

4. Abra http://localhost:3000 no navegador. Sem credenciais, é possível testar a demonstração.
5. Para parar, use Ctrl+C no terminal. Alterações em arquivos do servidor reiniciam o processo; alterações na interface aparecem ao atualizar o navegador.

Não abra `index.html` por duplo clique nem use somente Live Server: a integração precisa do servidor Node.

## Conectar a planilha privada

1. No [Google Cloud Console](https://console.cloud.google.com/), crie ou escolha um projeto.
2. Em **APIs e serviços → Biblioteca**, habilite **Google Sheets API**.
3. Em **IAM e administrador → Contas de serviço**, crie uma conta para leitura do catálogo. Não é necessário dar a ela uma função ampla no projeto.
4. Na conta de serviço, em **Chaves**, crie uma chave JSON, se a política da sua organização permitir. Guarde fora da pasta pública do site e fora do Git. Não envie a chave por chat.
5. Abra a planilha e compartilhe **como Leitor** com o endereço `client_email` desse JSON. Mantenha o acesso geral restrito; não publique a planilha para edição.
6. No terminal do VS Code, execute, substituindo o caminho e o ID pela planilha que você confirmou:

Windows (PowerShell):
```powershell
npm run configurar -- "C:\Users\SeuNome\Downloads\conta-servico.json" "ID_DA_PLANILHA"
```

Ubuntu:
```sh
npm run configurar -- "/home/seunome/Downloads/conta-servico.json" "ID_DA_PLANILHA"
```

O comando cria `.env` com o ID informado e as credenciais, sem exibi-las. Se omitir o ID, ele usa a referência incluída no projeto original; confirme que você tem autorização para essa planilha antes de usá-la. Recusa sobrescrever um `.env` existente. Alternativamente, copie `.env.example` para `.env` e preencha-o localmente. O campo GOOGLE_PRIVATE_KEY usa a chave entre aspas com `\n` entre linhas.

7. Reinicie `npm run dev`. Abra `/api/catalog` no navegador: `mode` deve ser `connected`. Não contém chaves. Se a aba Produtos estiver vazia, o catálogo ficará vazio, como esperado.
8. Cadastre dados confirmados. A página já aberta consulta mudanças automaticamente.

O acesso à planilha em outra ferramenta ou na sua conta pessoal não autoriza automaticamente o servidor a lê-la. O servidor usa a conta de serviço configurada e precisa da permissão de leitura correspondente.

## Alterar produtos e preços

Leia [GUIA-DA-PLANILHA.md](GUIA-DA-PLANILHA.md). Use **Produtos**, a partir da linha 2. Não renomeie os cabeçalhos. Um produto ou variante por ID permanente. `ativo=sim` publica; `ativo=não` retira da vitrine. Edite `preco` como número em reais, por exemplo `12,90`.

A aba **Exemplos** não alimenta o site. Nenhum preço de exemplo representa um valor comercial confirmado.

## Sincronização e proteção

- Navegador consulta `/api/catalog` a cada 30 segundos e ao voltar para a aba.
- Servidor mantém cache de até 15 segundos por instância. Com rede e Google funcionando normalmente, a meta é refletir alterações em até 60 segundos. Não é atualização instantânea nem garantia durante falhas, suspensão de aba ou indisponibilidade.
- Sem autenticação, retorna explicitamente `unconfigured`. Em falha após conexão, a interface avisa; a última visualização pode permanecer, mas uma nova cotação falha e nenhuma compra é enviada.
- POST `/api/quote` ignora o cache de produtos e recalcula os valores com dados recém-consultados. Aceita somente IDs e quantidades inteiras de 1 a 99. Valores apresentados pelo navegador servem apenas para detectar alterações, nunca para cobrar.
- IDs duplicados/inválidos são excluídos. Preços vazios, zero, negativos ou inválidos não viram produto grátis. Imagem exige HTTPS; imagem quebrada recebe texto alternativo de indisponibilidade.
- A disponibilidade cadastrada não faz reserva de estoque. Não há endpoint para criar pedidos. `checkoutEnabled` é sempre false.
- Somente escopo Google `spreadsheets.readonly`. Tokens ficam em memória no servidor. `.env` e chaves não são versionados, e o servidor só publica `public/`.
- Imagens externas devem ser de fontes aprovadas pela loja. Os links são usados pelo navegador, sem proxy que baixe URLs arbitrárias no servidor.

## Listas escolares

**Listas:** um ID de lista por colégio/ano/série-turma. Status `pendente`, `confirmada` ou `exemplo`. Não marque uma lista como confirmada sem conferir o documento recebido.

**Itens_listas:** um ID por requisito, ligado ao `lista_id`. Informe o nome, quantidade e os IDs de produtos compatíveis separados por vírgula. Essa relação explícita permite, por exemplo, mostrar somente cadernos de 10 matérias. Cor e número de matérias no catálogo auxiliam a conferência; não há inferência automática de equivalência entre produtos.

A lista personalizada agrupa pelo campo `tipo_material` (ou categoria se vazio). Pode usar “Já tenho”, “Escolher depois”, voltar, revisar e retomar neste aparelho. Dados ficam no localStorage do navegador, não em uma conta. A sacola fica na aba atual. Uma transferência repetida da mesma lista não duplica seus itens; revisões substituem sua contribuição e preservam compras avulsas restantes. Foto/PDF é apenas seleção local, sem upload.

## Comandos

```sh
npm test       # regras de preço, cache, API, listas e sacola
npm run build # empacota o servidor Worker e a interface em dist/
npm start     # executa a aplicação Node, usando public/ e server/
```

O build para Workers não é necessário para `npm start`. O código de negócio é o mesmo nos dois ambientes.

## Publicar com a integração

**Se a hospedagem original oferecer configuração privada para o servidor:** configure GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL e GOOGLE_PRIVATE_KEY nas variáveis/segredos dessa hospedagem. GOOGLE_PRIVATE_KEY deve ser segredo. Nunca colocar esses valores em arquivos dentro de `public/` nem no manifesto. Depois de configurar, publique/reinicie o servidor conforme a hospedagem e verifique `/api/catalog`. Esta preparação não publica nem modifica o endereço de referência. Alterações posteriores na planilha não exigem republicação.

**Em uma hospedagem Node:** envie `public/`, `server/`, `package.json` e `package-lock.json`; configure as mesmas variáveis no painel, `HOST=0.0.0.0` e a PORT exigida pela plataforma. Instalação com `npm ci` e comando de início `npm start`. Use HTTPS fornecido pela hospedagem. Não hospede somente os arquivos estáticos.

**Cloudflare Worker:** `npm run build` produz `dist/server/index.js`, um módulo com `fetch`. Ele inclui os arquivos públicos e consulta a API Google com as variáveis do ambiente. Uma plataforma compatível com módulos Worker poderá usar esse formato; a associação à hospedagem deve ser configurada e verificada separadamente. Não envie `.env` junto do build.

## Estrutura

- `public/`: logo, estilos e interface existente; `catalogo-planilha.js` gerencia atualização e listas reais.
- `server/catalogo.mjs`: leitura autenticada, validação, cache e conferência da sacola.
- `server/servidor.mjs`: execução local/Node.
- `scripts/`: build e configuração local de credenciais.
- `docs/`: guia da planilha, resultados de testes e pendências.
- `tests/`: testes executáveis sem Google e sem credenciais reais.

## Antes de receber compras reais

Consultar [VERIFICACAO.md](VERIFICACAO.md). Além de conectar a planilha e cadastrar produtos, faltam provedor de pagamento, pedidos persistentes, frete/retirada, estoque transacional, dados oficiais da loja e políticas aprovadas. Não há promessa de loja pronta para cobrar nesta entrega.

Referências técnicas: [Google OAuth para contas de serviço](https://developers.google.com/identity/protocols/oauth2/service-account) e [Google Sheets batchGet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet).
