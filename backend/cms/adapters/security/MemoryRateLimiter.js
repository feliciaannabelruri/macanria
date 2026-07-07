import { RateLimiter } from "../../application/ports/RateLimiter.js";

/* Rate limiter in-memory untuk lokal/VPS single-instance.
   Tidak untuk serverless multi-instance (di Vercel pakai KvRateLimiter). */
export class MemoryRateLimiter extends RateLimiter {
  #max; #windowMs; #store = new Map();
  constructor({ max = 5, windowSec = 300 } = {}) {
    super();
    this.#max = max;
    this.#windowMs = windowSec * 1000;
  }
  async hit(key) {
    const now = Date.now();
    const rec = this.#store.get(key);
    if (!rec || now >= rec.resetAt) {
      this.#store.set(key, { count: 1, resetAt: now + this.#windowMs });
      return { allowed: true, remaining: this.#max - 1 };
    }
    rec.count += 1;
    return { allowed: rec.count <= this.#max, remaining: Math.max(0, this.#max - rec.count) };
  }
}
