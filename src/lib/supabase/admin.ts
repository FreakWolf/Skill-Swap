import "server-only";

// Privileged Supabase client using the service_role key. SERVER ONLY.
// Bypasses Row-Level Security — use only for trusted server-side operations.
// Never import this into a Client Component.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
