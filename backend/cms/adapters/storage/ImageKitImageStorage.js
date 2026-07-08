import { ImageStorage } from "../../application/ports/ImageStorage.js";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/* Simpan gambar ke ImageKit. Mengembalikan URL publik dari ImageKit.
   SDK @imagekit/nodejs (v7.x): init dgn { privateKey }, upload via client.files.upload. */
export class ImageKitImageStorage extends ImageStorage {
  constructor() {
    super();
    this._client = null;
  }

  async _getClient() {
    if (!this._client) {
      const { default: ImageKit } = await import("@imagekit/nodejs");
      this._client = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      });
    }
    return this._client;
  }

  async save({ buffer, mimeType, filename }) {
    const client = await this._getClient();
    const ext = EXT[mimeType] || "bin";
    const safe = String(filename || "img").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40);
    const name = Date.now() + "-" + safe + "." + ext;
    const { toFile } = await import("@imagekit/nodejs");
    const res = await client.files.upload({
      file: await toFile(buffer, name),
      fileName: name,
      folder: "/macanria",
    });
    return res.url;
  }
}
