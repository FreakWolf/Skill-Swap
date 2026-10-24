import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Report } from "@/lib/types";
import { PAGE_SIZE, one, paged, range, type Paged } from "./shared";

export interface AdminReport extends Report {
  reporter: { id: string; full_name: string } | null;
  reported: { id: string; full_name: string; suspended_at: string | null } | null;
}

export const REPORT_REASONS: Record<string, string> = {
  harassment: "Harassment",
  spam_scam: "Spam or scam",
  inappropriate: "Inappropriate content",
  no_show: "No-show",
  fake_profile: "Fake profile",
  safety: "Safety concern",
  other: "Other",
};

export async function listReports(opts: {
  status?: string;
  page: number;
}): Promise<Paged<AdminReport>> {
  const admin = createAdminClient();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("reports")
    .select(
      "*, reporter:profiles!reports_reporter_id_fkey ( id, full_name ), reported:profiles!reports_reported_user_id_fkey ( id, full_name, suspended_at )",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);
  const { data, count } = await query;
  const rows = (data ?? []).map((r) => ({
    ...(r as unknown as Report),
    reporter: one(r.reporter) as AdminReport["reporter"],
    reported: one(r.reported) as AdminReport["reported"],
  }));
  return paged(rows, count, opts.page);
}
