"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { offeringFieldsSchema } from "@/lib/schemas/offering";

export type EditState = { error?: string; ok?: boolean } | undefined;

const idSchema = z.string().uuid();

async function ownedOffering(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, offering: null };
  const { data: offering } = await supabase
    .from("offerings")
    .select("id, teacher_id, duration_min")
    .eq("id", id)
    .maybeSingle<{ id: string; teacher_id: string; duration_min: number }>();
  if (!offering || offering.teacher_id !== user.id) return { supabase, user, offering: null };
  return { supabase, user, offering };
}

function refresh(id: string) {
  revalidatePath(`/offerings/${id}`);
  revalidatePath(`/offerings/${id}/edit`);
  revalidatePath("/availability");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/saved");
}

export async function updateOffering(_prev: EditState, formData: FormData): Promise<EditState> {
  const parsed = offeringFieldsSchema.extend({ id: idSchema }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { id, skillName, title, description, level, duration, cost, mode } = parsed.data;

  const { supabase, user, offering } = await ownedOffering(id);
  if (!user) return { error: "Not signed in" };
  if (!offering) return { error: "You can only edit your own offerings" };

  // Resolve or create the skill (same rule as creating an offering).
  let skillId: string;
  const { data: existing } = await supabase
    .from("skills")
    .select("id")
    .ilike("name", skillName.trim())
    .maybeSingle<{ id: string }>();
  if (existing) {
    skillId = existing.id;
  } else {
    const { data: created, error: skillErr } = await supabase
      .from("skills")
      .insert({ name: skillName.trim(), category: "Other", is_custom: true })
      .select("id")
      .single<{ id: string }>();
    if (skillErr) return { error: skillErr.message };
    skillId = created.id;
  }
  await supabase.from("user_skills").upsert(
    { user_id: user.id, skill_id: skillId, direction: "teach", level },
    { onConflict: "user_id,skill_id,direction" },
  );

  const { error } = await supabase
    .from("offerings")
    .update({
      skill_id: skillId,
      title,
      description: description ?? "",
      level,
      duration_min: duration,
      credit_cost: cost,
      mode,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // Keep open slots consistent with a changed duration.
  if (duration !== offering.duration_min) {
    const { data: open } = await supabase
      .from("availability")
      .select("id, starts_at")
      .eq("offering_id", id)
      .eq("is_booked", false);
    for (const s of open ?? []) {
      const end = new Date(new Date(s.starts_at as string).getTime() + duration * 60_000).toISOString();
      await supabase.from("availability").update({ ends_at: end }).eq("id", s.id);
    }
  }

  refresh(id);
  return { ok: true };
}

// Pause hides the offering from the marketplace and clears its open slots so
// nothing can be booked (the database refuses bookings on paused offerings
// too). Resume just flips it back; add slots again from Availability.
export async function setOfferingActive(_prev: EditState, formData: FormData): Promise<EditState> {
  const parsed = z
    .object({ id: idSchema, active: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };
  const active = parsed.data.active === "true";

  const { supabase, user, offering } = await ownedOffering(parsed.data.id);
  if (!user) return { error: "Not signed in" };
  if (!offering) return { error: "You can only change your own offerings" };

  const { error } = await supabase
    .from("offerings")
    .update({ is_active: active, ...(active ? {} : { is_featured: false }) })
    .eq("id", offering.id);
  if (error) return { error: error.message };

  if (!active) {
    await supabase
      .from("availability")
      .delete()
      .eq("offering_id", offering.id)
      .eq("is_booked", false);
  }

  refresh(offering.id);
  return { ok: true };
}

// Deletes an offering that was never booked. One with bookings (past or
// upcoming) is paused instead, so session history stays intact.
export async function deleteOffering(_prev: EditState, formData: FormData): Promise<EditState> {
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Invalid request" };

  const { supabase, user, offering } = await ownedOffering(parsed.data);
  if (!user) return { error: "Not signed in" };
  if (!offering) return { error: "You can only delete your own offerings" };

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("offering_id", offering.id);

  if ((count ?? 0) > 0) {
    await supabase
      .from("offerings")
      .update({ is_active: false, is_featured: false })
      .eq("id", offering.id);
    await supabase.from("availability").delete().eq("offering_id", offering.id).eq("is_booked", false);
    refresh(offering.id);
    return { error: "This offering has bookings, so it was paused instead of deleted. Past sessions stay in everyone's history." };
  }

  const { error } = await supabase.from("offerings").delete().eq("id", offering.id);
  if (error) return { error: error.message };

  refresh(offering.id);
  redirect("/availability?deleted=1");
}
