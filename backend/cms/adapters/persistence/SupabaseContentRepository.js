import { createClient } from "@supabase/supabase-js";
import { ContentRepository } from "../../application/ports/ContentRepository.js";

/* Adapter persistensi berbasis Supabase (Postgres).
   Interface identik dengan Kv/File repository: read, write, backup.
   Memakai service_role key (server-side saja) sehingga bypass RLS. */

export class SupabaseContentRepository extends ContentRepository {
  constructor() {
    super();
    this.db = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }

  async read(section) {
    const { data, error } = await this.db
      .from("content")
      .select("data")
      .eq("section", section)
      .maybeSingle();
    if (error) throw new Error("Supabase read: " + error.message);
    return data ? data.data : null;
  }

  async write(section, value) {
    const { error } = await this.db
      .from("content")
      .upsert(
        { section, data: value, updated_at: new Date().toISOString() },
        { onConflict: "section" }
      );
    if (error) throw new Error("Supabase write: " + error.message);
  }

  async backup(section) {
    const cur = await this.read(section);
    if (cur == null) return;
    const { error } = await this.db
      .from("content_backups")
      .insert({ section, data: cur });
    if (error) throw new Error("Supabase backup: " + error.message);
  }
}