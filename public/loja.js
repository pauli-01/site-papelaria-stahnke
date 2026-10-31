"use strict";
const themes = {
  essencial: {
    name: "01 · Essencial",
    title: "Ideias simples. Possibilidades infinitas.",
    label: "Um espaço para começar",
    description: "Clareza, respiro e foco nos produtos.",
  },
};

let theme = "essencial",
  page = "inicio",
  param = "",
  query = "",
  category = "Todos",
  subcategory = "",
  sort = "destaques",
  cart = {},
  quantity = 1,
  checkoutStep = 0,
  completed = false;
let catalogMode = "loading",
  catalogError = "",
  schoolLists = [],
  cartSnapshots = {},
  catalogCheckedAt = "";
const money = (c) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    c / 100,
  );
const productPrice = (p) =>
  Number.isInteger(p?.priceCents) ? money(p.priceCents) : "Preço a confirmar";
const allCategories = () => categoriasLoja.map((c) => c.nome);
const materialFor = (id) =>
  schoolState.items.find((m) => m.id === id && m.name) ||
  materials.find((m) => m.id === id) || {
    id,
    name: "Material não disponível",
    products: [],
  };
const cartProduct = (id) =>
  products.find((p) => p.id === id) || {
    ...cartSnapshots[id],
    id,
    name: cartSnapshots[id]?.name || "Produto retirado do catálogo",
    art: "",
    color: "#eee",
    availability: "indisponivel",
  };
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const route = (p = "inicio", id = "", t = theme) =>
  `#/${t}/${p}${id ? "/" + encodeURIComponent(id) : ""}`;
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const art = (p, cls = "") =>
  p.image
    ? `<img class="${cls}" src="${esc(p.image)}" alt="${esc(p.alt || p.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="360" height="300" data-product-image>`
    : p.art === ""
      ? `<span class="text-product-art">${esc(p.name)}<small>Modelo ilustrativo<br>Foto a cadastrar</small></span>`
      : `<img class="${cls}" src="assets/${p.art || p}.svg" alt="Ilustração de ${esc(p.name || p)}" width="360" height="300">`;
const brand = () =>
  `<a class="brand" href="${route()}" aria-label="Papelaria Stahnke, início"><img src="assets/logo-web.png" alt="Logo Papelaria Stahnke" width="46" height="46"><span class="brand-text"><small>Papelaria</small><strong>Stahnke</strong></span></a>`;
const button = (text, p, id = "", secondary = false) =>
  `<a class="button${secondary ? " secondary" : ""}" href="${route(p, id)}">${text}</a>`;
