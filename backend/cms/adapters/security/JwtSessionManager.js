import jwt from "jsonwebtoken";
import { SessionManager } from "../../application/ports/SessionManager.js";
export class JwtSessionManager extends SessionManager {
  #secret; #ttl;
  constructor(secret, ttl = "8h") { super(); this.#secret = secret; this.#ttl = ttl; }
  issue(payload) { return jwt.sign(payload, this.#secret, { expiresIn: this.#ttl }); }
  verify(token) { try { return jwt.verify(token, this.#secret); } catch { return null; } }
}
