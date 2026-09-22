"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BookState = { error?: string } | undefined;

// Books a slot via the atomic book_slot() DB function. That function locks the
// slot, verifies the learner's balance, moves credits (a negative ledger hold),
// and creates the booking + session — all in one transaction. So the UI just
// calls it and reacts to the result.
export async function bookSlot(
  _prev: BookState,
  formData: FormData,
): Promise<BookState> {
  const slotId = String(formData.get("slotId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!slotId) return { error: "No slot selected" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_slot", {
    p_slot_id: slotId,
    p_notes: notes,
  });

  if (error) {
    // Surface the friendly part of the DB exception message.
    const msg = error.message.replace(/^.*:\s*/, "");
    return { error: msg || "Could not complete booking" };
  }

  const bookingId = data as string;
  redirect(`/sessions/${bookingId}?booked=1`);
}
