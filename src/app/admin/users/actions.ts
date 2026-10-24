"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin/audit";

export type AdminActionState = { error?: string; ok?: boolean } | undefined;

const idSchema = z.string().uuid();

function refreshUser(id: string) {
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

export async function suspendUser(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: idSchema, reason: z.string().trim().max(300).default("") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  if (parsed.data.id === user.id) return { error: "You cannot suspend your own account" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ suspended_at: new Date().toISOString(), suspended_reason: parsed.data.reason })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  await logAdminAction(user.id, "user.suspend", "user", parsed.data.id, { reason: parsed.data.reason });
  refreshUser(parsed.data.id);
  return { ok: true };
}

export async function unsuspendUser(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Invalid request" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ suspended_at: null, suspended_reason: "" })
    .eq("id", parsed.data);
  if (error) return { error: error.message };

  await logAdminAction(user.id, "user.unsuspend", "user", parsed.data);
  refreshUser(parsed.data);
  return { ok: true };
}

export async function setAdminFlag(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: idSchema, value: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  const value = parsed.data.value === "true";
  if (parsed.data.id === user.id && !value) return { error: "You cannot remove your own admin access" };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ is_admin: value }).eq("id", parsed.data.id);
  if (error) return { error: error.message };

  await logAdminAction(user.id, value ? "user.grant_admin" : "user.revoke_admin", "user", parsed.data.id);
  refreshUser(parsed.data.id);
  return { ok: true };
}

// Runs through the admin_adjust_credits database function with the admin's
// own session, so the function can verify is_admin() and write the audit row.
export async function adjustCredits(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: idSchema,
      amount: z.coerce.number().int().min(-1000).max(1000).refine((n) => n !== 0, "Amount cannot be zero"),
      note: z.string().trim().max(300).default(""),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_adjust_credits", {
    p_user: parsed.data.id,
    p_amount: parsed.data.amount,
    p_note: parsed.data.note,
  });
  if (error) return { error: error.message };

  refreshUser(parsed.data.id);
  return { ok: true };
}
