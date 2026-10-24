"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminDb, publicError } from "@/lib/admin/shared";
import { logAdminAction } from "@/lib/admin/audit";

export type SkillState = { error?: string; ok?: boolean } | undefined;

const nameSchema = z.string().trim().min(1, "Name is required").max(60);
const categorySchema = z.string().trim().min(1, "Category is required").max(40);

function refresh() {
  revalidatePath("/admin/skills");
  revalidatePath("/marketplace");
  revalidatePath("/offer");
  revalidatePath("/onboarding/skills");
}

export async function createSkill(_prev: SkillState, formData: FormData): Promise<SkillState> {
  const { user } = await requireAdmin();
  const parsed = z.object({ name: nameSchema, category: categorySchema }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };

  const admin = await adminDb();
  const { data, error } = await admin
    .from("skills")
    .insert({ name: parsed.data.name, category: parsed.data.category, is_custom: false })
    .select("id")
    .single();
  if (error) return { error: error.code === "23505" ? "A skill with that name already exists" : publicError("createSkill", error) };

  try {
    await logAdminAction(user.id, "skill.create", "skill", data.id, parsed.data);
  } catch {
    return { error: "Saved, but the audit entry could not be written." };
  }
  refresh();
  return { ok: true };
}

export async function updateSkill(_prev: SkillState, formData: FormData): Promise<SkillState> {
  const { user } = await requireAdmin();
  const parsed = z
    .object({ id: z.string().uuid(), name: nameSchema, category: categorySchema, is_custom: z.enum(["true", "false"]).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };

  const admin = await adminDb();
  const { error } = await admin
    .from("skills")
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      // "Promote" a member-created skill into the curated catalogue.
      ...(parsed.data.is_custom ? { is_custom: parsed.data.is_custom === "true" } : {}),
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.code === "23505" ? "A skill with that name already exists" : publicError("updateSkill", error) };

  try {
    await logAdminAction(user.id, "skill.update", "skill", parsed.data.id, {
      name: parsed.data.name,
      category: parsed.data.category,
    });
  } catch {
    return { error: "Saved, but the audit entry could not be written." };
  }
  refresh();
  return { ok: true };
}

// Only skills with no offerings and no members can be removed (offerings
// reference skills with ON DELETE RESTRICT anyway).
export async function deleteSkill(_prev: SkillState, formData: FormData): Promise<SkillState> {
  const { user } = await requireAdmin();
  const parsed = z.string().uuid().safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Invalid request" };

  const admin = await adminDb();
  const [{ count: offerings }, { count: members }] = await Promise.all([
    admin.from("offerings").select("id", { count: "exact", head: true }).eq("skill_id", parsed.data),
    admin.from("user_skills").select("id", { count: "exact", head: true }).eq("skill_id", parsed.data),
  ]);
  if ((offerings ?? 0) > 0 || (members ?? 0) > 0) {
    return { error: "This skill is in use. Rename or re-categorise it instead." };
  }

  const { error } = await admin.from("skills").delete().eq("id", parsed.data);
  if (error) return { error: publicError("deleteSkill", error) };

  try {
    await logAdminAction(user.id, "skill.delete", "skill", parsed.data);
  } catch {
    return { error: "Deleted, but the audit entry could not be written." };
  }
  refresh();
  return { ok: true };
}
