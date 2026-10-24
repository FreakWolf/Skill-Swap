import "server-only";

import crypto from "node:crypto";

// Minimal Razorpay client (REST API, no SDK). Keys are read on every call so
// the feature turns on as soon as they're set in the environment.
// Docs: https://razorpay.com/docs/api/

const API = "https://api.razorpay.com/v1";

function keys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  };
}

export function razorpayConfigured(): boolean {
  const { keyId, keySecret } = keys();
  return Boolean(keyId && keySecret);
}

// The key id is public (it's sent to the checkout in the browser).
export function razorpayKeyId(): string {
  return keys().keyId;
}

async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const { keyId, keySecret } = keys();
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(data.error?.description ?? `Razorpay request failed (${res.status})`);
  }
  return data as T;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
}

export function createOrder(input: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return call<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt.slice(0, 40), // Razorpay limit
      notes: input.notes,
    },
  });
}

export function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  return call<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

// Only needed if "automatic capture" is turned off in the Razorpay dashboard.
export function capturePayment(
  paymentId: string,
  amountPaise: number,
  currency: string,
): Promise<RazorpayPayment> {
  return call<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: "POST",
    body: { amount: amountPaise, currency },
  });
}

function hmacHex(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Constant-time comparison so signatures can't be guessed byte by byte.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// Checkout callback: signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret).
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const { keySecret } = keys();
  if (!keySecret) return false;
  return safeEqual(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

// Webhook: signature = HMAC_SHA256(raw request body, webhook secret).
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  return safeEqual(hmacHex(secret, rawBody), signature);
}
