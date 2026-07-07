import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kv } from "@vercel/kv";
import { SCHEMAS } from "../backend/cms/domain/schema/index.js";
import { validate } from "../backend/cms/domain/validate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "content.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

async function main() {
  const sections = Object.keys(SCHEMAS);
  for (const name of sections) {
    if (!(name in data)) {
      console.error("SKIP: section '" + name + "' tidak ada di content.json");
      process.exitCode = 1;
      return;
    }
    // Validasi dulu terhadap schema (menolak field asing, cek jumlah, dll)
    try {
      validate(SCHEMAS[name], data[name]);
    } catch (e) {
      console.error("VALIDASI GAGAL di section '" + name + "': " + e.message);
      process.exitCode = 1;
      return;
    }
    await kv.set("content:" + name, data[name]);
    console.log("OK  content:" + name);
  }
  console.log("Selesai. " + sections.length + " section berhasil di-seed ke KV.");
}

main().catch((e) => { console.error("ERROR:", e.message); process.exitCode = 1; });