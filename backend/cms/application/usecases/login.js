import { AuthError, RateLimitError } from "../../domain/errors.js";
export const makeLogin = ({ passwordHasher, session, rateLimiter, adminPasswordHash }) =>
  async ({ password, ip }) => {
    const { allowed } = await rateLimiter.hit("login:" + ip);
    if (!allowed) throw new RateLimitError("Terlalu banyak percobaan. Coba lagi nanti.");
    const ok = adminPasswordHash && await passwordHasher.compare(password || "", adminPasswordHash);
    if (!ok) throw new AuthError("Password salah");
    return session.issue({ role: "admin" });
  };
