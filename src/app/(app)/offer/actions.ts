"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { offeringFieldsSchema } from "@/lib/schemas/offering";

const offerSchema = offeringFieldsSchema.extend({
  // Slots arrive as a JSON array of ISO datetime strings.
  slots: z.string().optional(),
});

export type OfferState = { error?: string } | undefined;

const HAS_TZ = /(Z|[+-]\d{2}:\d{2})$/;

export async function createOffering(
  _prev: OfferState,
  formData: FormData,
): Promise<OfferState> {
  const parsed = offerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { skillName, title, description, level, duration, cost, mode, slots } =
    parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // Resolve or create the skill.
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

  // Ensure the teacher also has a "teach" user_skill for this skill.
  await supabase.from("user_skills").upsert(
    { user_id: user.id, skill_id: skillId, direction: "teach", level },
    { onConflict: "user_id,skill_id,direction" },
  );

  // Create the offering.
  const { data: offering, error: offErr } = await supabase
    .from("offerings")
    .insert({
      teacher_id: user.id,
      skill_id: skillId,
      title,
      description: description ?? "",
      level,
      duration_min: duration,
      credit_cost: cost,
      mode,
    })
    .select("id")
    .single<{ id: string }>();
  if (offErr) return { error: offErr.message };

  // Create availability slots.
  let slotList: string[] = [];
  try {
    slotList = z.array(z.string()).parse(JSON.parse(slots ?? "[]"));
  } catch {
    slotList = [];
  }
  // Only accept timestamps that carry a time zone (Z or ±hh:mm). A bare
  // "2026-09-25T17:00" would be misread as UTC on the server.
  slotList = slotList.filter((s) => HAS_TZ.test(s));

  if (slotList.length > 0) {
    const rows = slotList
      .map((iso) => {
        const start = new Date(iso);
        if (Number.isNaN(start.getTime())) return null;
        const end = new Date(start.getTime() + duration * 60_000);
        return {
          offering_id: offering.id,
          teacher_id: user.id,
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
        };
      })
      .filter(Boolean);
    if (rows.length > 0) {
      await supabase.from("availability").insert(rows as object[]);
    }
  }

  redirect(`/offerings/${offering.id}`);
}
