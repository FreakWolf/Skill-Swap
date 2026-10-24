"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CancelState = { error?: string; ok?: boolean } | undefined;

// Cancels a confirmed booking on behalf of the team. The database function
// verifies is_admin(), refunds the learner, notifies both and writes the audit row.
export async function adminCancelBooking(_prev: CancelState, formData: FormData): Promise<CancelState> {
  await requireAdmin();
  const parsed = z
    .object({ id: z.string().uuid(), note: z.string().trim().max(300).default("") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_cancel_booking", {
    p_booking_id: parsed.data.id,
    p_note: parsed.data.note,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath("/sessions");
  revalidatePath("/", "layout");
  return { ok: true };
}
