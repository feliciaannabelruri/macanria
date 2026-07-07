import { useCases } from "../../backend/cms/main/container.js";
import { requireLogin } from "../../backend/cms/main/httpAdapter.js";
import { toStatus } from "../../backend/cms/domain/errors.js";

export default async function handler(req, res) {
  const section = req.query.section;
  try {
    if (req.method === "GET") {
      const data = await useCases.getSection(section);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(data);
    }
    if (req.method === "PUT") {
      requireLogin(req);
      const result = await useCases.updateSection(section, req.body);
      return res.status(200).json(result);
    }
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (e) {
    return res.status(toStatus(e)).json({ ok: false, error: e.message });
  }
}