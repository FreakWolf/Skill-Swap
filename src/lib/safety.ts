import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Users the current viewer shouldn't see: people they blocked and people who
// blocked them. Cached per request. Returns an empty set if the safety
// migration (0007) hasn't been applied yet, so the app keeps working.
export const getHiddenUserIds = cache(async (): Promise<Set<string>> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_hidden_user_ids");
  if (error || !data) return new Set();
  return new Set((data as string[]).filter(Boolean));
});

export interface BlockStatus {
  iBlocked: boolean; // I blocked them (I can undo it)
  blockedMe: boolean; // they blocked me (I can't see or undo it)
}

export async function getBlockStatus(
  myId: string,
  otherId: string,
): Promise<BlockStatus> {
  const hidden = await getHiddenUserIds();
  if (!hidden.has(otherId)) return { iBlocked: false, blockedMe: false };

  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", myId)
    .eq("blocked_id", otherId)
    .maybeSingle();
  const iBlocked = Boolean(data);
  return { iBlocked, blockedMe: !iBlocked };
}

export interface BlockedUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  blockedAt: string;
}

// People the current user has blocked, for the Settings list.
export async function getMyBlockedUsers(myId: string): Promise<BlockedUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocks")
    .select(
      `created_at,
       blocked:profiles!blocks_blocked_id_fkey ( id, full_name, avatar_url )`,
    )
    .eq("blocker_id", myId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((r) => {
    const p = Array.isArray(r.blocked) ? r.blocked[0] : r.blocked;
    return {
      id: (p?.id as string) ?? "",
      full_name: (p?.full_name as string) || "SwapSkills member",
      avatar_url: (p?.avatar_url as string) ?? null,
      blockedAt: r.created_at as string,
    };
  });
}
