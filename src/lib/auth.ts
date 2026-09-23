import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Returns the signed-in user's auth record + profile row, or null if signed out.
// Wrapped in React cache() so repeated calls within the SAME request (e.g. the
// layout AND the page both calling requireUser) reuse one result instead of
// re-hitting Supabase each time.
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
});

// Use in protected pages: redirects to /login when signed out.
export async function requireUser() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return session;
}

// Current credit balance from the ledger view. Cached per request.
export const getBalance = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", userId)
    .single<{ balance: number }>();
  return data?.balance ?? 0;
});
