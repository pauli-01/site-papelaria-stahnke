// Regras compartilhadas pelo servidor local e pela hospedagem. Nunca envie chaves ao navegador.
const text = (v) => String(v ?? "").trim();
const normalize = (v) =>
  text(v)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
// Converte reais para centavos inteiros; valor inválido continua sem preço.
export function priceCents(value) {
  if (value === null || value === undefined || text(value) === "") return null;
  let raw =
    typeof value === "number"
      ? String(value)
      : text(value).replace(/^R\$\s*/, "");
  if (raw.includes(",")) {
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(raw)) return null;
    raw = raw.replaceAll(".", "").replace(",", ".");
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;
  const cents = Math.round(Number(raw) * 100);
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 100000000
    ? cents
    : null;
}
export function objects(rows, required) {
  if (!rows?.length) throw new Error("Cabeçalhos da planilha ausentes.");
  const headers = rows[0].map(text);
  if (
    required.some((k) => !headers.includes(k)) ||
    new Set(headers).size !== headers.length
  )
    throw new Error("Cabeçalhos da planilha inválidos.");
  return rows
    .slice(1)
    .filter((r) => r.some((v) => text(v)))
    .map((r, i) => ({
      ...Object.fromEntries(headers.map((k, j) => [k, r[j] ?? ""])),
      row: i + 2,
    }));
}
export function parseCatalog(ranges) {
  const rows = objects(ranges[0], [
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
  ]);
  const errors = [];
  const counts = Object.create(null);
  rows.forEach((r) => (counts[text(r.id)] = (counts[text(r.id)] || 0) + 1));
  const products = [];
  const validID = (id) =>
    /^[a-zA-Z0-9_-]{1,80}$/.test(id) &&
    !["__proto__", "constructor", "prototype"].includes(id);
  for (const r of rows) {
    const id = text(r.id);
    if (!validID(id) || counts[id] > 1) {
      errors.push(
        `Produtos linha ${r.row}: ID inválido ou duplicado; item não publicado.`,
      );
      continue;
    }
    if (normalize(r.ativo) !== "sim") continue;
    if (!text(r.nome) || !text(r.categoria)) {
      errors.push(`Produtos linha ${r.row}: nome ou categoria ausente.`);
      continue;
    }
    const cents = priceCents(r.preco);
    if (cents === null)
      errors.push(`Produtos linha ${r.row}: preço não confirmado.`);
    let image = "";
    if (text(r.imagem_url)) {
      try {
        const u = new URL(text(r.imagem_url));
        if (u.protocol === "https:" && !u.username && !u.password)
          image = u.href;
      } catch {}
      if (!image)
        errors.push(`Produtos linha ${r.row}: URL da imagem inválida.`);
    }
    const available = normalize(r.disponibilidade);
    products.push({
      id,
      sku: text(r.sku),
      name: text(r.nome),
      description: text(r.descricao),
      category: text(r.categoria),
      subcategory: text(r.subcategoria),
      brand: text(r.marca),
      priceCents: cents,
      image,
      alt: text(r.imagem_alt) || text(r.nome),
      availability: ["disponivel", "indisponivel"].includes(available)
        ? available
        : "a confirmar",
      type: text(r.tipo_material),
      ink: text(r.cor_tinta),
      subjects: text(r.numero_materias),
      illustrative: false,
      art: "",
      color: "#edf2e7",
    });
  }
  const lists = objects(ranges[1], [
    "id",
    "colegio",
    "ano",
    "serie_turma",
    "status",
  ]);
  const items = objects(ranges[2], [
    "id",
    "lista_id",
    "nome",
    "quantidade",
    "produtos_ids",
  ]);
  const listCounts = Object.create(null),
    itemCounts = Object.create(null);
  lists.forEach(
    (r) => (listCounts[text(r.id)] = (listCounts[text(r.id)] || 0) + 1),
  );
  items.forEach(
    (r) => (itemCounts[text(r.id)] = (itemCounts[text(r.id)] || 0) + 1),
  );
  const schoolLists = lists
    .filter(
      (l) =>
        validID(text(l.id)) &&
        listCounts[text(l.id)] === 1 &&
        text(l.colegio) &&
        /^20\d{2}$/.test(text(l.ano)) &&
        text(l.serie_turma) &&
        ["confirmada", "pendente", "exemplo"].includes(normalize(l.status)),
    )
    .map((l) => ({
      id: text(l.id),
      school: text(l.colegio),
      year: text(l.ano),
      grade: text(l.serie_turma),
      status: normalize(l.status),
      items: items
        .filter((i) => text(i.lista_id) === text(l.id))
        .map((i) => ({
          id: text(i.id),
          name: text(i.nome),
          qty: Number(i.quantidade),
          products: text(i.produtos_ids)
            .split(",")
            .map(text)
            .filter((id) => products.some((p) => p.id === id)),
        }))
        .filter(
          (i) =>
            validID(i.id) &&
            itemCounts[i.id] === 1 &&
            i.name &&
            Number.isInteger(i.qty) &&
            i.qty >= 1 &&
            i.qty <= 99,
        ),
    }));
  return {
    mode: "connected",
    products,
    schoolLists,
    warningCount: errors.length,
    errors,
  };
}
const base64 = (b) =>
  btoa(String.fromCharCode(...new Uint8Array(b)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
const encode = (o) => base64(new TextEncoder().encode(JSON.stringify(o)));
// Autenticação Google e cache temporário ficam no servidor.
export function createCatalogService(
  fetcher = fetch,
  clock = () => Date.now(),
) {
  let token = null,
    cached = null,
    expires = 0,
    configuration = "";
  let pending = null;
  async function accessToken(env) {
    if (token && token.until > clock()) return token.value;
    const now = Math.floor(clock() / 1000);
    const key = String(env.GOOGLE_PRIVATE_KEY)
      .replaceAll("\\n", "\n")
      .replace(/-----[^-]+-----/g, "")
      .replace(/\s/g, "");
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(key), (c) => c.charCodeAt(0)),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const payload =
      encode({ alg: "RS256", typ: "JWT" }) +
      "." +
      encode({
        iss: env.GOOGLE_CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      });
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(payload),
    );
    const result = await fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: payload + "." + base64(signature),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) throw new Error("Falha na autorização do catálogo.");
    const data = await result.json();
    if (!data.access_token) throw new Error("Autorização inválida.");
    token = {
      value: data.access_token,
      until:
        clock() + Math.max(0, (Number(data.expires_in) || 3600) - 60) * 1000,
    };
    return token.value;
  }
  async function read(env, force = false) {
    if (
      !env.GOOGLE_SHEET_ID ||
      !env.GOOGLE_CLIENT_EMAIL ||
      !env.GOOGLE_PRIVATE_KEY
    )
      return {
        mode: "unconfigured",
        products: [],
        schoolLists: [],
        message: "Conexão com a planilha pendente. Catálogo ilustrativo.",
      };
    const config =
      env.GOOGLE_SHEET_ID +
      "|" +
      env.GOOGLE_CLIENT_EMAIL +
      "|" +
      env.GOOGLE_PRIVATE_KEY;
    if (config !== configuration) {
      configuration = config;
      cached = null;
      token = null;
      expires = 0;
    }
    if (!force && cached && expires > clock()) return cached;
    if (!force && pending) return pending;
    const load = async () => {
      const auth = await accessToken(env);
      const params = new URLSearchParams({
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      for (const range of [
        "Produtos!A1:O5002",
        "Listas!A1:E1002",
        "Itens_listas!A1:E5002",
      ])
        params.append("ranges", range);
      const res = await fetcher(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.GOOGLE_SHEET_ID)}/values:batchGet?${params}`,
        {
          headers: { Authorization: "Bearer " + auth },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!res.ok) throw new Error("Não foi possível atualizar o catálogo.");
      const body = await res.json();
      const ranges = body.valueRanges?.map((v) => v.values || []);
      if (
        !ranges ||
        ranges.length !== 3 ||
        ranges[0].length > 5001 ||
        ranges[1].length > 1001 ||
        ranges[2].length > 5001
      )
        throw new Error("Estrutura ou limite da planilha inválido.");
      const parsed = parseCatalog(ranges);
      cached = { ...parsed, checkedAt: new Date(clock()).toISOString() };
      expires = clock() + 15000;
      return cached;
    };
    if (force) return load();
    pending = load();
    try {
      return await pending;
    } finally {
      pending = null;
    }
  }
  return { read };
}
// Recalcula a sacola com preços do catálogo; não cria pedido nem pagamento.
export function quoteItems(catalog, items) {
  if (!Array.isArray(items) || !items.length || items.length > 100)
    throw new Error("Selecione de 1 a 100 produtos diferentes.");
  const ids = new Set();
  const lines = items.map((i) => {
    if (
      !i ||
      typeof i.id !== "string" ||
      ids.has(i.id) ||
      !Number.isInteger(i.quantity) ||
      i.quantity < 1 ||
      i.quantity > 99
    )
      throw new Error("Produto ou quantidade inválida.");
    ids.add(i.id);
    const p = catalog.products.find((p) => p.id === i.id);
    const eligible =
      !!p && p.priceCents !== null && p.availability === "disponivel";
    return {
      id: i.id,
      name: p?.name || "Produto retirado do catálogo",
      quantity: i.quantity,
      priceCents: p?.priceCents ?? null,
      subtotalCents: eligible ? p.priceCents * i.quantity : null,
      eligible,
      reason: !p
        ? "Produto retirado do catálogo."
        : p.priceCents === null
          ? "Preço a confirmar."
          : p.availability !== "disponivel"
            ? "Disponibilidade não confirmada."
            : "",
      changed: (i.expectedPriceCents ?? null) !== (p?.priceCents ?? null),
    };
  });
  return {
    lines,
    totalCents: lines.every((l) => l.eligible)
      ? lines.reduce((n, l) => n + l.subtotalCents, 0)
      : null,
    changed: lines.some((l) => l.changed),
    eligible: lines.every((l) => l.eligible),
    checkoutEnabled: false,
    message:
      "Consulta atualizada. Pedidos e pagamentos ainda não estão habilitados.",
  };
}
export function createAPI(service = createCatalogService()) {
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  return async (request, env) => {
    const path = new URL(request.url).pathname;
    try {
      if (path === "/api/catalog" && request.method === "GET") {
        const data = await service.read(env);
        const { errors, ...safe } = data;
        return json(safe);
      }
      if (path === "/api/quote" && request.method === "POST") {
        if (
          request.headers.get("Origin") &&
          request.headers.get("Origin") !== new URL(request.url).origin
        )
          return json({ error: "Origem inválida." }, 403);
        const raw = await request.text();
        if (raw.length > 20000)
          return json({ error: "Sacola muito grande." }, 413);
        let body;
        try {
          body = JSON.parse(raw);
        } catch {
          return json({ error: "Dados inválidos." }, 400);
        }
        const data = await service.read(env, true);
        if (data.mode !== "connected")
          return json(
            {
              error:
                "A planilha ainda não está conectada. Nenhum pedido será enviado.",
            },
            503,
          );
        try {
          return json(quoteItems(data, body.items));
        } catch (e) {
          return json({ error: e.message }, 400);
        }
      }
      return json({ error: "Rota não encontrada." }, 404);
    } catch {
      return json(
        {
          error:
            "Não foi possível consultar os produtos agora. Tente novamente. Nenhum pedido foi enviado.",
        },
        503,
      );
    }
  };
}
