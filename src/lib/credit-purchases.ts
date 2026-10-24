import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type FulfilResult = "granted" | "already_paid" | "unknown_order";

// Grants the credits for a paid order exactly once (see 0008 migration).
// Used by both the checkout confirmation and the Razorpay webhook.
export async function fulfilPurchase(
  orderId: string,
  paymentId: string,
  amountPaise: number,
): Promise<FulfilResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("fulfill_credit_purchase", {
    p_order_id: orderId,
    p_payment_id: paymentId,
    p_amount_paise: amountPaise,
  });
  if (error) {
    if (error.message.includes("unknown order")) return "unknown_order";
    throw new Error(`fulfil failed: ${error.message}`);
  }
  return data ? "granted" : "already_paid";
}

export interface PurchaseRow {
  id: string;
  pack_id: string;
  credits: number;
  amount_paise: number;
  currency: string;
  paid_at: string;
  provider_payment_id: string | null;
}

// The signed-in user's completed purchases (RLS limits this to their own).
// Empty if the 0008 migration hasn't been applied yet.
export async function getMyPurchases(limit = 20): Promise<PurchaseRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credit_purchases")
    .select("id, pack_id, credits, amount_paise, currency, paid_at, provider_payment_id")
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit)
    .returns<PurchaseRow[]>();
  return error ? [] : (data ?? []);
}
