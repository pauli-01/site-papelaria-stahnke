import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
test("Node production entry serves assets and API, never source or environment files", async () => {
  const child = spawn(process.execPath, ["server/servidor.mjs"], {
    env: {
      ...process.env,
      PORT: "35981",
      HOST: "127.0.0.1",
      GOOGLE_SHEET_ID: "",
      GOOGLE_CLIENT_EMAIL: "",
      GOOGLE_PRIVATE_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await Promise.race([
      once(child.stdout, "data"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Startup timeout")), 4000),
      ),
    ]);
    const base = "http://127.0.0.1:35981";
    let r = await fetch(base);
    assert.equal(r.status, 200);
    assert((await r.text()).includes("catalogo-planilha.js"));
    r = await fetch(base + "/api/catalog");
    assert.equal((await r.json()).mode, "unconfigured");
    r = await fetch(base + "/assets/logo-web.png");
    assert.equal(r.status, 200);
    r = await fetch(base + "/.env");
    assert.equal(r.status, 404);
    r = await fetch(base + "/server/catalogo.mjs");
    assert.equal(r.status, 404);
    r = await fetch(base + "/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "x", quantity: 1 }] }),
    });
    assert.equal(r.status, 503);
  } finally {
    child.kill();
    await once(child, "exit");
  }
});
