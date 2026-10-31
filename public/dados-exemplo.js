// Produtos e materiais ilustrativos. Com a planilha conectada, o catálogo real substitui estes exemplos.
const products = [
  {
    id: "caderno",
    name: "Caderno de ideias",
    category: "Escola",
    subcategory: "Cadernos e fichários",
    art: "caderno",
    color: "#e5edcc",
    description:
      "Um espaço para anotações, estudos e ideias que merecem sair da cabeça. Produto genérico usado para demonstrar esta página.",
  },
  {
    id: "lapis",
    name: "Lápis de cor",
    category: "Arte e Artesanato",
    subcategory: "Desenho",
    art: "lapis",
    color: "#f7dfc3",
    description:
      "Cores para experimentar traços, combinações e novos desenhos. Ilustração conceitual, sem marca, quantidade ou composição confirmadas.",
  },
  {
    id: "bloco",
    name: "Bloco de anotações",
    category: "Escritório",
    subcategory: "Papéis e blocos",
    art: "bloco",
    color: "#eae5d4",
    description:
      "Uma ideia de produto para lembretes, listas e pequenos planos. Formato, material e disponibilidade serão definidos pela papelaria.",
  },
  {
    id: "estojo",
    name: "Estojo para materiais",
    category: "Escola",
    subcategory: "Mochilas e estojos",
    art: "estojo",
    color: "#eddfd1",
    description:
      "Uma proposta de item para reunir os materiais do dia a dia. Imagem ilustrativa; cores, tamanho e modelo não representam um produto confirmado.",
  },
];
const schoolProducts = [
  {
    id: "cad-espiral",
    name: "Caderno 10 matérias · espiral",
    category: "Escola",
    subcategory: "Cadernos e fichários",
    art: "caderno",
    color: "#e4eccd",
    description:
      "Exemplo compatível com o requisito de 10 matérias. Capa, marca, número de folhas e valor ainda serão cadastrados.",
  },
  {
    id: "cad-capa",
    name: "Caderno 10 matérias · capa dura",
    category: "Escola",
    subcategory: "Cadernos e fichários",
    art: "caderno",
    color: "#f1e0c5",
    description:
      "Alternativa ilustrativa de caderno de 10 matérias. Modelo, estoque e preço dependem de confirmação.",
  },
  {
    id: "caneta-esf",
    name: "Caneta preta · esferográfica",
    category: "Escritório",
    subcategory: "Canetas e marca-textos",
    art: "",
    color: "#e9ece5",
    description:
      "Modelo ilustrativo de caneta preta. Marca, espessura da ponta, preço e estoque a confirmar.",
  },
  {
    id: "caneta-gel",
    name: "Caneta preta · gel",
    category: "Escritório",
    subcategory: "Canetas e marca-textos",
    art: "",
    color: "#e5e7ee",
    description:
      "Modelo ilustrativo de caneta preta. Esta alternativa só será oferecida na loja real se atender à exigência da escola.",
  },
  {
    id: "lapis-hb",
    name: "Lápis grafite · HB",
    category: "Escola",
    subcategory: "Lápis, borrachas e apontadores",
    art: "",
    color: "#f2e4c9",
    description:
      "Exemplo de lápis grafite HB. Material, marca e preço a confirmar.",
  },
  {
    id: "lapis-tri",
    name: "Lápis grafite · triangular",
    category: "Escola",
    subcategory: "Lápis, borrachas e apontadores",
    art: "",
    color: "#e5eddf",
    description:
      "Alternativa ilustrativa de lápis grafite para esta demonstração. Características reais dependem do cadastro.",
  },
];
const materials = [
  {
    id: "caderno",
    name: "Caderno de 10 matérias",
    qty: 1,
    products: ["cad-espiral", "cad-capa"],
    hint: "Escolha 1 caderno. As duas opções abaixo são exemplos de 10 matérias.",
  },
  {
    id: "caneta",
    name: "Caneta preta",
    qty: 3,
    products: ["caneta-esf", "caneta-gel"],
    hint: "Escolha um modelo. A quantidade de 3 canetas já está preenchida.",
  },
  {
    id: "lapis",
    name: "Lápis grafite",
    qty: 2,
    products: ["lapis-hb", "lapis-tri"],
    hint: "Escolha o modelo de lápis que prefere.",
  },
  {
    id: "estojo",
    name: "Estojo",
    qty: 1,
    products: ["estojo"],
    hint: "Escolha um estojo para reunir seus materiais.",
  },
];
