import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ContentRepository } from "../../application/ports/ContentRepository.js";

/* Adapter persistensi berbasis file untuk mode LOKAL / VPS tanpa KV.
   Menyimpan seluruh konten dalam satu file JSON (per-section key),
   dengan backup otomatis per-save ke folder backups/. Interface identik
   dengan KvContentRepository sehingga bisa ditukar tanpa mengubah usecase. */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/cms/adapters/persistence -> naik 4 level ke root project
const ROOT = path.resolve(__dirname, "..", "..", "..", "..");

export class FileContentRepository extends ContentRepository {
  constructor(opts = {}) {
    super();
    this.file = opts.file || path.join(ROOT, "content.json");
    this.backupDir = opts.backupDir || path.join(ROOT, "backups");
  }

  async #loadAll() {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      if (e.code === "ENOENT") return {};
      throw e;
    }
  }

  async #saveAll(obj) {
    const tmp = this.file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(obj, null, 2), "utf8");
    await fs.rename(tmp, this.file); // tulis atomik
  }

  async read(section) {
    const all = await this.#loadAll();
    return all[section] ?? null;
  }

  async write(section, data) {
    const all = await this.#loadAll();
    all[section] = data;
    await this.#saveAll(all);
  }

  async backup(section) {
    const cur = await this.read(section);
    if (cur == null) return;
    await fs.mkdir(this.backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = path.join(this.backupDir, `${section}-${stamp}.json`);
    await fs.writeFile(dest, JSON.stringify(cur, null, 2), "utf8");
  }
}