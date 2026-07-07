import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageStorage } from "../../application/ports/ImageStorage.js";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/cms/adapters/storage -> project root (4x up), lalu frontend/uploads
const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "..", "frontend", "uploads");

/* Simpan gambar ke frontend/uploads/ untuk lokal/VPS. URL publik: /uploads/<file>. */
export class LocalImageStorage extends ImageStorage {
  async save({ buffer, mimeType, filename }) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = EXT[mimeType] || "bin";
    const safe = String(filename || "img").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40);
    const name = Date.now() + "-" + randomUUID().slice(0, 8) + "-" + safe + "." + ext;
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    return "/uploads/" + name;
  }
}
