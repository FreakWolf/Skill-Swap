"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminDb, publicError } from "@/lib/admin/shared";
import { logAdminAction } from "@/lib/admin/audit";

export type AnnouncementState = { error?: string; ok?: boolean } | undefined;

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? new Date(v).toISOString() : null));

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().max(1000).default(""),
  starts_at: optionalDate,
  ends_at: optionalDate,
  is_active: z.enum(["on"]).optional(),
});

function refresh() {
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}

async function audit(adminId: string, action: string, id: string, details?: Record<string, unknown>) {
  try {
    await logAdminAction(adminId, action, "announcement", id, details);
    return null;
  } catch {
    return "Saved, but the audit entry could not be written.";
  }
}

export async function saveAnnouncement(_prev: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  const d = parsed.data;
  if (d.starts_at && d.ends_at && d.ends_at <= d.starts_at) return { error: "End must be after start" };

  const admin = await adminDb();
  const row = {
    title: d.title,
    body: d.body,
    is_active: d.is_active === "on",
    starts_at: d.starts_at ?? new Date().toISOString(),
    ends_at: d.ends_at,
  };

  let id = d.id;
  if (id) {
    const { error } = await admin.from("announcements").update(row).eq("id", id);
    if (error) return { error: publicError("saveAnnouncement.update", error) };
  } else {
    const { data, error } = await admin
      .from("announcements")
      .insert({ ...row, created_by: user.id })
      .select("id")
      .single();
    if (error) return { error: publicError("saveAnnouncement.insert", error) };
    id = data.id as string;
  }

  const auditError = await audit(user.id, d.id ? "announcement.update" : "announcement.create", id, { title: d.title });
  refresh();
  return auditError ? { error: auditError } : { ok: true };
}

export async function toggleAnnouncement(_prev: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: z.string().uuid(), value: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };

  const admin = await adminDb();
  const { error } = await admin
    .from("announcements")
    .update({ is_active: parsed.data.value === "true" })
    .eq("id", parsed.data.id);
  if (error) return { error: publicError("toggleAnnouncement", error) };

  const auditError = await audit(
    user.id,
    parsed.data.value === "true" ? "announcement.activate" : "announcement.deactivate",
    parsed.data.id,
  );
  refresh();
  return auditError ? { error: auditError } : { ok: true };
}

export async function deleteAnnouncement(_prev: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const { user } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Invalid request" };

  const admin = await adminDb();
  const { error } = await admin.from("announcements").delete().eq("id", parsed.data);
  if (error) return { error: publicError("deleteAnnouncement", error) };

  const auditError = await audit(user.id, "announcement.delete", parsed.data);
  refresh();
  return auditError ? { error: auditError } : { ok: true };
}