// Cabeçalho: logo, busca e navegação.
function header() {
  return `<div class="concept-bar"><strong>Stahnke · Escolha uma proposta</strong><nav class="concept-links" aria-label="Comparar propostas">${Object.entries(
    themes,
  )
    .map(
      ([k, v]) =>
        `<a class="${theme === k ? "active" : ""}" ${theme === k ? 'aria-current="true"' : ""} href="${route(page, param, k)}">${v.name}</a>`,
    )
    .join(
      "",
    )}</nav></div><div class="notice">PRÉVIA ILUSTRATIVA · Produtos e condições comerciais a confirmar · Sem compras reais</div><header><div class="wrap header-main">${brand()}<form class="search" id="search-form" role="search"><input type="search" name="q" aria-label="Buscar produtos" placeholder="O que você quer encontrar?" value="${esc(query)}"><button type="submit" aria-label="Pesquisar">Buscar</button></form><div class="header-actions"><a href="${route("contato")}">Atendimento</a><a class="cart-link" href="${route("sacola")}" aria-label="Sacola com ${count()} itens"><span class="cart-word">Sacola</span><span class="counter">${count()}</span></a><button class="menu-button" data-action="menu" aria-controls="site-nav" aria-expanded="false">Menu</button></div></div><nav class="site-nav" id="site-nav" aria-label="Navegação principal"><a href="${route("catalogo")}">Todos os produtos</a>${menuCategorias()}<a href="${route("sobre")}">A papelaria</a><a href="${route("contato")}">Contato</a></nav></header>`;
}
// Rodapé e links de atendimento.
function footer() {
  return `<footer class="site-footer"><div class="wrap"><div class="footer-grid"><div>${brand()}<p>Um lugar para suas próximas ideias.</p></div><div><h3>Explore</h3><a href="${route("listas")}">Lista escolar</a><a href="${route("catalogo")}">Todos os produtos</a>${allCategories()
    .map((c) => `<a href="${catalogRoute(c)}">${esc(c)}</a>`)
    .join(
      "",
    )}${servicosConfirmados().length ? `<a href="${route("servicos")}">Serviços</a>` : ""}</div><div><h3>Vamos conversar</h3><a href="${route("sobre")}">A papelaria</a><a href="${route("contato")}">Atendimento</a><a href="${route("ajuda")}">Dúvidas frequentes</a><a href="https://www.instagram.com/papelariastahnke/" target="_blank" rel="noopener noreferrer">Instagram</a></div><div><h3>Sobre esta prévia</h3><p>Catálogo, categorias e textos ilustrativos. Preços, disponibilidade, endereço, entrega e pagamento ainda precisam ser confirmados.</p></div></div><div class="footer-bottom"><span>Papelaria Stahnke · Demonstração da loja</span><span>Sem envio de pedidos ou pagamentos</span></div></div></footer>`;
}
const breadcrumb = (name) =>
  `<nav class="breadcrumb" aria-label="Caminho da página"><a href="${route()}">Início</a><span>/</span><span>${name}</span></nav>`;
const heading = (title, subtitle = "") =>
  `<div class="page-heading"><h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}</div>`;
