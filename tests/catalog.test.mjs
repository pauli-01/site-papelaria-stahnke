import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import {
  priceCents,
  parseCatalog,
  createCatalogService,
  createAPI,
  quoteItems,
} from "../server/catalogo.mjs";
const headers = [
  "id",
  "sku",
  "nome",
  "descricao",
  "categoria",
  "marca",
  "preco",
  "imagem_url",
  "imagem_alt",
  "ativo",
  "disponibilidade",
  "tipo_material",
  "cor_tinta",
  "numero_materias",
];
const row = [
  "caneta-1",
  "001",
  "Caneta de teste",
  "Teste",
  "Escrita",
  "",
  12.9,
  "https://example.com/foto.png",
  "Caneta",
  "sim",
  "disponível",
  "caneta",
  "preta",
  "",
];
const ranges = () => [
  [headers, [...row]],
  [["id", "colegio", "ano", "serie_turma", "status"]],
  [["id", "lista_id", "nome", "quantidade", "produtos_ids"]],
];
test("BRL: blank, zero, invalid, negative and decimal precision", () => {
  for (const [input, want] of [
    ["12,90", 1290],
    [12.9, 1290],
    ["1.234,56", 123456],
    ["", null],
    ["0", null],
    [-1, null],
    ["12,999", null],
    ["abc", null],
    [null, null],
  ])
    assert.equal(priceCents(input), want);
});
test("Duplicate IDs fail closed; inactive rows removed; malformed images not published", () => {
  const r = ranges();
  r[0].push([...row]);
  assert.equal(parseCatalog(r).products.length, 0);
  r[0].pop();
  r[0][1][9] = "não";
  assert.equal(parseCatalog(r).products.length, 0);
  r[0][1][9] = "sim";
  r[0][1][7] = "javascript:alert(1)";
  assert.equal(parseCatalog(r).products[0].image, "");
});
test("Server quote ignores totals sent by browser, detects price changes and deactivation", () => {
  const c = parseCatalog(ranges());
  let q = quoteItems(c, [
    { id: "caneta-1", quantity: 3, expectedPriceCents: 100, totalCents: 1 },
  ]);
  assert.equal(q.totalCents, 3870);
  assert.equal(q.changed, true);
  assert.equal(q.checkoutEnabled, false);
  c.products = [];
  q = quoteItems(c, [{ id: "caneta-1", quantity: 1 }]);
  assert.equal(q.eligible, false);
  assert.equal(q.totalCents, null);
  assert.throws(() =>
    quoteItems(c, [
      { id: "a", quantity: 1 },
      { id: "a", quantity: 1 },
    ]),
  );
});
test("Google transport contract: server cache expiry, forced fresh quote, authentication and errors", async () => {
  let now = 1000000,
    calls = 0,
    fail = false;
  const r = ranges();
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  const env = {
    GOOGLE_SHEET_ID: "test",
    GOOGLE_CLIENT_EMAIL: "test@example.invalid",
    GOOGLE_PRIVATE_KEY: privateKey,
  };
  const fetcher = async (url, options) => {
    if (String(url).includes("oauth2.googleapis.com"))
      return Response.json({ access_token: "test-only", expires_in: 3600 });
    assert(options.headers.Authorization === "Bearer test-only");
    assert(String(url).includes("UNFORMATTED_VALUE"));
    if (fail) return new Response("", { status: 503 });
    calls++;
    return Response.json({ valueRanges: r.map((values) => ({ values })) });
  };
  const service = createCatalogService(fetcher, () => now);
  assert.equal((await service.read(env)).products[0].priceCents, 1290);
  r[0][1][6] = "19,90";
  assert.equal((await service.read(env)).products[0].priceCents, 1290);
  now += 15001;
  assert.equal((await service.read(env)).products[0].priceCents, 1990);
  r[0][1][6] = "21,90";
  const api = createAPI(service);
  let result = await api(
    new Request("http://localhost/api/quote", {
      method: "POST",
      body: JSON.stringify({
        items: [{ id: "caneta-1", quantity: 1, expectedPriceCents: 1990 }],
      }),
    }),
    env,
  );
  assert.equal((await result.json()).totalCents, 2190);
  r[0][1][9] = "não";
  assert.equal((await service.read(env, true)).products.length, 0);
  fail = true;
  now += 16000;
  result = await api(new Request("http://localhost/api/catalog"), env);
  assert.equal(result.status, 503);
  assert.equal(calls, 4);
});
test("No configuration stays explicit; no fake connected result", async () => {
  const api = createAPI();
  const result = await api(new Request("http://localhost/api/catalog"), {});
  assert.equal((await result.json()).mode, "unconfigured");
});

test("Subcategoria opcional preserva IDs, preço, tipo e listas em planilhas antigas", () => {
  const old = ranges();
  old[1].push(["lista-1", "Colégio teste", 2027, "1º ano", "confirmada"]);
  old[2].push(["item-1", "lista-1", "Caneta preta", 3, "caneta-1"]);
  const before = parseCatalog(old);
  assert.equal(before.products[0].subcategory, "");
  old[0][0].push("subcategoria");
  old[0][1].push("Canetas e marca-textos");
  const after = parseCatalog(old);
  assert.equal(after.products[0].subcategory, "Canetas e marca-textos");
  assert.deepEqual(
    { ...after.products[0], subcategory: "" },
    before.products[0],
  );
  assert.deepEqual(after.schoolLists, before.schoolLists);
  assert.equal(after.products[0].category, "Escrita"); // Nunca adivinha uma nova categoria real.
});
