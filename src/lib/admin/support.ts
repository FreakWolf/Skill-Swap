import "server-only";

import type { SupportTicket } from "@/lib/types";
import { adminDb, PAGE_SIZE, paged, range, type Paged } from "./shared";

export async function listTickets(opts: {
  status?: string;
  page: number;
}): Promise<Paged<SupportTicket>> {
  const admin = await adminDb();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("support_tickets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);
  const { data, count } = await query;
  return paged(data as SupportTicket[] | null, count, opts.page);
}
