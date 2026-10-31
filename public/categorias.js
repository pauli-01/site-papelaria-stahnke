// Edite somente esta estrutura para mudar o menu e os filtros.
// Os nomes devem ser iguais aos campos categoria/subcategoria da planilha.
const categoriasLoja = [
  {
    nome: "Escritório",
    subcategorias: [
      "Papéis e blocos",
      "Pastas e arquivos",
      "Canetas e marca-textos",
      "Organização",
      "Informática e acessórios",
    ],
  },
  {
    nome: "Escola",
    subcategorias: [
      "Cadernos e fichários",
      "Lápis, borrachas e apontadores",
      "Mochilas e estojos",
      "Lancheiras e garrafas",
      "Livros didáticos e paradidáticos",
    ],
    listaEscolar: true,
  },
  {
    nome: "Arte e Artesanato",
    subcategorias: [
      "Tintas e pincéis",
      "Telas e papéis especiais",
      "Desenho",
      "EVA, feltro e aviamentos",
      "Cola quente e colas em geral",
    ],
  },
  {
    nome: "Criativo",
    subcategorias: [
      "Cadernos decorados",
      "Agendas e planners",
      "Adesivos e washi tape",
      "Canetas e marcadores coloridos",
    ],
  },
  {
    nome: "Presentes e Festas",
    subcategorias: [
      "Embalagens",
      "Cartões",
      "Balões e decoração",
      "Datas comemorativas",
    ],
  },
  {
    nome: "Variedades",
    subcategorias: [
      "Brinquedos e jogos",
      "Utilidades domésticas",
      "Livros de colorir",
    ],
  },
];
// Explique os grupos sem transformar exemplos em produtos disponíveis.
const detalhesSubcategorias = {
  Organização: "Caixas organizadoras e etiquetas",
  "Informática e acessórios": "Pen drives, calculadoras, pilhas e cabos",
  Desenho: "Lápis de cor e nanquim",
  Embalagens: "Sacolas, caixas, papel de presente e fitas",
  "Datas comemorativas": "Páscoa, Natal e outras datas",
};
// Ative o grupo E cada serviço somente depois de a loja confirmar a oferta.
const servicosLoja = {
  ativo: false,
  itens: [
    { nome: "Xerox", confirmado: false, descricao: "Cópias de documentos." },
    {
      nome: "Impressão",
      confirmado: false,
      descricao: "Impressão de documentos.",
    },
    {
      nome: "Encadernação",
      confirmado: false,
      descricao: "Encadernação de materiais.",
    },
    {
      nome: "Plastificação",
      confirmado: false,
      descricao: "Plastificação de documentos.",
    },
  ],
};
const servicosConfirmados = () =>
  servicosLoja.ativo ? servicosLoja.itens.filter((s) => s.confirmado) : [];
const subcategoriasDe = (nome) =>
  categoriasLoja.find((c) => c.nome === nome)?.subcategorias || [];
// Diagnóstico para o responsável: não altera produtos reais nem seus IDs.
function revisarCategorias(catalogo = products) {
  return catalogo.flatMap((p) => {
    const categoria = categoriasLoja.find((c) => c.nome === categoriaAtual(p.category));
    const motivos = [];
    if (!categoria)
      motivos.push("Categoria fora do menu: " + (p.category || "vazia"));
    if (!p.subcategory)
      motivos.push("Subcategoria ainda não preenchida (opcional)");
    else if (categoria && !categoria.subcategorias.includes(p.subcategory))
      motivos.push("Subcategoria fora desta categoria: " + p.subcategory);
    return motivos.length
      ? [{ id: p.id, nome: p.name, motivos: motivos.join("; ") }]
      : [];
  });
}

// Mantém cadastros e links antigos funcionando sem alterar a planilha.
function categoriaAtual(nome) { return nome === "Papelaria Criativa" ? "Criativo" : nome; }
