import { kv } from "@vercel/kv";
import { ContentRepository } from "../../application/ports/ContentRepository.js";
export class KvContentRepository extends ContentRepository {
  #key = (s) => "content:" + s;
  read  = (s) => kv.get(this.#key(s));
  write = (s, v) => kv.set(this.#key(s), v);
  async backup(s) {
    const cur = await kv.get(this.#key(s));
    if (cur) await kv.set("backup:" + s + ":" + Date.now(), cur);
  }
}
