import { clearCookie } from "../../backend/cms/main/httpAdapter.js";
export default async function handler(req, res) {
  res.setHeader("Set-Cookie", clearCookie());
  return res.status(200).json({ ok: true });
}
