"use strict";
// O navegador consulta nossa API. As chaves do Google ficam apenas no servidor.
const demoProducts = products.map((p) => ({
  ...p,
  illustrative: true,
  priceCents: null,
}));
const demoMaterials = materials.map((m) => ({ ...m }));
let refreshing = false,
  lastCatalogSignature = "",
  quoteResult = null,
  quoteBusy = false,
  quoteError = "";
function catalogStatusText() {
  if (catalogError)
    return "Não foi possível atualizar os produtos. Tente novamente em instantes.";
  if (catalogMode === "connected")
    return "Catálogo da loja · pedidos e pagamentos ainda não habilitados";
  return "Prévia ilustrativa · conexão com a planilha pendente";
}
function statusUpdate() {
  const el = document.getElementById("catalog-status");
  if (el) el.textContent = catalogStatusText();
}
function rebuildMaterials() {
  if (catalogMode !== "connected") return;
  const groups = new Map();
  for (const p of products) {
    const type = p.type || p.category;
    const id =
      "tipo-" +
      Array.from(new TextEncoder().encode(type))
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
    if (!groups.has(id))
      groups.set(id, { id, name: type, qty: 1, products: [] });
    groups.get(id).products.push(p.id);
  }
  materials.splice(0, materials.length, ...groups.values());
}
function updateSavedList() {
  for (const m of schoolState.items) {
    if (!m.name) {
      const old = demoMaterials.find((x) => x.id === m.id);
      if (old)
        Object.assign(m, { name: old.name, products: [...old.products] });
    }
    const current = schoolState.listId
      ? schoolLists
          .find((l) => l.id === schoolState.listId)
          ?.items.find((i) => i.id === m.id)
      : materials.find((i) => i.id === m.id);
    if (current) {
      m.products = [...current.products];
      m.name = current.name;
      if (schoolState.listId && m.qty !== current.qty) {
        m.qty = current.qty;
        schoolState.transferred = false;
      }
    } else if (catalogMode === "connected")
      m.products = (m.products || []).filter((id) =>
        products.some((p) => p.id === id),
      );
    const c = schoolState.choices[m.id];
    if (
      c?.status === "selected" &&
      (!products.some(
        (p) => p.id === c.product && p.availability !== "indisponivel",
      ) ||
        !m.products?.includes(c.product))
    ) {
      schoolState.choices[m.id] = { status: "later" };
      schoolState.transferred = false;
    }
  }
  saveSchool();
}
function renderPreservingForm() {
  if (page === "arquivo") {
    statusUpdate();
    return;
  }
  const active = document.activeElement,
    activeId = active?.id,
    activeName = active?.name,
    selection = active?.selectionStart;
  const values = [
    ...document.querySelectorAll("input:not([type=file]),select,textarea"),
  ].map((el) => ({
    id: el.id,
    name: el.name,
    type: el.type,
    value: el.value,
    checked: el.checked,
    disabled: el.disabled,
    options: el.tagName === "SELECT" ? el.innerHTML : null,
  }));
  render();
  for (const v of values) {
    let selector = v.name ? `[name="${CSS.escape(v.name)}"]` : null;
    if (v.type === "checkbox" || v.type === "radio")
      selector += `[value="${CSS.escape(v.value)}"]`;
    const el = v.id
      ? document.getElementById(v.id)
      : selector
        ? document.querySelector(selector)
        : null;
    if (!el) continue;
    if (v.id === "live-year" || v.id === "live-grade") {
      el.innerHTML = v.options;
      el.disabled = v.disabled;
    }
    if (v.type === "checkbox" || v.type === "radio") el.checked = v.checked;
    else el.value = v.value;
  }
  const target = activeId
    ? document.getElementById(activeId)
    : activeName
      ? document.querySelector(`[name="${CSS.escape(activeName)}"]`)
      : null;
  if (target) {
    target.focus({ preventScroll: true });
    if (typeof selection === "number" && target.setSelectionRange)
      try {
        target.setSelectionRange(selection, selection);
      } catch {}
  }
}
// Atualiza produtos sem recarregar a página e preserva os campos preenchidos.
async function refreshCatalog() {
  if (refreshing) return;
  refreshing = true;
  try {
    const res = await fetch("/api/catalog", {
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    catalogError = "";
    if (data.mode === "connected") {
      const signature = JSON.stringify([data.products, data.schoolLists]);
      const changed = signature !== lastCatalogSignature;
      catalogMode = "connected";
      catalogCheckedAt = data.checkedAt;
      schoolLists = data.schoolLists || [];
      if (changed) {
        lastCatalogSignature = signature;
        products.splice(0, products.length, ...data.products);
        rebuildMaterials();
        updateSavedList();
        const revisao = revisarCategorias();
        if (revisao.length)
          console.warn("Cadastros para revisar (IDs preservados):", revisao);
        quoteResult = null;
        renderPreservingForm();
      }
    } else {
      if (catalogMode === "connected") {
        catalogError = "Conexão indisponível";
      } else {
        catalogMode = "unconfigured";
        statusUpdate();
      }
    }
    statusUpdate();
  } catch {
    catalogError = "Falha de conexão";
    statusUpdate();
  } finally {
    refreshing = false;
  }
}
// Adapta as telas existentes ao catálogo real sem duplicar toda a interface.
const originalHome = schoolHome;
schoolHome = function () {
  let html = originalHome();
  if (catalogMode === "connected")
    html = html
      .replace(
        "Categorias sugeridas para esta demonstração, ainda não confirmadas.",
        "Explore as categorias do catálogo.",
      )
      .replace(
        "Produtos ilustrativos; valores e estoque a confirmar.",
        "Preços e disponibilidade conforme o cadastro da loja.",
      )
      .replace(
        "Demonstração com produtos ilustrativos. Sem pedidos ou pagamentos reais.",
        "Catálogo para consulta. Pedidos e pagamentos ainda não habilitados.",
      )
      .replace(
        "Nesta prévia, você testa uma lista fictícia.",
        "Consulte a situação de cada lista antes de começar.",
      );
  return html;
};
const originalGrid = grid;
grid = function (list = products) {
  return list.length
    ? originalGrid(list)
    : '<div class="empty"><h3>Produtos em preparação.</h3><p>O catálogo ainda não tem produtos ativos. Fale com a papelaria para consultar materiais.</p></div>';
};
const originalCatalog = catalog;
catalog = function () {
  return originalCatalog()
    .replace(
      "Uma seleção ilustrativa para explorar as possibilidades da loja.",
      catalogMode === "connected"
        ? "Explore os produtos cadastrados pela papelaria."
        : "Uma seleção ilustrativa para explorar as possibilidades da loja.",
    )
    .replace(
      "Categorias sugeridas",
      catalogMode === "connected" ? "Categorias" : "Categorias sugeridas",
    );
};
const originalFooter = footer;
footer = function () {
  let html = originalFooter();
  if (catalogMode === "connected")
    html = html
      .replace("Sobre esta prévia", "Informações da loja")
      .replace(
        "Catálogo, categorias e textos ilustrativos. Preços, disponibilidade, endereço, entrega e pagamento ainda precisam ser confirmados.",
        "Produtos e preços conforme o cadastro. Endereço, entrega, atendimento e pagamento serão publicados após confirmação.",
      )
      .replace("Demonstração da loja", "Catálogo da loja");
  return html;
};
const originalSchoolSelect = schoolSelect;
schoolSelect = function () {
  if (catalogMode !== "connected") return originalSchoolSelect();
  return `<main id="main" class="wrap compact-main">${breadcrumb("Lista do colégio")}${heading("Encontre sua lista escolar.", "Escolha o colégio, o ano letivo e a série/turma.")}<form id="connected-school-form" class="panel form-stack"><label class="field">Colégio<select id="live-school" name="school" required><option value="">Selecione</option>${[...new Set(schoolLists.map((l) => l.school))].map((s) => `<option>${esc(s)}</option>`).join("")}</select></label><label class="field">Ano letivo<select id="live-year" name="year" required disabled><option value="">Escolha o colégio primeiro</option></select></label><label class="field">Série / turma<select id="live-grade" name="list" required disabled><option value="">Escolha o ano primeiro</option></select></label><p id="live-list-status" role="status">${schoolLists.length ? "As listas pendentes ainda não podem ser usadas." : "Nenhuma lista cadastrada por enquanto. Use a lista personalizada."}</p><button class="button" type="submit">Ver materiais desta lista</button><a href="${route("personalizada")}" class="text-link">Criar lista personalizada</a></form></main>`;
};
const originalCustom = customList;
customList = function () {
  return originalCustom().replace(
    "Catálogo reduzido para demonstração. Na loja real, outros materiais poderão ser cadastrados.",
    catalogMode === "connected"
      ? "Escolha os tipos de material cadastrados no catálogo."
      : "Catálogo reduzido para demonstração. Na loja real, outros materiais poderão ser cadastrados.",
  );
};
const originalSummary = summary;
summary = function (checkout = false) {
  if (catalogMode !== "connected") return originalSummary(checkout);
  const entries = Object.entries(cart);
  const valid = entries.every(([id]) => {
    const p = products.find((x) => x.id === id);
    return (
      p && Number.isInteger(p.priceCents) && p.availability === "disponivel"
    );
  });
  const total = valid
    ? entries.reduce(
        (n, [id, qty]) =>
          n + products.find((x) => x.id === id).priceCents * qty,
        0,
      )
    : null;
  return `<aside class="panel summary"><h2>Sua seleção</h2><dl><div><dt>Quantidade</dt><dd>${count()} itens</dd></div><div class="total"><dt>Produtos</dt><dd>${total === null ? "A confirmar" : money(total)}</dd></div><div><dt>Entrega</dt><dd>A confirmar</dd></div></dl><p>Os valores serão consultados novamente antes de continuar.</p>${button("Conferir valores atualizados", "checkout")}<p class="meta-note">Nenhum pedido ou pagamento será realizado nesta versão.</p><a href="${route("catalogo")}" class="text-link">Continuar explorando</a></aside>`;
};
function connectedCheckout() {
  return `<main id="main" class="wrap compact-main">${breadcrumb("Revisar valores")}${heading("Confira sua seleção.", "Vamos consultar os valores e a disponibilidade novamente.")}<section class="panel form-stack"><div class="callout">Pedidos, pagamento e frete ainda não estão habilitados. Esta conferência não envia uma compra.</div><button class="button" data-live="quote" ${quoteBusy ? "disabled" : ""}>${quoteBusy ? "Consultando…" : "Consultar valores da sacola"}</button><p role="alert">${esc(quoteError)}</p>${quoteResult ? `<div role="status">${quoteResult.changed ? '<p class="callout">Houve alteração de preço. Confira os valores abaixo antes de prosseguir.</p>' : ""}${quoteResult.lines.map((l) => `<p>${l.quantity} × ${esc(l.name)} — ${l.priceCents === null ? "Preço a confirmar" : money(l.priceCents)}${l.reason ? " · " + esc(l.reason) : ""}</p>`).join("")}<h2>Produtos: ${quoteResult.totalCents === null ? "A confirmar" : money(quoteResult.totalCents)}</h2><p>${esc(quoteResult.message)}</p></div>` : ""}<a class="text-link" href="${route("sacola")}">Voltar à sacola</a></section></main>`;
}
document.addEventListener("change", (e) => {
  if (e.target.id === "live-school") {
    const year = document.getElementById("live-year");
    year.innerHTML =
      '<option value="">Selecione o ano</option>' +
      [
        ...new Set(
          schoolLists
            .filter((l) => l.school === e.target.value)
            .map((l) => l.year),
        ),
      ]
        .sort()
        .map((y) => `<option>${esc(y)}</option>`)
        .join("");
    year.disabled = !e.target.value;
    document.getElementById("live-grade").innerHTML =
      '<option value="">Escolha o ano primeiro</option>';
    document.getElementById("live-grade").disabled = true;
  }
  if (e.target.id === "live-year") {
    const school = document.getElementById("live-school").value;
    const grade = document.getElementById("live-grade");
    grade.innerHTML =
      '<option value="">Selecione a série/turma</option>' +
      schoolLists
        .filter((l) => l.school === school && l.year === e.target.value)
        .map(
          (l) =>
            `<option value="${l.id}">${esc(l.grade)} · ${esc(l.status)}</option>`,
        )
        .join("");
    grade.disabled = !e.target.value;
  }
  if (e.target.id === "live-grade") {
    const l = schoolLists.find((l) => l.id === e.target.value);
    document.getElementById("live-list-status").textContent = l
      ? l.status === "confirmada"
        ? "Lista cadastrada como confirmada pela loja."
        : l.status === "exemplo"
          ? "Lista de exemplo: não é uma lista oficial."
          : "Lista pendente: aguarde o envio e a conferência pelo colégio."
      : "";
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id !== "connected-school-form") return;
  e.preventDefault();
  const l = schoolLists.find(
    (l) => l.id === new FormData(e.target).get("list"),
  );
  if (!l || l.status === "pendente" || !l.items.length) {
    document.getElementById("live-list-status").textContent =
      "Esta lista ainda não está pronta. Use a lista personalizada ou peça ajuda.";
    return;
  }
  beginList("school", l.items, l.school, l.year + " · " + l.grade);
  schoolState.listId = l.id;
  schoolState.listStatus = l.status;
  saveSchool();
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest('[data-live="quote"]');
  if (!b || quoteBusy) return;
  quoteBusy = true;
  quoteError = "";
  quoteResult = null;
  render();
  try {
    const items = Object.entries(cart).map(([id, quantity]) => ({
      id,
      quantity,
      expectedPriceCents: cartSnapshots[id]?.priceCents ?? null,
    }));
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    quoteResult = data;
  } catch (e) {
    quoteError =
      e.message || "Não foi possível conferir os valores. Tente novamente.";
  } finally {
    quoteBusy = false;
    if (page === "checkout") render();
  }
});
document.addEventListener(
  "error",
  (e) => {
    if (e.target.matches?.("img[data-product-image]")) {
      const span = document.createElement("span");
      span.className = "text-product-art";
      span.textContent = "Imagem não disponível";
      e.target.replaceWith(span);
    }
  },
  true,
);
setInterval(refreshCatalog, 30000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshCatalog();
});
refreshCatalog();
