# Verificação local — 31 de outubro de 2026

Projeto recuperado do ZIP original `Papelaria-Stahnke-GitHub-VSCode.zip` em `/workspace/site-papelaria-stahnke`. O ZIP foi usado como base: não houve reescrita do site. Os arquivos do logo, imagens e ilustrações foram comparados byte a byte com o ZIP e preservados.

A referência online não pôde ser inspecionada: o proxy do ambiente retornou HTTP 403. As conferências visuais abaixo usam o projeto original enviado, e não comprovam igualdade com eventuais mudanças posteriores da publicação online.

## Comandos executados

Ambiente Linux, Node.js 24.19.0, npm 11.9.0 e Chromium 154.

| Comando | Resultado |
| --- | --- |
| `npm ci` | Aprovado, lockfile preservado; nenhuma dependência externa de execução |
| `npm start` | Servidor iniciado; página, arquivos públicos e API respondendo |
| `npm run dev` | Servidor com monitoramento iniciado e API conferida em porta alternativa |
| `npm test` | **13 testes aprovados**, nenhum falhou ou foi ignorado |
| `npm run build` | Pacote Worker gerado em `dist/server/index.js` |

Os testes existentes cobrem preços em reais, IDs duplicados, produtos inativos, imagens inválidas, cache, autenticação com chave descartável e transporte Google simulado, recálculo de valores, ausência de configuração, subcategoria opcional, proteção de arquivos privados, navegação, categorias, sacola e listas. Dois testes de regressão foram adicionados para as correções descritas abaixo. Não foram usadas credenciais reais.

## Navegador real

Playwright foi instalado temporariamente fora do projeto e utilizou o Chromium disponível. A aplicação não ganhou frameworks nem dependências. Em cada largura foram exercitados início, catálogo, filtros, produto, sacola, listas, lista personalizada, etapa, revisão, colégio, seleção de arquivo, sobre, contato e ajuda. O menu aberto também foi medido nas larguras em que aparece.

| Largura | Navegação, busca e filtros | Produto e sacola | Listas e retomada | Sem rolagem horizontal ou erros JavaScript |
| --- | --- | --- | --- | --- |
| 360 px | Aprovado | Aprovado | Aprovado | Aprovado |
| 390 px | Aprovado | Aprovado | Aprovado | Aprovado |
| 430 px | Aprovado | Aprovado | Aprovado | Aprovado |
| 768 px | Aprovado | Aprovado | Aprovado | Aprovado |
| 1280 px | Aprovado | Aprovado | Aprovado | Aprovado |

Verificações realizadas:

- Os seis links do cabeçalho foram conferidos e acionados em todas as larguras, na ordem: Lista escolar, Todos os produtos, Escritório, Escola, A papelaria, Contato.
- Busca por produto, busca sem resultado, limpeza da busca, filtros de categoria/subcategoria e caminho de navegação.
- Detalhes, adição à sacola, aumentar/diminuir quantidade e remover produto.
- Lista personalizada com quantidades, escolha de modelo, “Já tenho”, “Escolher depois”, revisão, retomada após recarregar, transferência repetida e troca de modelo sem duplicação.
- Seleção de colégio, ano e turma dos exemplos originais. Esses exemplos continuam explicitamente fictícios.
- Menu por teclado, Enter, Escape devolvendo foco ao botão, Tab e indicação de foco visível.
- Serviços desativados e rota sem serviço confirmado indisponível.
- Seleção de PDF identificado como teste: somente local, com aviso explícito e sem requisição de upload.
- Textos corridos medidos com pelo menos 16 px; controles e links medidos com área mínima de 44 × 44 px nas telas exercitadas. Pequenos rótulos auxiliares e marca não são tratados como texto corrido.
- Capturas de tela da página inicial nas cinco larguras; desktop e celular inspecionados visualmente.

## Interface com catálogo conectado — simulação

Em 390 e 1280 px, a resposta de `/api/catalog` foi substituída apenas dentro do navegador por dados identificados como teste. Eles não foram inseridos nos arquivos da loja nem na planilha.

Passaram: preços BRL, produtos indisponíveis com adição bloqueada, listas confirmadas/de exemplo/pendentes, bloqueio de lista pendente, opções limitadas aos IDs compatíveis, seletores de ano/turma após atualização, transferência sem duplicação e retomada de material com nome longo. Não houve erro JavaScript ou rolagem horizontal na tela conferida.

**Isso não valida a conexão com Google Sheets.** As três variáveis Google estavam ausentes no ambiente; `/api/catalog` real retornou `mode: "unconfigured"`, como esperado. O ID original foi preservado; nenhum dado remoto foi alterado.

## Ajustes em relação ao ZIP

- Retomada da lista aceita IDs internos longos gerados a partir de nomes de material, preservando os IDs existentes e a validação dos IDs comerciais no servidor.
- Atualização do catálogo mantém o estado habilitado/desabilitado dos seletores de ano e turma.
- Ajustes pontuais de tamanho de textos e áreas de toque, mantendo estrutura, cores, fontes, logo e imagens originais.
- README e guias atualizados em português brasileiro para o repositório existente e configuração separada das credenciais. Afirmações históricas sobre a planilha não foram tratadas como fatos verificados nesta execução.

## Segredos e publicação

A inspeção dos arquivos textuais não encontrou chaves privadas ou tokens reais. `.env.example` contém somente modelo vazio de credenciais e o ID original da planilha, que não é uma chave. O Git ignora `.env`, `credentials/`, `secrets/`, chaves, logs e saídas de build. O servidor entrega somente `public/` e a API, sem expor `.env` ou o código do servidor.

O repositório de destino é `pauli-01/site-papelaria-stahnke`. Enviar código ao GitHub e gerar um build não publicam a hospedagem original. A interface permanece demonstrativa enquanto as credenciais e os dados confirmados não forem configurados.

## Limites e próximos passos

- Configurar credenciais Google separadamente no servidor conforme o README e compartilhar a planilha como Leitor. Não enviar chaves pelo chat ou pelo GitHub.
- Após configurar, conferir `mode: "connected"`, alterar um preço em uma planilha de teste e verificar atualização/cotação. Esse teste real ficou pendente.
- Não foram testados Safari/iOS, aparelhos físicos, leitor de tela, zoom de 200%, Windows ou carga de produção. Chromium foi usado com larguras emuladas.
- Pedidos, pagamentos, frete, reserva de estoque e uploads reais não estão implementados. Serviços permanecem desativados.
- A prévia foi executada localmente. Não há ferramenta de publicação ou túnel de prévia pública disponível nesta sessão; não foi criada uma nova URL pública.
