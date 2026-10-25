"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(1, "Please enter your name").max(80),
  bio: z.string().max(500).optional(),
  location: z.string().max(120).optional(),
  languages: z.string().max(200).optional(),
});

export type SettingsState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fullName, bio, location, languages } = parsed.data;

  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();

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
  revalidatePath("/settings");
  revalidatePath(`/u/${user.id}`);
  return { ok: true };
}
