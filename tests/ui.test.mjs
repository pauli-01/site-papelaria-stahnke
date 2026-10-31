import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
function app(initial = {}) {
  const handlers = {},
    data = initial;
  const el = {
    innerHTML: "",
    textContent: "",
    focus() {},
    setAttribute() {},
    classList: {
      add() {},
      remove() {},
      toggle() {
        return true;
      },
    },
  };
  const nodes = { app: { ...el }, main: { ...el }, toast: { ...el } };
  const ctx = vm.createContext({
    console,
    TextEncoder,
    CSS: { escape: (s) => s },
    document: {
      activeElement: null,
      body: {},
      documentElement: {
        classList: {
          add() {},
          contains() {
            return false;
          },
        },
      },
      getElementById: (id) => nodes[id] || el,
      querySelector: () => el,
      querySelectorAll: () => [],
      addEventListener: (t, h) => (handlers[t] ??= []).push(h),
    },
    window: { addEventListener() {}, scrollTo() {} },
    location: { hash: "#/essencial/inicio" },
    history: { replaceState() {} },
    localStorage: {
      getItem: (k) => data[k] || null,
      setItem: (k, v) => (data[k] = v),
      removeItem: (k) => delete data[k],
    },
    setTimeout() {},
    setInterval() {},
    clearTimeout() {},
    confirm: () => true,
    navigator: {},
    AbortController,
    AbortSignal,
    fetch: async () => Response.json({ mode: "unconfigured" }),
    Response,
  });
  const run = (s) => vm.runInContext(s, ctx);
  for (const file of [
    "categorias.js",
    "dados-exemplo.js",
    "listas-escolares.js",
    "loja.js",
    "catalogo-planilha.js",
  ])
    run(fs.readFileSync("public/" + file, "utf8"));
  const click = (type, value, id) => {
    const b = { dataset: { [type]: value, id }, setAttribute() {} };
    handlers.click.forEach((h) =>
      h({ target: { closest: (s) => (s === `[data-${type}]` ? b : null) } }),
    );
  };
  return { run, nodes, ctx, click, data };
}
test("Preserved demo routes, search, guided steps and mixed cart without repeat transfer", () => {
  const { run, nodes, ctx, click, data } = app();
  assert(!nodes.app.innerHTML.includes("Aumentar texto"));
  for (const p of [
    "catalogo",
    "produto/caderno",
    "listas",
    "colegio",
    "personalizada",
    "arquivo",
    "sacola",
    "sobre",
    "contato",
    "ajuda",
  ]) {
    ctx.location.hash = "#/essencial/" + p;
    run("navigate()");
    assert(nodes.app.innerHTML.includes("<main"));
  }
  run("query='caneta';category='Todos'");
  assert.equal(run("filtered().length"), 2);
  run(
    "add('caneta-esf',2);beginList('custom',[{id:'caneta',qty:3},{id:'caderno',qty:1},{id:'lapis',qty:2}]);schoolState.choices.caneta={status:'selected',product:'caneta-esf'}",
  );
  click("school", "next");
  click("school", "have");
  click("school", "later");
  assert(run("listReview()").includes("1 material ficou pendente"));
  click("school", "transfer");
  assert.equal(run("cart['caneta-esf']"), 5);
  click("school", "transfer");
  assert.equal(run("cart['caneta-esf']"), 5);
  run(
    "schoolState.choices.caneta={status:'selected',product:'caneta-gel'};schoolState.transferred=false",
  );
  click("school", "transfer");
  assert.equal(run("cart['caneta-esf']"), 2);
  assert.equal(run("cart['caneta-gel']"), 3);
  assert(data["stahnke-school-v1"]);
  assert(run("fileIntake()").includes("não será enviado"));
});
test("Connected catalog renders empty state and arbitrary school materials; removed cart products remain reviewable", () => {
  const { run, nodes, ctx } = app();
  run("catalogMode='connected';products.splice(0);rebuildMaterials()");
  for (const p of ["inicio", "catalogo", "colegio", "personalizada", "sobre"]) {
    ctx.location.hash = "#/essencial/" + p;
    run("navigate()");
    assert(nodes.app.innerHTML.includes("<main"));
  }
  run(
    "products.push({id:'p-1',name:'Caneta <teste>',category:'Escrita',type:'Caneta',priceCents:1290,availability:'disponivel',illustrative:false,art:'',color:'#eee'});rebuildMaterials();beginList('custom',materials.map(m=>({...m,qty:3})));page='montar';render()",
  );
  assert(nodes.app.innerHTML.includes("R$"));
  assert(nodes.app.innerHTML.includes("Caneta &lt;teste&gt;"));
  assert(!nodes.app.innerHTML.includes("Caneta <teste>"));
  run("add('p-1',2);products.splice(0);page='sacola';render()");
  assert(nodes.app.innerHTML.includes("Retirado do catálogo"));
});