function card(p) {
  return `<article class="product-card"><a class="product-picture" href="${route("produto", p.id)}" style="background:${p.color}">${p.illustrative === false ? "" : '<span class="badge">Ilustrativo</span>'}${art(p)}</a><a href="${route("produto", p.id)}"><h3>${esc(p.name)}</h3></a><p class="meta">${esc(categoriaAtual(p.category))} · ${p.illustrative === false ? esc(p.brand || "Catálogo") : "Modelo de exemplo"}</p><div class="card-bottom"><strong>${productPrice(p)}</strong><button class="small-add" data-action="add" data-id="${p.id}" ${p.availability === "indisponivel" ? "disabled" : ""} aria-label="Adicionar ${esc(p.name)} à sacola de demonstração">Adicionar</button></div></article>`;
}
function grid(list = products) {
  return `<div class="product-grid">${list.map(card).join("")}</div>`;
}
function categoryCards() {
  return "";
}
function contactBanner() {
  return `<section class="section"><div class="contact-banner"><div><h2>Qual ideia vamos colocar no papel?</h2><p>Converse com a papelaria sobre o que você procura.</p></div>${button("Falar com a papelaria", "contato")}</div></section>`;
}
function home() {
  return schoolHome();
}
// Busca e filtros atuam sobre o catálogo carregado.
function filtered() {
  let list = products.filter(
    (p) =>
      (category === "Todos" || categoriaAtual(p.category) === category) &&
      (!subcategory || p.subcategory === subcategory) &&
      (!query ||
        normal(
          [p.name, p.description, p.category, categoriaAtual(p.category), p.subcategory]
            .filter(Boolean)
            .join(" "),
        ).includes(normal(query))),
  );
  if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  if (sort === "za") list.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
  return list;
}
const normal = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function catalog() {
  const list = filtered();
  return `<main id="main" class="wrap compact-main">${catalogBreadcrumb()}${heading(query ? `Resultados para “${esc(query)}”` : subcategory || (category !== "Todos" ? category : "Todos os produtos"), "Uma seleção ilustrativa para explorar as possibilidades da loja.")}<div class="catalog-layout">${catalogFilters()}<div><div class="catalog-toolbar"><span>${list.length} ${list.length === 1 ? "produto" : "produtos"}</span><label>Ordenar <select id="sort" aria-label="Ordenar produtos"><option value="destaques" ${sort === "destaques" ? "selected" : ""}>Seleção original</option><option value="az" ${sort === "az" ? "selected" : ""}>Nome: A–Z</option><option value="za" ${sort === "za" ? "selected" : ""}>Nome: Z–A</option></select></label></div>${list.length ? grid(list) : `<div class="empty"><h2>Nenhum item por aqui.</h2><p>Tente outro termo ou explore todas as categorias.</p><button class="button" data-action="clear-search">Ver todos os produtos</button></div>`}</div></div>${contactBanner()}</main>`;
}
function product() {
  const p = products.find((p) => p.id === param);
  if (!p) return notFound();
  return `<main id="main" class="wrap">${breadcrumb(`<a href="${route("catalogo")}">Catálogo</a> / ${esc(p.name)}`)}<div class="product-detail"><div><div class="detail-art" style="background:${p.color}">${art(p)}</div><p class="meta-note" style="margin-top:16px">${p.illustrative === false ? "Imagem cadastrada pela loja." : "Imagem ilustrativa. Este item não confirma o catálogo da papelaria."}</p></div><div class="detail-copy"><span class="eyebrow">${esc(categoriaAtual(p.category))} / ${p.illustrative === false ? "CATÁLOGO" : "PRODUTO ILUSTRATIVO"}</span><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><strong class="price">${productPrice(p)}</strong><span class="meta-note">${p.availability === "indisponivel" ? "Indisponível no momento." : p.illustrative === false ? "Disponibilidade: " + esc(p.availability || "a confirmar") + ". Condições a confirmar." : "Modelo, estoque e condições sob consulta."}</span><div class="add-row"><div class="qty"><button data-action="product-minus" aria-label="Diminuir quantidade" ${quantity <= 1 ? "disabled" : ""}>−</button><output aria-label="Quantidade">${quantity}</output><button data-action="product-plus" aria-label="Aumentar quantidade" ${quantity >= 99 ? "disabled" : ""}>+</button></div><button class="button" data-action="add-detail" data-id="${p.id}" ${p.availability === "indisponivel" ? "disabled" : ""}>Adicionar à sacola</button></div><a class="text-link" href="${route("contato")}">Tirar uma dúvida sobre este item</a><div class="detail-info"><details open><summary>Sobre o produto</summary><p>Esta página mostra a experiência de uma loja completa. Na versão real, este espaço receberá descrição, medidas, materiais e fotos aprovados pela papelaria.</p></details><details><summary>Entrega e retirada</summary><p>Modalidades, região atendida, prazo e custo ainda não foram informados. Consulte a papelaria antes de comprar.</p></details><details><summary>Trocas e atendimento</summary><p>As políticas oficiais da loja serão incluídas após validação. Esta demonstração não recebe pedidos.</p></details></div></div></div><section class="section"><div class="section-head"><h2>Continue explorando</h2><a class="text-link" href="${route("catalogo")}">Ver catálogo</a></div>${grid(products.filter((x) => x.id !== p.id))}</section></main>`;
}
function quantityControl(id, n) {
  return `<div class="qty"><button data-action="cart-minus" data-id="${id}" aria-label="Diminuir quantidade de ${esc(cartProduct(id).name)}" ${n <= 1 ? "disabled" : ""}>−</button><output>${n}</output><button data-action="cart-plus" data-id="${id}" aria-label="Aumentar quantidade" ${n >= 99 ? "disabled" : ""}>+</button></div>`;
}
function summary(checkout = false) {
  return `<aside class="panel summary"><h2>Sua seleção</h2><dl><div><dt>Quantidade</dt><dd>${count()} ${count() === 1 ? "item" : "itens"}</dd></div><div><dt>Produtos</dt><dd>Valores a confirmar</dd></div><div><dt>Entrega</dt><dd>A confirmar</dd></div><div class="total"><dt>Total</dt><dd>Sob consulta</dd></div></dl><p class="meta-note">Não há cobrança nesta demonstração. Nenhum pedido será enviado.</p>${checkout ? "" : button("Continuar simulação", "checkout")}<a class="text-link" href="${route("catalogo")}">Continuar explorando</a></aside>`;
}
function bag() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Sacola")}${heading("Sua sacola de ideias.", "Esta seleção é uma simulação e fica apenas nesta aba.")} ${
    !count()
      ? `<div class="empty"><h2>A próxima ideia ainda está por vir.</h2><p>Explore os produtos ilustrativos e adicione seus favoritos.</p>${button("Explorar catálogo", "catalogo")}</div>`
      : `<div class="two-columns"><section aria-label="Itens da sacola">${Object.entries(
          cart,
        )
          .map(([id, n]) => {
            const p = cartProduct(id);
            return `<article class="cart-item">${art(p)}<div><a href="${route("produto", id)}"><h2>${esc(p.name)}</h2></a><p class="meta-note">${productPrice(p)}${products.some((x) => x.id === id) ? "" : " · Retirado do catálogo"}</p><button class="remove" data-action="remove" data-id="${id}">Remover</button></div>${quantityControl(id, n)}</article>`;
          })
          .join("")}</section>${summary()}</div>`
  }</main>`;
}
function checkout() {
  if (catalogMode === "connected") return connectedCheckout();
  if (!count()) return bag();
  let content = "";
  if (checkoutStep === 0)
    content = `<h2>1. Seus dados</h2><div class="callout">Use os dados de exemplo abaixo. Nada será enviado ou armazenado; não informe dados pessoais reais.</div><div class="form-row"><label class="field">Nome de exemplo<input name="nome" required value="Pessoa Exemplo" autocomplete="off"></label><label class="field">E-mail de exemplo<input name="email" type="email" required value="pessoa@example.com" autocomplete="off"></label></div><label class="field">Observação opcional<textarea name="observacao" placeholder="Uma observação de teste, sem dados pessoais"></textarea></label>`;
  if (checkoutStep === 1)
    content = `<h2>2. Recebimento</h2><p class="callout">Estas são opções propostas para o site, não serviços confirmados da papelaria.</p><label class="radio-card"><input name="recebimento" type="radio" value="combinar" checked><span>Combinar com a papelaria<small>Disponibilidade, prazo e custo a confirmar.</small></span></label><label class="radio-card"><input name="recebimento" type="radio" value="entrega"><span>Simular entrega<small>Exemplo de fluxo. Não é necessário informar endereço.</small></span></label><label class="radio-card"><input name="recebimento" type="radio" value="retirada"><span>Simular retirada<small>Local e horário dependerão da confirmação da loja.</small></span></label>`;
  if (checkoutStep === 2)
    content = `<h2>3. Revisar a seleção</h2>${Object.entries(cart)
      .map(([id, n]) => `<p>${n} × ${esc(cartProduct(id).name)}</p>`)
      .join(
        "",
      )}<div class="callout">Pagamento e total a confirmar. Esta prévia não solicita cartão, não gera Pix e não realiza cobranças.</div><label class="filter-label"><input type="checkbox" name="confirm" required>Entendi que este pedido é apenas uma simulação.</label>`;
  return `<main id="main" class="wrap compact-main">${breadcrumb("Simulação de compra")}${heading("Vamos reunir suas ideias.")}<ol class="checkout-steps"><li class="${checkoutStep === 0 ? "current" : ""}">01 · Dados de exemplo</li><li class="${checkoutStep === 1 ? "current" : ""}">02 · Recebimento</li><li class="${checkoutStep === 2 ? "current" : ""}">03 · Revisão</li></ol><div class="two-columns"><form class="panel form-stack" id="checkout-form">${content}<div class="button-row">${checkoutStep ? '<button type="button" class="button secondary" data-action="checkout-back">Voltar</button>' : `<a href="${route("sacola")}" class="text-link">Voltar à sacola</a>`}<button type="submit" class="button">${checkoutStep === 2 ? "Concluir simulação" : "Continuar"}</button></div></form>${summary(true)}</div></main>`;
}
function confirmation() {
  return `<main id="main" class="wrap compact-main"><section class="success"><span class="success-mark" aria-hidden="true">✓</span><span class="eyebrow">${completed ? "EXPERIÊNCIA CONCLUÍDA" : "DEMONSTRAÇÃO"}</span><h1>Suas ideias já têm um lugar.</h1><p>Esta é a tela de confirmação da simulação. Nenhum pedido foi enviado, nenhum pagamento foi realizado e nenhum dado pessoal foi salvo.</p><div class="button-row">${button("Voltar para a loja", "inicio")}${button("Conversar com a papelaria", "contato", "", true)}</div></section></main>`;
}
function about() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("A papelaria")}${heading("Uma boa ideia merece espaço.", "Proposta de apresentação institucional para a Papelaria Stahnke.")}<section class="about-grid"><div class="about-copy"><span class="eyebrow">PAPELARIA STAHNKE</span><h2>Para aprender, experimentar e organizar o dia.</h2><p>Esta proposta reúne materiais para escola, escritório, arte, criatividade, presentes e variedades. É um convite para explorar como a papelaria pode se apresentar na internet.</p><p>A história da loja, os serviços, a equipe e as informações de localização serão acrescentados com os dados oficiais. Nenhuma data de fundação ou característica comercial foi presumida.</p>${button("Conhecer o catálogo ilustrativo", "catalogo")}</div><div class="detail-art">${art({ name: "Caderno ilustrativo", art: "caderno" })}</div></section><section class="section">${categoryCards()}</section>${contactBanner()}</main>`;
}
function contact() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Contato")}${heading("Qual é a sua próxima ideia?", "Monte uma mensagem ou visite o perfil informado da papelaria.")}<div class="contact-grid"><section><div class="contact-card"><span class="eyebrow">VAMOS CONVERSAR</span><h2>Papelaria Stahnke</h2><p>Consulte modelos, preços e disponibilidade diretamente com a loja.</p><a class="button" href="https://www.instagram.com/papelariastahnke/" target="_blank" rel="noopener noreferrer">Abrir Instagram</a></div><div class="contact-card"><h2>Informações da loja</h2><dl><div><dt>Endereço</dt><dd>A confirmar</dd></div><div><dt>Horário</dt><dd>A confirmar</dd></div><div><dt>Telefone / WhatsApp</dt><dd>A confirmar</dd></div></dl><a class="text-link" href="${route("ajuda")}">Ver dúvidas frequentes</a></div></section><form class="panel form-stack" id="contact-form"><h2>Prepare sua mensagem</h2><p class="meta-note">O texto pode ser copiado para você enviar. Nada é enviado automaticamente.</p><label class="field">Assunto<select id="subject"><option>Consulta de produto</option><option>Entrega ou retirada</option><option>Outras dúvidas</option></select></label><label class="field">Mensagem<textarea id="message" required placeholder="Olá! Gostaria de saber mais sobre…"></textarea></label><button class="button" type="submit">Copiar mensagem</button><p id="copy-status" role="status" class="meta-note"></p></form></div></main>`;
}
function help() {
  const qs = [
    [
      "Os produtos e preços são reais?",
      "Não. Este é um estudo de site com itens ilustrativos. Modelos, catálogo, preços e estoque devem ser confirmados pela papelaria.",
    ],
    [
      "Posso comprar nesta página?",
      "Você pode explorar o catálogo, montar uma sacola e testar o fluxo de compra. A conclusão é apenas uma simulação: não há pedidos enviados nem cobranças.",
    ],
    [
      "Quais são as opções de entrega?",
      "Regiões atendidas, prazos, custos e possibilidade de retirada ainda precisam ser definidos com a loja. Nenhuma condição de entrega foi presumida.",
    ],
    [
      "Como falar com a papelaria?",
      "Use o link do Instagram na página de contato. Telefone e WhatsApp não foram adicionados porque esses dados não foram confirmados.",
    ],
    [
      "Como funcionam trocas e devoluções?",
      "A política oficial da loja deverá ser inserida e validada antes da publicação de uma loja real. Esta prévia não substitui essas informações.",
    ],
    [
      "O que acontece com os dados da simulação?",
      "A sacola existe somente nesta aba. A lista escolar é salva neste aparelho quando o navegador permite; você pode apagá-la pela página de listas. Os campos de checkout são demonstrativos e não são enviados.",
    ],
  ];
  return `<main id="main" class="wrap compact-main">${breadcrumb("Ajuda")}${heading("Podemos ajudar?", "As informações que você precisa para explorar esta prévia.")}<section class="faq">${qs.map(([q, a], i) => `<details ${i === 0 ? "open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}</section>${contactBanner()}</main>`;
}
function notFound() {
  return `<main id="main" class="wrap compact-main"><div class="empty"><h1>Página não encontrada.</h1><p>Volte para a loja e continue explorando.</p>${button("Ir para o início", "inicio")}</div></main>`;
}
function render(scroll = false) {
  const active = document.activeElement;
  const focusKey = active?.dataset?.action
    ? { action: active.dataset.action, id: active.dataset.id }
    : null;
  const focusedId = active?.id;
  const focusedValue = active?.name === "category" ? active.value : null;
  document.body.className = theme;
  const views = {
    inicio: home,
    listas: schoolLanding,
    colegio: schoolSelect,
    personalizada: customList,
    montar: wizard,
    revisao: listReview,
    arquivo: fileIntake,
    catalogo: catalog,
    produto: product,
    sacola: bag,
    checkout,
    confirmacao: confirmation,
    sobre: about,
    servicos: servicesPage,
    contato: contact,
    ajuda: help,
  };
  document.title = `${{ inicio: "Início", listas: "Lista escolar", colegio: "Lista do colégio", personalizada: "Lista personalizada", montar: "Escolher materiais", revisao: "Revisar lista", arquivo: "Foto ou PDF", catalogo: "Catálogo", produto: "Produto", sacola: "Sacola", checkout: "Simulação de compra", confirmacao: "Simulação concluída", sobre: "A papelaria", contato: "Contato", servicos: "Serviços", ajuda: "Ajuda" }[page] || "Página"} — Stahnke | ${themes[theme].name}`;
  document.getElementById("app").innerHTML =
    accessibleHeader() + (views[page] || notFound)() + footer();
  if (!scroll) {
    const target = focusKey
      ? document.querySelector(
          `[data-action="${focusKey.action}"]${focusKey.id ? '[data-id="' + focusKey.id + '"]' : ""}`,
        )
      : focusedId
        ? document.getElementById(focusedId)
        : focusedValue
          ? document.querySelector(
              `input[name="category"][value="${focusedValue}"]`,
            )
          : null;
    target?.focus();
  }
  if (scroll) {
    window.scrollTo({ top: 0, behavior: "instant" });
    const main = document.getElementById("main");
    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }
  }
}
// O trecho depois de # na URL determina a tela aberta.
function navigate() {
  if (location.hash === "#main") {
    document.getElementById("main")?.focus();
    return;
  }
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  theme = "essencial";
  page = parts[1] || "inicio";
  try {
    param = decodeURIComponent(parts[2] || "");
  } catch {
    param = "";
  }
  if (page === "catalogo") {
    // Mantém URLs antigas pesquisáveis, sem reclassificar o cadastro.
    category = categoriaAtual(param) || "Todos";
    try {
      subcategory = decodeURIComponent(parts[3] || "");
    } catch {
      subcategory = "";
    }
  }
  quantity = 1;
  checkoutStep = 0;
  render(true);
}
let toastTimer;
function toast(text) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}
function add(id, n = 1) {
  if (
    !products.some((p) => p.id === id) ||
    !Number.isInteger(n) ||
    n < 1 ||
    n > 99
  )
    throw new Error("Produto ou quantidade inválidos");
  if (products.find((p) => p.id === id).availability === "indisponivel") {
    toast("Este produto está indisponível.");
    return;
  }
  cart[id] = Math.min(99, (cart[id] || 0) + n);
  cartSnapshots[id] = products.find((p) => p.id === id);
  render();
  toast("Adicionado à sacola de demonstração.");
  return { produto: id, quantidade: cart[id], itens: count() };
}
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (link?.getAttribute("href")?.includes("/catalogo")) {
    query = "";
    if (location.hash === link.getAttribute("href")) navigate();
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = b.dataset.id;
  switch (b.dataset.action) {
    case "menu": {
      const nav = document.getElementById("site-nav");
      const open = nav.classList.toggle("open");
      b.setAttribute("aria-expanded", String(open));
      b.textContent = open ? "Fechar" : "Menu";
      break;
    }
    case "add":
      add(id);
      break;
    case "add-detail":
      add(id, quantity);
      break;
    case "product-minus":
      quantity = Math.max(1, quantity - 1);
      render();
      break;
    case "product-plus":
      quantity = Math.min(99, quantity + 1);
      render();
      break;
    case "cart-minus":
      if (cart[id]) {
        cart[id] = Math.max(1, cart[id] - 1);
        if (schoolState.cartContribution?.[id])
          schoolState.cartContribution[id] = Math.min(
            schoolState.cartContribution[id],
            cart[id],
          );
      }
      render();
      break;
    case "cart-plus":
      if (cart[id]) cart[id] = Math.min(99, cart[id] + 1);
      render();
      break;
    case "remove":
      delete cart[id];
      if (schoolState.cartContribution) delete schoolState.cartContribution[id];
      schoolState.transferred = false;
      render();
      toast("Item removido.");
      break;
    case "clear-search":
      query = "";
      category = "Todos";
      subcategory = "";
      param = "";
      history.replaceState(null, "", route("catalogo"));
      render();
      break;
    case "checkout-back":
      checkoutStep = Math.max(0, checkoutStep - 1);
      render();
      break;
  }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "category") {
    category = e.target.value;
    subcategory = "";
    param = category === "Todos" ? "" : category;
    history.replaceState(null, "", route("catalogo", param));
    render();
  }
  if (e.target.id === "subcategory-filter") {
    subcategory = e.target.value;
    history.replaceState(null, "", catalogRoute(category, subcategory));
    render();
  }
  if (e.target.id === "sort") {
    sort = e.target.value;
    render();
  }
});
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (e.target.id === "search-form") {
    query = new FormData(e.target).get("q").trim();
    category = "Todos";
    subcategory = "";
    if (page === "catalogo") {
      param = "";
      history.replaceState(null, "", route("catalogo"));
      render();
    } else location.hash = route("catalogo");
  }
  if (e.target.id === "checkout-form") {
    if (checkoutStep < 2) {
      checkoutStep++;
      render(true);
    } else {
      completed = true;
      cart = {};
      schoolState.cartContribution = {};
      schoolState.transferred = false;
      location.hash = route("confirmacao");
    }
  }
  if (e.target.id === "contact-form") {
    const text =
      document.getElementById("subject").value +
      "\n\n" +
      document.getElementById("message").value;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById("copy-status").textContent =
        "Mensagem copiada. Agora você pode colar e enviar no Instagram.";
    } catch {
      document.getElementById("copy-status").textContent =
        "Selecione e copie o texto da mensagem manualmente. O navegador não permitiu a cópia automática.";
      document.getElementById("message").select();
    }
  }
});
products.push(...schoolProducts);
window.addEventListener("hashchange", navigate);
navigate();
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  for (const tool of [
    {
      name: "stahnke_list_demo_products",
      description:
        "Lista os produtos ilustrativos desta prévia. Não confirma catálogo real.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: () => ({ products }),
    },
    {
      name: "stahnke_add_demo_item",
      description:
        "Adiciona um produto à sacola local de demonstração. Não envia pedido nem cobra valores.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", enum: products.map((p) => p.id) },
          quantity: { type: "integer", minimum: 1, maximum: 99 },
        },
        required: ["id", "quantity"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (x) => add(x.id, x.quantity),
    },
  ]) {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}

