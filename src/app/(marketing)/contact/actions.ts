"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { LEGAL } from "@/lib/legal-config";

export type ContactState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(200),
  subject: z.string().trim().min(1, "Please enter a subject").max(140),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
});

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const session = await getSessionUser();
  const admin = createAdminClient();
  const { error } = await admin.from("support_tickets").insert({
    user_id: session?.user.id ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return {
      error: `We couldn't send your message right now. Please email ${LEGAL.contactEmail} instead.`,
    };
  }
  return { ok: true };
}
