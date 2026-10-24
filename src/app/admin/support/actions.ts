"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";

export type TicketState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "answered", "closed"]),
  admin_reply: z.string().trim().max(2000).default(""),
});

// Stores the reply and status. Replies are kept here for the record and shown
// to signed-in members who own the ticket; email delivery is manual for now.
export async function updateTicket(_prev: TicketState, formData: FormData): Promise<TicketState> {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("support_tickets")
    .update({ status: parsed.data.status, admin_reply: parsed.data.admin_reply })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  await logAdminAction(user.id, "ticket.update", "support_ticket", parsed.data.id, {
    status: parsed.data.status,
    has_reply: parsed.data.admin_reply.length > 0,
  });
  revalidatePath("/admin/support");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
