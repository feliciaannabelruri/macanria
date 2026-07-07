import { useCases } from "../../backend/cms/main/container.js";
import { sessionCookie } from "../../backend/cms/main/httpAdapter.js";
import { toStatus } from "../../backend/cms/domain/errors.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
    const token = await useCases.login({ password: req.body?.password, ip });
    res.setHeader("Set-Cookie", sessionCookie(token));
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(toStatus(e)).json({ ok: false, error: e.message }); }
}
