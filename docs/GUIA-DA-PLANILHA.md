# Guia rápido de cadastro

Referência de planilha incluída no projeto original: https://docs.google.com/spreadsheets/d/1H_TDXrhTimsJlNUN5QFlZm1PQ9M73j49j5uHGoQnVOI/edit

O conteúdo e as permissões dessa planilha não foram verificados nesta preparação local. Confirme o acesso antes de cadastrar dados. Para uma planilha própria, use os cabeçalhos de `estrutura-planilha.json` e configure o ID no servidor conforme [o guia de integração](INTEGRACAO-E-HOSPEDAGEM.md).

1. Use **Produtos** para dados reais. A primeira linha deve conter os cabeçalhos usados pela integração, conforme `estrutura-planilha.json`. Preserve os nomes esperados pelo servidor.
2. Preencha `id`, `nome`, `categoria`, `ativo` e `disponibilidade`. Informe preço e demais informações somente quando confirmadas.
3. Use um ID estável, de 1 a 80 letras/números/hífens/underscores, sem espaços. Exemplo de formato: `caneta-preta-001`. Não use `__proto__`, `constructor` ou `prototype`. Nunca reutilize IDs. Não altere IDs para corrigir nomes.
4. Em `preco`, digite um número positivo em reais. Você pode formatar a coluna como moeda brasileira no Google Planilhas; o servidor interpreta valores em reais. Vazio/inválido significa “Preço a confirmar” e bloqueia a elegibilidade da cotação.
5. `ativo`: escolha sim ou não. `disponibilidade`: disponível, indisponível ou a confirmar. Se desejar, configure listas de opções na planilha para facilitar o cadastro. O servidor valida os valores mesmo sem essa configuração.
6. `imagem_url`: endereço HTTPS direto de uma imagem autorizada; `imagem_alt`: descrição curta. Links de páginas do Google Drive não são necessariamente URLs diretas de imagem.
7. `tipo_material`: nome consistente para agrupamento na lista personalizada, por exemplo “Caneta preta”. `cor_tinta` e `numero_materias` registram características; as listas oficiais apontam os IDs compatíveis explicitamente.
8. Para corrigir um produto, altere a mesma linha. Para retirar, use ativo=não. Ordenar linhas não muda os IDs.
9. Após conectar o servidor, mantenha a página aberta e aguarde até 60 segundos em condições normais. Se houver erro, consulte a mensagem do site e as permissões da conta de serviço.

## Listas

Use **Listas** e **Itens_listas**, com os cabeçalhos definidos em `estrutura-planilha.json`. Colégio, ano e série/turma podem ter nomes reais somente após confirmação. Use `pendente` enquanto aguarda o documento, `confirmada` após conferência, e `exemplo` para testes. O requisito aponta para produtos existentes na aba Produtos, nunca para a aba Exemplos.

Exemplo de estrutura (fictício): em Itens_listas, `produtos_ids` pode conter `caderno-10-a,caderno-10-b`. Confirme que ambos atendem à lista antes de cadastrar. Cada item aceita quantidade inteira de 1 a 99. IDs de itens são únicos em toda a aba.

## Limites desta versão

A leitura do servidor abrange até 5.000 linhas de produtos, 1.000 listas e 5.000 itens, sem contar o cabeçalho. Confira se sua planilha possui as linhas e colunas necessárias para os intervalos consultados; esta preparação não redimensiona a planilha remota. Não use como banco de pedidos ou cadastro de clientes. Não digite chaves privadas em nenhuma aba. Não renomeie as abas. Uma falha de cabeçalho bloqueia a leitura em vez de publicar dados incorretos.

## Categorias e subcategorias

O servidor lê **Produtos!A:O**. O cabeçalho `subcategoria` é opcional e pode ser colocado em **Produtos!O1**, depois de `numero_materias`, sem deslocar as colunas existentes. A coluna pode estar ausente ou ficar vazia; isso não altera o preço nem a compatibilidade das listas. Se adicionar a coluna e usar filtros no Google Planilhas, inclua-a no intervalo desses filtros. Nenhuma alteração na planilha remota foi feita nesta preparação. Exemplo: categoria `Escola`, subcategoria `Cadernos e fichários`.

Os nomes disponíveis estão em `public/categorias.js`. O nome antigo **Papelaria Criativa** é aceito como **Criativo** na interface, sem alterar o cadastro. Produtos com outras categorias antigas continuam pesquisáveis no catálogo geral, sem reclassificação automática. Corrija cada linha mantendo o ID. No console do navegador, `console.table(revisarCategorias())` lista os cadastros que precisam de revisão. As categorias não equivalem aos requisitos das listas: continue preenchendo os IDs compatíveis em Itens_listas.
