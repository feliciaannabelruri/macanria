import { useCases } from "../backend/cms/main/container.js";
import { requireLogin } from "../backend/cms/main/httpAdapter.js";
import { toStatus } from "../backend/cms/domain/errors.js";
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  try {
    requireLogin(req);
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
    const mimeType = req.headers["content-type"] || "";
    const filename = (req.headers["x-filename"] || "upload").toString();
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const buffer = Buffer.concat(chunks);
    const result = await useCases.uploadImage({ buffer, mimeType, filename });
    return res.status(200).json(result);
  } catch (e) { return res.status(toStatus(e)).json({ ok: false, error: e.message }); }
}
