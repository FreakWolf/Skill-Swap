import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/types";

// Live announcements for signed-in members. The RLS policy already limits
// non-admins to active rows within their window; the filter is repeated here
// so admins see the same thing members do.
export const getLiveAnnouncements = cache(async (): Promise<Announcement[]> => {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", nowIso)
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order("starts_at", { ascending: false })
    .limit(3);
  // Empty if the 0009 migration hasn't been applied yet.
  if (error) return [];
  return (data ?? []) as Announcement[];
});
