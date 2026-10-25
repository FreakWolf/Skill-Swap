import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getOfferingsByIds } from "@/lib/data";
import type { OfferingWithDetails } from "@/lib/types";

// Ids of the offerings the user has saved. Cached per request so the
// marketplace, dashboard and saved page can all mark cards without re-querying.
export const getSavedOfferingIds = cache(async (userId: string): Promise<Set<string>> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("offering_id")
    .eq("user_id", userId);
  // Empty if the 0010 migration hasn't been applied yet.
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.offering_id as string));
});

// Saved offerings, newest save first. Paused offerings still show (the owner
// may re-activate them) but are flagged so the card can say so.
export async function getSavedOfferings(userId: string): Promise<OfferingWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("offering_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return [];

  const ids = data.map((r) => r.offering_id as string);
  const offerings = await getOfferingsByIds(ids);
  const byId = new Map(offerings.map((o) => [o.id, o]));
  return ids.map((id) => byId.get(id)).filter((o): o is OfferingWithDetails => Boolean(o));
}
