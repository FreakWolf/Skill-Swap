"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";

export type ReportState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
  admin_notes: z.string().trim().max(2000).default(""),
});

export async function updateReport(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };

  const closed = parsed.data.status === "resolved" || parsed.data.status === "dismissed";
  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({
      status: parsed.data.status,
      admin_notes: parsed.data.admin_notes,
      resolved_by: closed ? user.id : null,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  await logAdminAction(user.id, "report.update", "report", parsed.data.id, {
    status: parsed.data.status,
    has_notes: parsed.data.admin_notes.length > 0,
  });
  revalidatePath("/admin/reports");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
