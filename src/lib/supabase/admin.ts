import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client con service_role key.
 * Bypasa RLS — usar SOLO en Server Actions y route handlers server-side.
 * NUNCA importar desde Client Components ni exponer al navegador.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
