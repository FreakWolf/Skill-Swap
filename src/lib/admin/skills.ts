import "server-only";

import type { Skill } from "@/lib/types";
import { adminDb, like } from "./shared";

export interface AdminSkill extends Skill {
  offeringCount: number;
  memberCount: number;
}

export async function listSkills(q?: string): Promise<AdminSkill[]> {
  const admin = await adminDb();
  let query = admin.from("skills").select("*").order("category").order("name");
  if (q) query = query.ilike("name", like(q));

  // Usage counts are aggregated in SQL (admin_skill_usage in 0009).
  const [{ data: skills, error }, usage] = await Promise.all([
    query,
    admin.rpc("admin_skill_usage"),
  ]);
  if (error) {
    console.error(`[admin] listSkills: ${error.message}`);
    throw new Error("Could not load skills");
  }
  if (usage.error) {
    console.error(`[admin] admin_skill_usage: ${usage.error.message}`);
    throw new Error("Could not load skill usage");
  }

  const counts = new Map(
    (usage.data as { skill_id: string; offering_count: number; member_count: number }[]).map((u) => [
      u.skill_id,
      { offerings: Number(u.offering_count), members: Number(u.member_count) },
    ]),
  );

  return ((skills ?? []) as Skill[]).map((s) => ({
    ...s,
    offeringCount: counts.get(s.id)?.offerings ?? 0,
    memberCount: counts.get(s.id)?.members ?? 0,
  }));
}

export async function listSkillCategories(): Promise<string[]> {
  const admin = await adminDb();
  const { data } = await admin.from("skills").select("category");
  return [...new Set((data ?? []).map((r) => r.category as string))].sort();
}
