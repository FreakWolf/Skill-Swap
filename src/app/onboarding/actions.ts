"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SkillDirection, SkillLevel } from "@/lib/types";

const profileSchema = z.object({
  fullName: z.string().min(1, "Please enter your name").max(80),
  bio: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  languages: z.string().max(200).optional(),
});

export type OnboardingState = { error?: string } | undefined;

export async function saveProfile(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fullName, bio, location, languages } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const langArray = (languages ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio: bio ?? "",
      location: location ?? "",
      languages: langArray,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  redirect("/onboarding/skills");
}

// A selected skill entry coming from the skills form (serialized JSON).
const selectionSchema = z.array(
  z.object({
    name: z.string().min(1).max(60),
    direction: z.enum(["teach", "learn"]),
    level: z.enum(["beginner", "intermediate", "expert"]),
  }),
);

export async function saveSkills(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const raw = formData.get("selections");
  let selections: Array<{
    name: string;
    direction: SkillDirection;
    level: SkillLevel;
  }>;
  try {
    selections = selectionSchema.parse(JSON.parse(String(raw ?? "[]")));
  } catch {
    return { error: "Could not read your skill selections" };
  }
  if (selections.length === 0) {
    return { error: "Pick at least one skill to teach or learn" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // Resolve each skill name to a skill id, creating custom skills as needed.
  for (const sel of selections) {
    const name = sel.name.trim();
    let skillId: string | undefined;

    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", name)
      .maybeSingle<{ id: string }>();

    if (existing) {
      skillId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("skills")
        .insert({ name, category: "Other", is_custom: true })
        .select("id")
        .single<{ id: string }>();
      if (createErr) return { error: createErr.message };
      skillId = created.id;
    }

    const { error: linkErr } = await supabase.from("user_skills").upsert(
      {
        user_id: user.id,
        skill_id: skillId,
        direction: sel.direction,
        level: sel.level,
      },
      { onConflict: "user_id,skill_id,direction" },
    );
    if (linkErr) return { error: linkErr.message };
  }

  // Mark onboarding complete.
  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
  redirect("/dashboard");
}
