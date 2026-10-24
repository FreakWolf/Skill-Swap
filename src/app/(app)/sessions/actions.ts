"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

export type SessionActionState = { error?: string; ok?: boolean } | undefined;

function friendly(message: string) {
  return message.replace(/^.*:\s*/, "") || "Something went wrong";
}

// Mark a booking complete — releases the held credits to the teacher as
// earnings (atomic in complete_booking()).
export async function completeSession(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return { error: "Missing booking" };
  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_booking", {
    p_booking_id: bookingId,
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/sessions/${bookingId}`);
  revalidatePath("/sessions");
  return { ok: true };
}

// Cancel a confirmed booking — refunds the learner and frees the slot.
export async function cancelSession(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return { error: "Missing booking" };
  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/sessions/${bookingId}`);
  revalidatePath("/sessions");
  return { ok: true };
}

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  revieweeId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Leave a review for the other participant of a completed session.
export async function submitReview(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }
  const { bookingId, revieweeId, rating, comment } = parsed.data;

  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
    comment: comment ?? "",
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/sessions/${bookingId}`);
  return { ok: true };
}
