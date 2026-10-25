"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

export type SafetyState = { error?: string; ok?: boolean } | undefined;

const uuid = z.string().uuid();

function friendly(msg: string) {
  if (/relation .*(blocks|reports).* does not exist/i.test(msg)) {
    return "Safety features aren't set up yet (database migration 0007 missing).";
  }
  return msg;
}

async function insertBlock(otherId: string): Promise<string | null> {
  const active = await requireActiveUser();
  if (!active.ok) return active.error;
  const { user } = active.session;
  const supabase = await createClient();
  if (user.id === otherId) return "You can't block yourself";

  const { error } = await supabase
    .from("blocks")
    .upsert(
      { blocker_id: user.id, blocked_id: otherId },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );
  return error ? friendly(error.message) : null;
}

function revalidateEverywhere() {
  // Blocking changes what shows across the app (explore, inbox, profiles).
  revalidatePath("/", "layout");
}

export async function blockUser(otherId: string): Promise<SafetyState> {
  if (!uuid.safeParse(otherId).success) return { error: "Invalid user" };
  const err = await insertBlock(otherId);
  if (err) return { error: err };
  revalidateEverywhere();
  return { ok: true };
}

export async function unblockUser(otherId: string): Promise<SafetyState> {
  if (!uuid.safeParse(otherId).success) return { error: "Invalid user" };
  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", otherId);
  if (error) return { error: friendly(error.message) };
  revalidateEverywhere();
  return { ok: true };
}

const reportSchema = z.object({
  reportedUserId: uuid,
  reason: z.enum([
    "harassment",
    "spam_scam",
    "inappropriate",
    "no_show",
    "fake_profile",
    "safety",
    "other",
  ], { message: "Please choose a reason" }),
  details: z.string().max(2000, "Please keep details under 2000 characters").optional(),
  contextType: z.enum(["profile", "message", "session", "offering"]),
  contextId: z.string().optional(),
  alsoBlock: z.string().optional(),
});

export async function reportUser(
  _prev: SafetyState,
  formData: FormData,
): Promise<SafetyState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report" };
  }
  const { reportedUserId, reason, details, contextType, contextId, alsoBlock } =
    parsed.data;

  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();
  if (user.id === reportedUserId) return { error: "You can't report yourself" };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details: (details ?? "").trim(),
    context_type: contextType,
    context_id: contextId && uuid.safeParse(contextId).success ? contextId : null,
  });
  if (error) return { error: friendly(error.message) };

  if (alsoBlock === "on") {
    const err = await insertBlock(reportedUserId);
    if (err) return { error: `Report sent, but blocking failed: ${err}` };
    revalidateEverywhere();
  }
  return { ok: true };
}
