"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

export type ContactState = { error?: string; ok?: boolean } | undefined;

// Abuse limits. Rejected submissions get the same "sent" response as accepted
// ones so a sender cannot probe the limits.
const IP_BURST_LIMIT = 3; // per IP_BURST_WINDOW_MS
const IP_BURST_WINDOW_MS = 10 * 60_000;
const EMAIL_DAILY_LIMIT = 5;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(200),
  subject: z.string().trim().min(1, "Please enter a subject").max(140),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
  "cf-turnstile-response": z.string().optional(),
});

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
}

// The IP is stored only as a keyed hash, used for rate limiting.
function hashIp(ip: string): string {
  if (!ip) return "";
  const key = process.env.CONTACT_HASH_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "skillswap";
  return createHmac("sha256", key).update(ip).digest("hex");
}

// Cloudflare Turnstile verification for signed-out senders.
async function verifyCaptcha(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured: documented in .env.example
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip || undefined }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    console.error("[contact] turnstile verify failed", e);
    return false;
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }
  const d = parsed.data;

  const [session, ip] = await Promise.all([getSessionUser(), clientIp()]);
  const ipHash = hashIp(ip);

  // Signed-out senders must pass the captcha when it is configured.
  if (!session && !(await verifyCaptcha(d["cf-turnstile-response"], ip))) {
    return { error: "Please complete the verification and try again." };
  }

  const admin = createAdminClient();
  const since10m = new Date(Date.now() - IP_BURST_WINDOW_MS).toISOString();
  const since24h = new Date(Date.now() - 86_400_000).toISOString();
  const [byIp, byEmail] = await Promise.all([
    ipHash
      ? admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since10m)
      : Promise.resolve({ count: 0 }),
    admin.from("support_tickets").select("id", { count: "exact", head: true }).ilike("email", d.email).gte("created_at", since24h),
  ]);

  const throttled = (byIp.count ?? 0) >= IP_BURST_LIMIT || (byEmail.count ?? 0) >= EMAIL_DAILY_LIMIT;
  if (throttled) {
    console.warn(`[contact] throttled submission (ip=${(byIp.count ?? 0)}, email=${(byEmail.count ?? 0)})`);
    return { ok: true };
  }

  const { error } = await admin.from("support_tickets").insert({
    user_id: session?.user.id ?? null,
    name: d.name,
    email: d.email,
    subject: d.subject,
    message: d.message,
    ip_hash: ipHash,
  });

  if (error) {
    console.error(`[contact] insert failed: ${error.message}`);
    return { error: "We couldn't send your message right now. Please try again in a few minutes." };
  }
  return { ok: true };
}
