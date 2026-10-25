"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CREDIT_CURRENCY, getPack } from "@/lib/credit-packs";
import {
  capturePayment,
  createOrder,
  fetchPayment,
  razorpayConfigured,
  razorpayKeyId,
  verifyCheckoutSignature,
} from "@/lib/razorpay";
import { fulfilPurchase } from "@/lib/credit-purchases";

export type CreateOrderResult =
  | { error: string }
  | {
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      credits: number;
      name: string;
      email: string;
    };

// Step 1: create a Razorpay order for a pack. The price comes from the server's
// pack list, never from the browser.
export async function createCreditOrder(packId: string): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  const pack = getPack(String(packId));
  if (!pack) return { error: "That pack isn't available." };
  if (!razorpayConfigured()) return { error: "Buying credits isn't available yet." };

  let order;
  try {
    order = await createOrder({
      amountPaise: pack.pricePaise,
      currency: CREDIT_CURRENCY,
      receipt: `cr_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, pack_id: pack.id },
    });
  } catch (e) {
    console.error("razorpay createOrder failed", e);
    return { error: "We couldn't start the payment. Please try again." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("credit_purchases").insert({
    user_id: user.id,
    pack_id: pack.id,
    credits: pack.credits,
    amount_paise: pack.pricePaise,
    currency: CREDIT_CURRENCY,
    provider_order_id: order.id,
  });
  if (error) {
    console.error("credit_purchases insert failed", error);
    // 23514 = check violation: the pack is bigger than the DB allows (run 0011).
    if (error.code === "23514") return { error: "That pack isn't available yet. Please pick another one." };
    return {
      error:
        error.code === "42P01" || error.message.includes("does not exist")
          ? "Buying credits isn't set up yet (database migration 0008 missing)."
          : "We couldn't start the payment. Please try again.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle<{ full_name: string }>();

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeyId(),
    credits: pack.credits,
    name: profile?.full_name ?? "",
    email: user.email ?? "",
  };
}

const confirmSchema = z.object({
  orderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
  paymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ConfirmResult = { ok: true; credits: number } | { error: string };

// Step 2: after checkout succeeds in the browser. Trust nothing from the
// browser: verify Razorpay's signature, then ask Razorpay directly for the
// payment's status and amount before granting credits.
export async function confirmCreditPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ConfirmResult> {
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid payment details." };
  const { orderId, paymentId, signature } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again. If you were charged, your credits will still be added." };

  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    return { error: "We couldn't verify this payment." };
  }

  const admin = createAdminClient();
  const { data: purchase } = await admin
    .from("credit_purchases")
    .select("user_id, credits, amount_paise, currency, status")
    .eq("provider_order_id", orderId)
    .maybeSingle<{ user_id: string; credits: number; amount_paise: number; currency: string; status: string }>();
  if (!purchase || purchase.user_id !== user.id) {
    return { error: "We couldn't find this order." };
  }
  if (purchase.status === "paid") {
    return { ok: true, credits: purchase.credits }; // webhook got there first
  }

  try {
    let payment = await fetchPayment(paymentId);
    if (
      payment.order_id !== orderId ||
      payment.amount !== purchase.amount_paise ||
      payment.currency !== purchase.currency
    ) {
      console.error("payment/order mismatch", { orderId, paymentId });
      return { error: "This payment doesn't match the order. Please contact support." };
    }
    if (payment.status === "authorized") {
      payment = await capturePayment(paymentId, payment.amount, payment.currency);
    }
    if (payment.status !== "captured") {
      return { error: "The payment hasn't completed. You haven't been charged for credits." };
    }

    await fulfilPurchase(orderId, paymentId, payment.amount);
  } catch (e) {
    console.error("confirmCreditPayment failed", e);
    return {
      error:
        "Your payment went through but we couldn't confirm it just now. Your credits will be added automatically within a few minutes.",
    };
  }

  revalidatePath("/", "layout"); // balance in the sidebar, dashboard, etc.
  return { ok: true, credits: purchase.credits };
}
