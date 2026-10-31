import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAPI } from "./catalogo.mjs";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
// Apenas public/ pode ser acessada no navegador.
const root = fileURLToPath(new URL("../public/", import.meta.url));
const api = createAPI();
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
    if (url.pathname.startsWith("/api/")) {
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > 20000) {
          res.writeHead(413);
          res.end("Pedido muito grande");
          return;
        }
        chunks.push(c);
      }
      const r = await api(
        new Request(url, {
          method: req.method,
          headers: req.headers,
          ...(["GET", "HEAD"].includes(req.method)
            ? {}
            : { body: Buffer.concat(chunks) }),
        }),
        process.env,
      );
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(Buffer.from(await r.arrayBuffer()));
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const relative = decodeURIComponent(
      url.pathname === "/" ? "index.html" : url.pathname.slice(1),
    );
    const full = path.resolve(root, relative);
    if (
      !full.startsWith(root) ||
      relative.split("/").some((p) => p.startsWith("."))
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    const content = await fs.readFile(full);
    res.writeHead(200, {
      "Content-Type": types[path.extname(full)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch {
    res.writeHead(404);
    res.end("Página não encontrada");
  }
});
server.listen(
  Number(process.env.PORT) || 3000,
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      "Papelaria Stahnke em http://localhost:" +
        (Number(process.env.PORT) || 3000),
    ),
);
