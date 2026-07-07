import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { ImageStorage } from "../../application/ports/ImageStorage.js";
export class BlobImageStorage extends ImageStorage {
  async save({ buffer, mimeType, filename }) {
    const key = "uploads/" + Date.now() + "-" + randomUUID() + "-" + filename;
    const { url } = await put(key, buffer, { access: "public", contentType: mimeType });
    return url;
  }
}