// Links com categoria e subcategoria também funcionam ao recarregar ou voltar.
function catalogRoute(cat = "Todos", sub = "") {
  return (
    route("catalogo", cat === "Todos" ? "" : cat) +
    (sub ? "/" + encodeURIComponent(sub) : "")
  );
}
function menuCategorias() {
  return ["Escritório", "Escola"].map(nome => `<a href="${catalogRoute(nome)}">${esc(nome)}</a>`).join("");
}
function catalogBreadcrumb() {
  let content = `<a href="${route()}">Início</a><span>/</span><a href="${catalogRoute()}">Todos os produtos</a>`;
  if (category !== "Todos")
    content += `<span>/</span><a href="${catalogRoute(category)}">${esc(category)}</a>`;
  if (subcategory)
    content += `<span>/</span><span aria-current="page">${esc(subcategory)}</span>`;
  return `<nav class="breadcrumb" aria-label="Caminho da página">${content}</nav>`;
}
function catalogFilters() {
  const options = subcategoriasDe(category);
  // URLs antigas ou valores desconhecidos continuam legíveis, sem alterar dados.
  const current =
    category !== "Todos" && !allCategories().includes(category)
      ? [category]
      : [];
  return `<aside class="filters taxonomy-filters" aria-label="Filtros do catálogo"><label class="field" for="category-filter">Categoria<select id="category-filter" name="category">${["Todos", ...allCategories(), ...current].map((c) => `<option value="${esc(c)}" ${category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>${category !== "Todos" ? `<label class="field" for="subcategory-filter">Subcategoria<select id="subcategory-filter" name="subcategory"><option value="">Todas as subcategorias</option>${[...new Set([...options, ...(subcategory ? [subcategory] : [])])].map((c) => `<option value="${esc(c)}" ${subcategory === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>` : ""}${detalhesSubcategorias[subcategory] ? `<p>${esc(detalhesSubcategorias[subcategory])}</p>` : ""}${category === "Escola" ? `<a class="text-link" href="${route("listas")}">Montar lista escolar</a>` : ""}</aside>`;
}
function servicesPage() {
  const services = servicosConfirmados();
  if (!services.length) return notFound();
  return `<main id="main" class="wrap compact-main">${breadcrumb("Serviços")}${heading("Serviços da papelaria", "Fale com a papelaria para combinar os detalhes do atendimento.")}<div class="services-grid">${services.map((s) => `<section class="panel"><h2>${esc(s.nome)}</h2><p>${esc(s.descricao)}</p><a class="text-link" href="${route("contato")}">Consultar atendimento</a></section>`).join("")}</div></main>`;
}
// Escape fecha o submenu e devolve o foco ao controle que o abriu.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const details = e.target.closest(".category-menu[open]");
  if (details) {
    details.open = false;
    details.querySelector("summary").focus();
  }
});

// Mantém o submenu dentro da tela, mesmo perto da borda direita.
document.addEventListener(
  "toggle",
  (e) => {
    const menu = e.target;
    if (!menu.matches?.(".category-menu") || !menu.open) return;
    for (const other of document.querySelectorAll(".category-menu[open]")) {
      if (other !== menu) other.open = false;
    }
    const panel = menu.querySelector(".category-submenu");
    panel.style.left = "";
    if (window.innerWidth > 800) {
      const box = panel.getBoundingClientRect();
      panel.style.left = Math.min(0, window.innerWidth - 16 - box.right) + "px";
    }
  },
  true,
);

// Fecha a navegação por toque fora do cabeçalho, escolha de link ou Escape.
function closeMobileMenu(returnFocus = false) {
  const nav = document.getElementById("site-nav");
  const button = document.querySelector('[data-action="menu"]');
  nav?.classList.remove("open");
  if (button) { button.setAttribute("aria-expanded", "false"); button.textContent = "Menu"; if(returnFocus) button.focus(); }
}
document.addEventListener("click", e => {
  if (e.target.closest('#site-nav a') || !e.target.closest('header')) closeMobileMenu();
});
document.addEventListener("keydown", e => { if(e.key === "Escape") closeMobileMenu(true); });
