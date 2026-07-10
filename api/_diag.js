export default function handler(req, res) {
  res.status(200).json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    supabaseUrlLen: (process.env.SUPABASE_URL || "").length,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleLen: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").length,
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasImageKit: !!process.env.IMAGEKIT_PRIVATE_KEY,
    nodeEnv: process.env.NODE_ENV || null,
    vercelEnv: process.env.VERCEL_ENV || null
  });
}
