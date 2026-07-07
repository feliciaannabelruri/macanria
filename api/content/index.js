import { useCases } from "../../backend/cms/main/container.js";
import { SCHEMAS } from "../../backend/cms/domain/schema/index.js";
import { toStatus } from "../../backend/cms/domain/errors.js";
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const out = {};
    for (const name of Object.keys(SCHEMAS)) out[name] = await useCases.getSection(name);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);
  } catch (e) { return res.status(toStatus(e)).json({ ok: false, error: e.message }); }
}
