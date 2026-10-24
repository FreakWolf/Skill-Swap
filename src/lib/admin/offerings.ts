import "server-only";

import type { Offering } from "@/lib/types";
import { adminDb, PAGE_SIZE, like, one, paged, range, type Paged } from "./shared";

export type OfferingFilter = "all" | "active" | "paused" | "featured";

export interface AdminOffering extends Offering {
  skill_name: string;
  teacher_name: string;
}

export async function listOfferings(opts: {
  q?: string;
  filter?: OfferingFilter;
  page: number;
}): Promise<Paged<AdminOffering>> {
  const admin = await adminDb();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("offerings")
    .select(
      "*, skill:skills!offerings_skill_id_fkey ( name ), teacher:profiles!offerings_teacher_id_fkey ( full_name )",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.q) query = query.ilike("title", like(opts.q));
  if (opts.filter === "active") query = query.eq("is_active", true);
  if (opts.filter === "paused") query = query.eq("is_active", false);
  if (opts.filter === "featured") query = query.eq("is_featured", true);
  const { data, count } = await query;
  const rows = (data ?? []).map((r) => ({
    ...(r as unknown as Offering),
    skill_name: (one(r.skill) as { name: string } | null)?.name ?? "",
    teacher_name: (one(r.teacher) as { full_name: string } | null)?.full_name ?? "",
  }));
  return paged(rows, count, opts.page);
}
