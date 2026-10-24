import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Skill } from "@/lib/types";
import { like } from "./shared";

export interface AdminSkill extends Skill {
  offeringCount: number;
  memberCount: number;
}

export async function listSkills(q?: string): Promise<AdminSkill[]> {
  const admin = createAdminClient();
  let query = admin.from("skills").select("*").order("category").order("name");
  if (q) query = query.ilike("name", like(q));

  const [{ data: skills }, { data: offerings }, { data: userSkills }] = await Promise.all([
    query,
    admin.from("offerings").select("skill_id"),
    admin.from("user_skills").select("skill_id"),
  ]);

  const offeringCounts = new Map<string, number>();
  for (const o of offerings ?? []) {
    offeringCounts.set(o.skill_id, (offeringCounts.get(o.skill_id) ?? 0) + 1);
  }
  const memberCounts = new Map<string, number>();
  for (const u of userSkills ?? []) {
    memberCounts.set(u.skill_id, (memberCounts.get(u.skill_id) ?? 0) + 1);
  }

  return ((skills ?? []) as Skill[]).map((s) => ({
    ...s,
    offeringCount: offeringCounts.get(s.id) ?? 0,
    memberCount: memberCounts.get(s.id) ?? 0,
  }));
}

export async function listSkillCategories(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("skills").select("category");
  return [...new Set((data ?? []).map((r) => r.category as string))].sort();
}
