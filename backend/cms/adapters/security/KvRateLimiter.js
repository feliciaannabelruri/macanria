import { kv } from "@vercel/kv";
import { RateLimiter } from "../../application/ports/RateLimiter.js";
export class KvRateLimiter extends RateLimiter {
  #max; #windowSec;
  constructor({ max = 5, windowSec = 300 } = {}) { super(); this.#max = max; this.#windowSec = windowSec; }
  async hit(key) {
    const k = "rl:" + key;
    const n = await kv.incr(k);
    if (n === 1) await kv.expire(k, this.#windowSec);
    return { allowed: n <= this.#max, remaining: Math.max(0, this.#max - n) };
  }
}
