"use strict";

let schoolState = {
  mode: "",
  school: "",
  grade: "",
  items: [],
  index: 0,
  choices: {},
  transferred: false,
};
let storageOK = true;
let pendingFile = "";
try {
  const raw = JSON.parse(localStorage.getItem("stahnke-school-v1") || "null");
  if (
    raw &&
    Array.isArray(raw.items) &&
    raw.items.length &&
    raw.items.every(
      (x) =>
        typeof x.id === "string" &&
        // IDs sintéticos codificam o tipo completo, sem limitar os IDs da planilha.
        (/^[a-zA-Z0-9_-]{1,80}$/.test(x.id) || /^tipo-(?:[0-9a-f]{2})+$/.test(x.id)) &&
        Number.isInteger(x.qty) &&
        x.qty > 0 &&
        x.qty <= 99,
    )
  ) {
    schoolState = {
      ...schoolState,
      ...raw,
      index: Math.max(
        0,
        Math.min(Number(raw.index) || 0, raw.items.length - 1),
      ),
    };
    if (!schoolState.choices || typeof schoolState.choices !== "object")
      schoolState.choices = {};
  }
  localStorage.removeItem("stahnke-large-type");
} catch {
  storageOK = false;
}
schoolState.transferred = false;
schoolState.cartContribution = {};
// Salva a lista apenas neste navegador, para continuar depois.
function saveSchool() {
  try {
    localStorage.setItem("stahnke-school-v1", JSON.stringify(schoolState));
  } catch {
    storageOK = false;
  }
}
function schoolGo(p) {
  if (page === p) {
    render(true);
  } else location.hash = route(p);
}
function accessibleHeader() {
  const h = header();
  return (
    `<div class="access-bar"><span id="catalog-status" role="status">${typeof catalogStatusText === "function" ? catalogStatusText() : "Preparando catálogo…"}</span><div><a href="${route("contato")}">Preciso de ajuda</a></div></div>` +
    h
      .slice(h.indexOf("<header>"))
      .replace(
        '<a href="' + route("catalogo") + '">Todos os produtos</a>',
        `<a class="list-nav" href="${route("listas")}">Lista escolar</a><a href="${route("catalogo")}">Todos os produtos</a>`,
      )
      .replace(
        "</header>",
        `<nav class="mobile-shortcuts" aria-label="Acessos rápidos"><a href="${route("catalogo")}">Explorar produtos</a><a href="${route("listas")}">Lista escolar</a></nav></header>`,
      )
  );
}
// Página inicial: altere aqui os textos de apresentação da loja.
function schoolHome() {
  return `<main id="main" class="wrap store-home"><section class="store-hero"><div class="hero-copy"><span class="eyebrow">PAPELARIA STAHNKE · PARA O ANO TODO</span><h1>Espaço para suas<br><span>próximas ideias.</span></h1><p>Para estudar, escrever, criar e organizar o dia. Explore os materiais e escolha o que faz sentido para você.</p><p class="shopping-note">Um produto, vários materiais ou uma lista escolar completa: comece como preferir.</p><div class="button-row">${button("Explorar produtos", "catalogo")}${button("Montar lista escolar", "listas", "", true)}</div><small class="demo-note">Demonstração com produtos de exemplo. Sem pedidos ou pagamentos reais.</small></div><div class="store-art" aria-label="Composição ilustrativa de materiais de papelaria">${art({ name: "Caderno ilustrativo", art: "caderno" }, "store-notebook")}${art({ name: "Lápis de cor ilustrativos", art: "lapis" }, "store-pencils")}<span>Estudo · escrita · criatividade · organização</span></div></section><section class="section" aria-labelledby="products-title"><div class="section-head"><div><span class="eyebrow">EXPLORE A PAPELARIA</span><h2 id="products-title">Materiais para o seu dia.</h2><p>Abra os detalhes ou adicione direto à sacola. Produtos ilustrativos; valores e estoque a confirmar.</p></div><a class="text-link" href="${route("catalogo")}">Ver todos os produtos</a></div>${grid(products.slice(0, 4))}</section><section class="school-feature section" aria-labelledby="school-title"><div class="section-head"><div><span class="eyebrow">UM JEITO MAIS FÁCIL DE ORGANIZAR OS MATERIAIS</span><h2 id="school-title">Sua lista escolar, passo a passo.</h2><p>Escolha um modelo por etapa, com as quantidades preenchidas. Marque o que já tem e revise tudo no final.</p></div></div>${entryCards()}<p class="save-note">As listas oficiais serão disponibilizadas após o envio pelos colégios. Nesta prévia, você testa uma lista fictícia.</p>${resumeCard()}<p class="list-bag-note">Produtos avulsos e materiais da lista podem ficar juntos na mesma sacola.</p></section>${contactBanner()}</main>`;
}
function entryCards() {
  return `<div class="entry-grid"><a class="entry-card" href="${route("colegio")}"><span class="entry-number">01</span><h3>Usar a lista do colégio</h3><p>Escolha colégio, ano letivo e série/turma para ver uma lista cadastrada. Nesta prévia, a lista é fictícia.</p><strong>Escolher meu colégio <span aria-hidden="true">→</span></strong></a><a class="entry-card" href="${route("personalizada")}"><span class="entry-number">02</span><h3>Criar minha própria lista</h3><p>Marque os materiais e as quantidades de que precisa. Depois escolha os modelos.</p><strong>Montar uma lista personalizada <span aria-hidden="true">→</span></strong></a></div><div class="photo-help"><div><strong>Tem a lista em foto ou PDF?</strong><p>Teste a seleção do documento neste aparelho. Nenhum arquivo será enviado.</p></div><a class="text-link" href="${route("arquivo")}">Selecionar foto ou PDF</a></div>`;
}
function resumeCard() {
  if (!schoolState.items.length) return "";
  return `<div class="resume-card"><div><strong>Sua lista está aqui.</strong><p>${esc(schoolState.mode === "school" ? schoolState.school + " · " + schoolState.grade : "Lista personalizada")} · ${schoolState.items.length} tipos de material</p></div><div class="button-row"><button class="button" data-school="resume">Continuar minha lista</button><button class="text-button" data-school="delete">Apagar lista salva</button></div></div>`;
}
function schoolLanding() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Lista escolar")}${heading("Vamos montar sua lista?", "Você escolhe um material de cada vez, no seu ritmo.")}${entryCards()}${resumeCard()}<p class="save-note">Sua lista pode ser salva somente neste aparelho. Não é necessário criar uma conta para testar.</p>${contactBanner()}</main>`;
}
function schoolSelect() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Lista do colégio")}${heading("Primeiro, encontre seu colégio.", "As listas oficiais de 2027 serão cadastradas quando os colégios enviarem.")}<div class="school-selection"><form id="school-form" class="panel form-stack"><label class="field">Colégio<select name="school" id="school-choice"><option value="">Selecione o colégio</option><option value="demo">Colégio de demonstração — exemplo</option><option value="pending">Meu colégio ainda não está cadastrado</option></select></label><label class="field">Ano letivo<select name="year"><option>2027</option></select></label><label class="field">Série / turma<select name="grade" required><option value="">Selecione a série</option><option>6º ano — turma de demonstração</option><option>7º ano — turma de demonstração</option></select></label><div class="callout">Esta lista é fictícia, apenas para testar a experiência. Não é uma lista oficial de qualquer colégio.</div><p id="school-error" class="form-error" role="alert"></p><button class="button" type="submit">Ver materiais desta lista</button></form><aside class="school-explainer"><h2>Uma coisa de cada vez.</h2><p>Depois de escolher a turma, você verá os materiais pedidos e escolherá um produto para cada um.</p><ul><li>Quantidades já preenchidas.</li><li>Opção “Já tenho este material”.</li><li>Você pode voltar e trocar uma escolha.</li></ul><h3>A lista ainda não chegou?</h3><p>Nenhuma lista antiga será apresentada como atual. Enquanto isso, você pode montar a sua.</p>${button("Criar minha lista", "personalizada", "", true)}</aside></div></main>`;
}
function customList() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Lista personalizada")}${heading("Do que você precisa?", "Marque os materiais e ajuste as quantidades. Você vai escolher os modelos na próxima etapa.")}<form id="custom-form" class="custom-builder panel"><div class="callout">Catálogo reduzido para demonstração. Na loja real, outros materiais poderão ser cadastrados.</div>${materials.map((m) => `<div class="custom-row"><label><input type="checkbox" name="material" value="${m.id}" ${schoolState.mode === "custom" && schoolState.items.some((x) => x.id === m.id) ? "checked" : ""}><span>${esc(m.name)}</span></label><label class="field quantity-field">Quantidade<input type="number" min="1" max="99" step="1" name="qty-${m.id}" value="${schoolState.mode === "custom" ? schoolState.items.find((x) => x.id === m.id)?.qty || m.qty : m.qty}" aria-label="Quantidade de ${esc(m.name)}"></label></div>`).join("")}<p id="custom-error" class="form-error" role="alert"></p><div class="button-row"><button type="submit" class="button">Começar a escolher os produtos</button><a class="text-link" href="${route("listas")}">Voltar</a></div></form></main>`;
}
function beginList(mode, items, school = "", grade = "") {
  schoolState = {
    mode,
    school,
    grade,
    items: items.map((i) => ({
      ...materials.find((m) => m.id === i.id),
      ...i,
    })),
    index: 0,
    choices: {},
    transferred: false,
  };
  saveSchool();
  schoolGo("montar");
}
function wizard() {
  if (!schoolState.items.length) return schoolLanding();
  const current = schoolState.items[schoolState.index],
    m = materialFor(current.id),
    choice = schoolState.choices[m.id];
  return `<main id="main" class="wrap compact-main wizard-main">${breadcrumb("Montar lista")}<div class="wizard-top"><div><span class="section-label">${schoolState.mode === "school" ? "LISTA DO COLÉGIO · " + esc(schoolState.listStatus || "EXEMPLO") : "SUA LISTA PERSONALIZADA"}</span><p>${esc(schoolState.mode === "school" ? schoolState.school + " · " + schoolState.grade : "Materiais escolhidos por você")}</p></div><a class="text-link" href="${route("contato")}">Preciso de ajuda</a></div><div class="step-label"><strong>Etapa ${schoolState.index + 1} de ${schoolState.items.length}</strong><span>${schoolState.items.length - schoolState.index - 1} ${schoolState.items.length - schoolState.index - 1 === 1 ? "etapa depois desta" : "etapas depois desta"}</span></div><progress value="${schoolState.index + 1}" max="${schoolState.items.length}" aria-label="Progresso da lista"></progress><div class="wizard-question"><h1>Escolha o modelo.</h1><p>Você precisa de <strong>${current.qty} ${esc(m.name)}${current.qty > 1 ? " (unidades)" : ""}</strong>.</p><small>${catalogMode === "connected" ? "Opções compatíveis cadastradas para este material. Se não houver opções, escolha depois ou peça ajuda." : "As opções abaixo são ilustrativas. Modelo, preço e disponibilidade a confirmar."}</small></div><fieldset class="product-options"><legend class="sr-only">Escolha o modelo de ${esc(m.name)}</legend>${m.products
    .filter((id) => products.some((p) => p.id === id))
    .map((id) => {
      const p = products.find((x) => x.id === id);
      return `<label class="option-card ${choice?.product === id ? "selected" : ""}"><input type="radio" name="school-product" value="${id}" ${p.availability === "indisponivel" ? "disabled" : ""} ${choice?.product === id ? "checked" : ""}><div class="option-image" style="background:${p.color}">${art(p)}</div><div class="option-body"><span class="selection-label">${choice?.product === id ? "✓ Selecionado" : "Selecionar este modelo"}</span><h2>${esc(p.name)}</h2><p>${p.illustrative === false ? esc(p.brand || "Produto do catálogo") : "Modelo ilustrativo"}</p><strong>${productPrice(p)}</strong><small>Quantidade na lista: ${current.qty} · ${Number.isInteger(p.priceCents) ? money(p.priceCents * current.qty) : "total a confirmar"}</small></div></label>`;
    })
    .join(
      "",
    )}</fieldset><div class="wizard-alternatives"><button class="button secondary" data-school="have">Já tenho este material</button><button class="text-button" data-school="later">Escolher depois</button></div><div class="wizard-bottom"><button class="button secondary" data-school="back">${schoolState.index ? "Voltar um material" : "Voltar à minha lista"}</button><div><p class="save-note">${storageOK ? "Suas escolhas ficam salvas neste aparelho." : "O navegador não permitiu salvar. Mantenha esta aba aberta."}</p><button class="button" data-school="next" ${!choice ? "disabled" : ""}>${schoolState.index === schoolState.items.length - 1 ? "Revisar minha lista" : "Continuar para " + esc(materialFor(schoolState.items[schoolState.index + 1].id).name.toLowerCase())}</button></div></div></main>`;
}
function advance() {
  schoolState.transferred = false;
  saveSchool();
  if (schoolState.index < schoolState.items.length - 1) {
    schoolState.index++;
    saveSchool();
    render(true);
  } else schoolGo("revisao");
}
// Revisão das escolhas antes de transferir materiais para a sacola.
function listReview() {
  if (!schoolState.items.length) return schoolLanding();
  const selected = schoolState.items.filter(
      (m) => schoolState.choices[m.id]?.status === "selected",
    ),
    pending = schoolState.items.filter(
      (m) =>
        !schoolState.choices[m.id] ||
        schoolState.choices[m.id]?.status === "later",
    );
  return `<main id="main" class="wrap compact-main">${breadcrumb("Revisar lista")}${heading("Vamos conferir sua lista.", "Você pode trocar qualquer escolha antes de continuar.")}<div class="review-stats"><span><strong>${selected.length}</strong> ${selected.length === 1 ? "material escolhido" : "materiais escolhidos"}</span><span><strong>${schoolState.items.length - selected.length - pending.length}</strong> já tenho</span><span><strong>${pending.length}</strong> ${pending.length === 1 ? "pendente" : "pendentes"}</span></div><div class="two-columns"><section class="review-list">${schoolState.items
    .map((m, i) => {
      const c = schoolState.choices[m.id],
        p = products.find((p) => p.id === c?.product),
        meta = materialFor(m.id);
      return `<article class="review-row"><div><h2>${m.qty} × ${esc(meta.name)}</h2><p>${c?.status === "selected" && p ? esc(p.name) : c?.status === "have" ? "✓ Você já tem este material" : "Pendente — escolher depois"}</p><small>${c?.status === "selected" ? (p ? productPrice(p) : "Produto não disponível") : ""}</small></div><button class="text-button" data-school="edit" data-index="${i}">${c?.status === "selected" ? "Trocar produto" : "Escolher produto"}</button></article>`;
    })
    .join(
      "",
    )}</section><aside class="panel summary"><h2>Resumo da lista</h2><p>${selected.reduce((n, m) => n + m.qty, 0)} unidades selecionadas</p><dl><div class="total"><dt>Total</dt><dd>A confirmar</dd></div></dl>${pending.length ? `<div class="callout">${pending.length} ${pending.length === 1 ? "material ficou pendente" : "materiais ficaram pendentes"}. Você pode continuar só com os escolhidos.</div>` : ""}<button class="button full" data-school="transfer" ${!selected.length ? "disabled" : ""}>${schoolState.transferred ? "Ver minha sacola" : "Levar escolhidos para a sacola"}</button><p class="meta-note">Prévia sem pagamento ou pedido real. Itens marcados “Já tenho” não entram na sacola.</p><a href="${route("listas")}" class="text-link">Continuar depois</a></aside></div></main>`;
}
function fileIntake() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Foto ou PDF")}${heading("Sua lista também pode começar aqui.", "Escolha um documento para visualizar como seria pedir ajuda à papelaria.")}<section class="file-panel panel"><div class="callout">Demonstração local: o arquivo não será enviado à papelaria nem guardado. O envio real ainda precisa ser implementado.</div><label class="field">Foto ou PDF da lista<input type="file" id="school-file" accept="image/jpeg,image/png,application/pdf"></label><p id="file-result" role="status">${pendingFile ? esc(pendingFile) : "Formatos: JPG, PNG ou PDF. Até 10 MB."}</p><a class="button" href="${route("contato")}">Ver como falar com a papelaria</a><a class="text-link" href="${route("listas")}">Voltar às opções de lista</a></section></main>`;
}
document.addEventListener("change", (e) => {
  if (e.target.id === "school-choice") {
    const form = e.target.form;
    const pending = e.target.value === "pending";
    form.elements.grade.disabled = pending;
    form.elements.grade.required = !pending;
    document.getElementById("school-error").textContent = pending
      ? "A lista de 2027 do seu colégio ainda não está disponível. Você pode criar uma lista personalizada."
      : "";
  }
  if (e.target.name === "school-product") {
    const id = schoolState.items[schoolState.index].id;
    if (!materialFor(id).products.includes(e.target.value)) return;
    schoolState.choices[id] = { status: "selected", product: e.target.value };
    schoolState.transferred = false;
    saveSchool();
    render();
    const chosen = document.querySelector(
      'input[name="school-product"]:checked',
    );
    chosen?.focus();
  }
  if (e.target.id === "school-file") {
    const f = e.target.files[0];
    pendingFile = !f
      ? "Nenhum arquivo escolhido."
      : !["image/jpeg", "image/png", "application/pdf"].includes(f.type)
        ? "Formato não aceito. Escolha JPG, PNG ou PDF."
        : f.size > 10 * 1024 * 1024
          ? "O arquivo excede 10 MB. Escolha um arquivo menor."
          : f.name +
            " — selecionado neste aparelho. Nenhum arquivo foi enviado.";
    document.getElementById("file-result").textContent = pendingFile;
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "school-form") {
    e.preventDefault();
    const d = new FormData(e.target),
      v = d.get("school");
    if (v !== "demo") {
      document.getElementById("school-error").textContent =
        v === "pending"
          ? "A lista de 2027 do seu colégio ainda não está disponível. Use uma lista personalizada ou fale com a papelaria."
          : "Escolha um colégio para continuar.";
      return;
    }
    beginList(
      "school",
      materials.slice(0, 3).map((m) => ({ id: m.id, qty: m.qty })),
      "Colégio de demonstração",
      d.get("grade"),
    );
  }
  if (e.target.id === "custom-form") {
    e.preventDefault();
    const d = new FormData(e.target),
      ids = d.getAll("material");
    if (!ids.length) {
      document.getElementById("custom-error").textContent =
        "Marque pelo menos um material para continuar.";
      return;
    }
    const items = ids.map((id) => ({ id, qty: Number(d.get("qty-" + id)) }));
    if (
      items.some((x) => !Number.isInteger(x.qty) || x.qty < 1 || x.qty > 99)
    ) {
      document.getElementById("custom-error").textContent =
        "Use quantidades inteiras entre 1 e 99.";
      return;
    }
    beginList("custom", items);
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-school]");
  if (!b) return;
  switch (b.dataset.school) {
    case "resume":
      schoolGo("montar");
      break;
    case "delete":
      if (confirm("Apagar as escolhas desta lista salvas neste aparelho?")) {
        schoolState = {
          mode: "",
          school: "",
          grade: "",
          items: [],
          index: 0,
          choices: {},
          transferred: false,
        };
        saveSchool();
        render();
      }
      break;
    case "have":
    case "later":
      schoolState.choices[schoolState.items[schoolState.index].id] = {
        status: b.dataset.school === "have" ? "have" : "later",
      };
      advance();
      break;
    case "next":
      if (schoolState.choices[schoolState.items[schoolState.index].id])
        advance();
      break;
    case "back":
      if (schoolState.index) {
        schoolState.index--;
        saveSchool();
        render(true);
      } else schoolGo("listas");
      break;
    case "edit":
      schoolState.index = Number(b.dataset.index);
      saveSchool();
      schoolGo("montar");
      break;
    case "transfer":
      if (!schoolState.transferred) {
        for (const [id, n] of Object.entries(
          schoolState.cartContribution || {},
        )) {
          if (cart[id]) {
            cart[id] = Math.max(0, cart[id] - n);
            if (!cart[id]) delete cart[id];
          }
        }
        schoolState.cartContribution = {};
        for (const m of schoolState.items) {
          const c = schoolState.choices[m.id];
          if (
            c?.status === "selected" &&
            products.some(
              (p) => p.id === c.product && p.availability !== "indisponivel",
            )
          ) {
            const before = cart[c.product] || 0;
            cart[c.product] = Math.min(99, before + m.qty);
            cartSnapshots[c.product] = products.find((p) => p.id === c.product);
            schoolState.cartContribution[c.product] =
              (schoolState.cartContribution[c.product] || 0) +
              cart[c.product] -
              before;
          }
        }
        schoolState.transferred = true;
        saveSchool();
      }
      schoolGo("sacola");
      break;
  }
});
