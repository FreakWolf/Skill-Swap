"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { adminDb, publicError } from "@/lib/admin/shared";
import { logAdminAction } from "@/lib/admin/audit";

export type AdminActionState = { error?: string; ok?: boolean; message?: string } | undefined;

const idSchema = z.string().uuid();

function refreshUser(id: string) {
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

// Friendly text for the exceptions raised by the admin_* database functions.
function rpcError(context: string, error: { message: string; code?: string }): string {
  const msg = error.message.replace(/^.*?:\s*/, "");
  if (/admin only|cannot suspend yourself|user not found|balance cannot go below zero|amount must be/i.test(msg)) {
    return msg.charAt(0).toUpperCase() + msg.slice(1);
  }
  return publicError(context, error);
}

// Suspension runs inside admin_suspend_user: it also cancels and refunds the
// member's future bookings and writes the audit row in the same transaction.
export async function suspendUser(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: idSchema, reason: z.string().trim().max(300).default("") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  if (parsed.data.id === user.id) return { error: "You cannot suspend your own account" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_suspend_user", {
    p_user: parsed.data.id,
    p_reason: parsed.data.reason,
  });
  if (error) return { error: rpcError("suspendUser", error) };

  refreshUser(parsed.data.id);
  const cancelled = Number(data ?? 0);
  return {
    ok: true,
    message: cancelled > 0 ? `Suspended. ${cancelled} upcoming booking${cancelled === 1 ? "" : "s"} cancelled and refunded.` : "Suspended.",
  };
}

export async function unsuspendUser(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Invalid request" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_unsuspend_user", { p_user: parsed.data });
  if (error) return { error: rpcError("unsuspendUser", error) };

  refreshUser(parsed.data);
  return { ok: true, message: "Suspension lifted." };
}

export async function setAdminFlag(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: idSchema, value: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  const value = parsed.data.value === "true";
  if (parsed.data.id === user.id && !value) return { error: "You cannot remove your own admin access" };

  const admin = await adminDb();
  const { error } = await admin.from("profiles").update({ is_admin: value }).eq("id", parsed.data.id);
  if (error) return { error: publicError("setAdminFlag", error) };

  try {
    await logAdminAction(user.id, value ? "user.grant_admin" : "user.revoke_admin", "user", parsed.data.id);
  } catch {
    return { error: "Saved, but the audit entry could not be written." };
  }
  refreshUser(parsed.data.id);
  return { ok: true, message: value ? "Admin access granted." : "Admin access removed." };
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
  if (error) return { error: rpcError("adjustCredits", error) };

  refreshUser(parsed.data.id);
  return { ok: true, message: "Adjustment applied." };
}
