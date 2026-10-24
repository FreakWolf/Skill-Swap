"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(offeringId: string, save: boolean): Promise<{ error?: string }> {
  const id = z.string().uuid().safeParse(offeringId);
  if (!id.success) return { error: "Invalid offering" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

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
