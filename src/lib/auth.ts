import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// The profile columns a signed-in member may read (column grants in 0009).
// Moderation columns (is_admin, suspended_*) come from my_account_status().
export const PUBLIC_PROFILE_COLUMNS =
  "id, full_name, bio, avatar_url, location, languages, onboarded, created_at, updated_at";

type PublicProfile = Omit<Profile, "is_admin" | "suspended_at" | "suspended_reason" | "birthdate">;

interface AccountStatus {
  is_admin: boolean;
  suspended_at: string | null;
  suspended_reason: string;
}

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

  const [{ data: row }, status] = await Promise.all([
    supabase
      .from("profiles")
      .select(PUBLIC_PROFILE_COLUMNS)
      .eq("id", user.id)
      .single<PublicProfile>(),
    // Before migration 0009 the function doesn't exist; treat as a regular
    // active member in that case.
    supabase.rpc("my_account_status").maybeSingle<AccountStatus>(),
  ]);

  const profile: Profile | null = row
    ? {
        ...row,
        birthdate: null,
        is_admin: status.data?.is_admin ?? false,
        suspended_at: status.data?.suspended_at ?? null,
        suspended_reason: status.data?.suspended_reason ?? "",
      }
    : null;

  return { user, profile };
});

// Use in protected pages: redirects to /login when signed out.
export async function requireUser() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return session;
}

// Use in /admin pages and actions: requires a signed-in admin who is not
// suspended, otherwise sends the user to their dashboard (or /login).
export async function requireAdmin() {
  const session = await requireUser();
  if (!session.profile?.is_admin || session.profile.suspended_at) redirect("/dashboard");
  return session;
}

export type ActiveUserResult =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSessionUser>>> }
  | { ok: false; error: string };

// Use at the top of every mutating server action. Suspended members are
// refused by the database too; this gives them a readable message instead of
// a policy error, and stops actions that don't touch RLS-protected tables.
export async function requireActiveUser(): Promise<ActiveUserResult> {
  const session = await getSessionUser();
  if (!session) return { ok: false, error: "Not signed in" };
  if (session.profile?.suspended_at) return { ok: false, error: "Your account is suspended" };
  return { ok: true, session };
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
