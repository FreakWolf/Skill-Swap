import "server-only";

import type { CreditPurchase } from "@/lib/types";
import { adminDb, PAGE_SIZE, one, paged, range, type Paged } from "./shared";

export interface AdminPurchase extends CreditPurchase {
  user_name: string;
}

export interface PurchaseTotals {
  paidCount: number;
  paidPaise: number;
  paidCredits: number;
  failedCount: number;
}

export async function listPurchases(opts: {
  status?: string;
  page: number;
}): Promise<{ purchases: Paged<AdminPurchase>; totals: PurchaseTotals }> {
  const admin = await adminDb();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("credit_purchases")
    .select("*, user:profiles!credit_purchases_user_id_fkey ( full_name )", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);

  const [{ data, count }, paid, failed] = await Promise.all([
    query,
    admin.from("credit_purchases").select("amount_paise, credits").eq("status", "paid"),
    admin.from("credit_purchases").select("id", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  const rows = (data ?? []).map((p) => ({
    ...(p as unknown as CreditPurchase),
    user_name: (one(p.user) as { full_name: string } | null)?.full_name ?? "",
  }));

  return {
    purchases: paged(rows, count, opts.page),
    totals: {
      paidCount: paid.data?.length ?? 0,
      paidPaise: (paid.data ?? []).reduce((s, r) => s + Number(r.amount_paise), 0),
      paidCredits: (paid.data ?? []).reduce((s, r) => s + Number(r.credits), 0),
      failedCount: failed.count ?? 0,
    },
  };
}
