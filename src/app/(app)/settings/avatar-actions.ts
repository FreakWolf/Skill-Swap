"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "avatars";

// Public URL prefix for a user's avatar folder.
function folderUrl(userId: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${userId}/`;
}

// Storage object path from one of our public avatar URLs, or null.
function pathFromUrl(url: string | null, userId: string) {
  if (!url) return null;
  const prefix = folderUrl(userId);
  return url.startsWith(prefix) ? `${userId}/${url.slice(prefix.length)}` : null;
}

export type AvatarResult = { error?: string; url?: string };

// Called after the browser uploads the file to Storage. Saves the URL on the
// profile, but only if it points into this user's own avatar folder, so a
// client can't set an arbitrary image URL. Then removes the previous file.
export async function setAvatar(url: string): Promise<AvatarResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const newPath = pathFromUrl(url, user.id);
  if (!newPath || newPath.includes("..")) {
    return { error: "Invalid image location" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single<{ avatar_url: string | null }>();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (error) return { error: error.message };

  // Best-effort cleanup of the old picture.
  const oldPath = pathFromUrl(profile?.avatar_url ?? null, user.id);
  if (oldPath && oldPath !== newPath) {
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }

  revalidatePath("/", "layout"); // sidebar, profile, cards everywhere
  return { url };
}

export async function removeAvatar(): Promise<AvatarResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single<{ avatar_url: string | null }>();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  const oldPath = pathFromUrl(profile?.avatar_url ?? null, user.id);
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);

  revalidatePath("/", "layout");
  return {};
}
