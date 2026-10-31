import fs from "node:fs/promises";
const [keyPath, sheetId = "1H_TDXrhTimsJlNUN5QFlZm1PQ9M73j49j5uHGoQnVOI"] =
  process.argv.slice(2);
if (!keyPath) {
  console.error(
    'Uso: npm run configurar -- "caminho/conta-servico.json" [id-da-planilha]',
  );
  process.exit(1);
}
try {
  const key = JSON.parse(await fs.readFile(keyPath, "utf8"));
  if (
    key.type !== "service_account" ||
    !key.client_email ||
    !key.private_key?.includes("BEGIN PRIVATE KEY") ||
    !/^[A-Za-z0-9_-]+$/.test(sheetId)
  )
    throw new Error(
      "Arquivo ou ID inválido. Use o JSON de uma conta de serviço Google.",
    );
  await fs.writeFile(
    ".env",
    `GOOGLE_SHEET_ID=${sheetId}\nGOOGLE_CLIENT_EMAIL=${key.client_email}\nGOOGLE_PRIVATE_KEY=${JSON.stringify(key.private_key)}\nPORT=3000\nHOST=127.0.0.1\n`,
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    ".env criado. Compartilhe a planilha como leitor com o client_email do JSON e reinicie npm run dev. Nenhuma chave foi exibida.",
  );
} catch (e) {
  console.error(
    e.code === "EEXIST"
      ? "Já existe um .env. Edite-o localmente; não será sobrescrito."
      : e.message,
  );
  process.exit(1);
}
