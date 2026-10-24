"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function saveAnnouncement(_prev: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  const d = parsed.data;
  if (d.starts_at && d.ends_at && d.ends_at <= d.starts_at) return { error: "End must be after start" };

  const admin = createAdminClient();
  const row = {
    title: d.title,
    body: d.body,
    is_active: d.is_active === "on",
    starts_at: d.starts_at ?? new Date().toISOString(),
    ends_at: d.ends_at,
  };

  if (d.id) {
    const { error } = await admin.from("announcements").update(row).eq("id", d.id);
    if (error) return { error: error.message };
    await logAdminAction(user.id, "announcement.update", "announcement", d.id, { title: d.title });
  } else {
    const { data, error } = await admin
      .from("announcements")
      .insert({ ...row, created_by: user.id })
      .select("id")
      .single();
    if (error) return { error: error.message };
    await logAdminAction(user.id, "announcement.create", "announcement", data.id, { title: d.title });
  }
  refresh();
  return { ok: true };
}

export async function toggleAnnouncement(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: z.string().uuid(), value: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin.from("announcements").update({ is_active: parsed.data.value === "true" }).eq("id", parsed.data.id);
  await logAdminAction(user.id, parsed.data.value === "true" ? "announcement.activate" : "announcement.deactivate", "announcement", parsed.data.id);
  refresh();
}

export async function deleteAnnouncement(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(formData.get("id"));
  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin.from("announcements").delete().eq("id", parsed.data);
  await logAdminAction(user.id, "announcement.delete", "announcement", parsed.data);
  refresh();
}
