import fs from "node:fs/promises";
import path from "node:path";
const assets = {};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
async function walk(dir, prefix = "") {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const key = prefix + "/" + e.name;
    if (e.isDirectory()) await walk(path.join(dir, e.name), key);
    else
      assets[key] = {
        type: types[path.extname(e.name)] || "application/octet-stream",
        data: (await fs.readFile(path.join(dir, e.name))).toString("base64"),
      };
  }
}
await walk("public");
await fs.rm("dist", { recursive: true, force: true });
await fs.mkdir("dist/server", { recursive: true });
const core = await fs.readFile("server/catalogo.mjs", "utf8");
await fs.writeFile(
  "dist/server/index.js",
  core +
    "\nconst assets=" +
    JSON.stringify(assets) +
    ';\nconst api=createAPI();export default {async fetch(request,env){const p=new URL(request.url).pathname;if(p.startsWith("/api/"))return api(request,env);if(!["GET","HEAD"].includes(request.method))return new Response("Método inválido",{status:405});const a=assets[p==="/"?"/index.html":p];if(!a)return new Response("Página não encontrada",{status:404});return new Response(request.method==="HEAD"?null:Uint8Array.from(atob(a.data),c=>c.charCodeAt(0)),{headers:{"Content-Type":a.type,"Cache-Control":"no-cache","X-Content-Type-Options":"nosniff"}})}};',
);
console.log("Build criado em dist/server/index.js");

// Preserva o vínculo da publicação existente; opcional na cópia para VS Code.
try { await fs.mkdir("dist/.openai", {recursive:true}); await fs.copyFile(".openai/hosting.json", "dist/.openai/hosting.json"); } catch(e) { if(e.code!=="ENOENT") throw e; }