test("Categorias, busca ampliada, subcategorias, legado e serviços confirmados", () => {
  const { run, nodes, ctx } = app();
  assert.equal(run("allCategories().length"), 6);
  assert(run("menuCategorias()").includes("Escritório"));
  assert(!run("menuCategorias()").includes("Criativo"));
  assert(!run("schoolHome()").includes("Por onde vamos começar"));
  assert(!run("header()").includes(">Serviços</a>"));
  run(
    "products.splice(0,products.length,{id:'a', name:'Item A', category:'Escola', subcategory:'Cadernos e fichários', description:'Descrição única', priceCents:1290}, {id:'b', name:'Item B', category:'Escola'}, {id:'c', name:'Item C', category:'Estudar'}); category='Escola'; subcategory=''; query=''",
  );
  assert.equal(run("filtered().length"), 2);
  run("subcategory='Cadernos e fichários'");
  assert.equal(run("filtered()[0].id"), "a");
  for (const term of ["descricao unica", "ficharios", "Escola"]) {
    run(`category='Todos'; subcategory=''; query=${JSON.stringify(term)}`);
    assert(run('filtered().some(p=>p.id==="a")'));
  }
  run("query='';category='Variedades'");
  assert.equal(run("filtered().length"), 0);
  assert(run("catalog()").includes("Nenhum item por aqui"));
  run("category='Todos'");
  assert.equal(run("filtered().length"), 3);
  assert(run('revisarCategorias().some(p=>p.id==="c")'));
  ctx.location.hash =
    "#/essencial/catalogo/Escola/Cadernos%20e%20fich%C3%A1rios";
  run("navigate()");
  assert.equal(run("subcategory"), "Cadernos e fichários");
  assert(
    nodes.app.innerHTML.includes('aria-current="page">Cadernos e fichários'),
  );
  assert.equal(run("filtered().length"), 1);
  run("servicosLoja.ativo=true");
  assert(!run("header()").includes(">Serviços</a>"));
  run("servicosLoja.itens[0].confirmado=true");
  assert(run("footer()").includes(">Serviços</a>"));
  assert(run("servicesPage()").includes("Xerox"));
  assert(!run("servicesPage()").includes("Plastificação"));
});

test("Menu simples e nome antigo de Criativo", () => {
 const {run,ctx}=app();
 const nav=run('accessibleHeader()').match(/<nav class="site-nav"[^>]*>(.*?)<\/nav>/s)[1];
 const labels=[...nav.matchAll(/<a[^>]*>(.*?)<\/a>/g)].map(m=>m[1]);
 assert.deepEqual(labels,['Lista escolar','Todos os produtos','Escritório','Escola','A papelaria','Contato']);
 run("products.push({id:'antigo', name:'Produto legado', category:'Papelaria Criativa', subcategory:'Agendas e planners', description:''})");
 ctx.location.hash='#/essencial/catalogo/Papelaria%20Criativa';run('navigate()');
 assert.equal(run('category'),'Criativo');assert(run("filtered().some(p=>p.id==='antigo')"));
 run("query='Criativo'");assert(run("filtered().some(p=>p.id==='antigo')"));
});

test("Lista personalizada retoma materiais com nomes longos sem mudar os IDs", () => {
  const first = app();
  first.run("catalogMode='connected';products.splice(0,products.length,{id:'p1',name:'Produto teste',category:'Escola',type:'Materiais escolares de escrita e desenho'});rebuildMaterials();beginList('custom',[{...materials[0],qty:2}]);");
  const id = first.run("schoolState.items[0].id");
  assert(id.length > 80);
  const resumed = app(first.data);
  assert.equal(resumed.run("schoolState.items.length"), 1);
  assert.equal(resumed.run("schoolState.items[0].id"), id);
  assert.equal(resumed.run("schoolState.items[0].qty"), 2);
});

test("Atualização do catálogo preserva seletores habilitados antes de uma escolha", () => {
  const { run, nodes, ctx } = app();
  for (const id of ["live-year", "live-grade"]) {
    nodes[id] = {
      id, name: id, type: "select-one", tagName: "SELECT",
      value: "", innerHTML: '<option value="">Selecione</option>', disabled: false,
    };
  }
  ctx.document.querySelectorAll = () => [nodes['live-year'], nodes['live-grade']];
  run("page='colegio';renderPreservingForm()");
  assert.equal(nodes['live-year'].disabled, false);
  assert.equal(nodes['live-grade'].disabled, false);
  nodes['live-grade'].disabled = true;
  run("renderPreservingForm()");
  assert.equal(nodes['live-year'].disabled, false);
  assert.equal(nodes['live-grade'].disabled, true);
});
