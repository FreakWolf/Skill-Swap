import "server-only";

import { adminDb } from "./shared";

import type { Announcement } from "@/lib/types";

export async function listAnnouncements(): Promise<Announcement[]> {
  const admin = await adminDb();
  const { data } = await admin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Announcement[];
}

export function announcementIsLive(a: Announcement, now = Date.now()): boolean {
  if (!a.is_active) return false;
  if (new Date(a.starts_at).getTime() > now) return false;
  if (a.ends_at && new Date(a.ends_at).getTime() <= now) return false;
  return true;
}
