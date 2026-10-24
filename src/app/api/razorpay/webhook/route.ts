import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { fulfilPurchase } from "@/lib/credit-purchases";
import { createAdminClient } from "@/lib/supabase/admin";

// Razorpay webhook: a backup that grants credits even if the user closed the
// tab before the browser confirmation ran. Configure in Razorpay Dashboard →
// Settings → Webhooks with URL /api/razorpay/webhook and the events
// "payment.captured" and "payment.failed".

interface PaymentEntity {
  id: string;
  order_id: string | null;
  amount: number;
  status: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) {
    return NextResponse.json({ ok: true, ignored: true }); // not a payment event
  }

  try {
    if (event.event === "payment.captured" && payment.status === "captured") {
      const result = await fulfilPurchase(payment.order_id, payment.id, payment.amount);
      // unknown_order: an order from somewhere else on this Razorpay account.
      return NextResponse.json({ ok: true, result });
    }

    if (event.event === "payment.failed") {
      const admin = createAdminClient();
      await admin
        .from("credit_purchases")
        .update({ status: "failed" })
        .eq("provider_order_id", payment.order_id)
        .eq("status", "created");
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error("razorpay webhook failed", e);
    // Non-2xx makes Razorpay retry later.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
