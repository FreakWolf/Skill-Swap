"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

export async function toggleFavorite(offeringId: string, save: boolean): Promise<{ error?: string }> {
  const id = z.string().uuid().safeParse(offeringId);
  if (!id.success) return { error: "Invalid offering" };

  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();

  const { error } = save
    ? await supabase
        .from("favorites")
        .upsert({ user_id: user.id, offering_id: id.data }, { onConflict: "user_id,offering_id" })
    : await supabase.from("favorites").delete().eq("user_id", user.id).eq("offering_id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/saved");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath(`/offerings/${id.data}`);
  return {};
}
