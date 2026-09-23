"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityState = { error?: string } | undefined;

const addSchema = z.object({
  offeringId: z.string().min(1),
  startISO: z.string().min(1, "Pick a date and time"),
});

// Add a bookable slot to one of the teacher's offerings. The slot's end is
// derived from the offering's duration. RLS ensures only the owner can insert.
export async function addSlot(
  _prev: AvailabilityState,
  formData: FormData,
): Promise<AvailabilityState> {
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid slot" };
  }
  const { offeringId, startISO } = parsed.data;

  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return { error: "Invalid date/time" };
  if (start.getTime() < Date.now()) {
    return { error: "Pick a time in the future" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // Look up the offering (must belong to the user) to get its duration.
  const { data: offering } = await supabase
    .from("offerings")
    .select("id, teacher_id, duration_min")
    .eq("id", offeringId)
    .maybeSingle<{ id: string; teacher_id: string; duration_min: number }>();
  if (!offering || offering.teacher_id !== user.id) {
    return { error: "Offering not found" };
  }

  const end = new Date(start.getTime() + offering.duration_min * 60_000);

  const { error } = await supabase.from("availability").insert({
    offering_id: offering.id,
    teacher_id: user.id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/availability");
  revalidatePath("/calendar");
  return undefined;
}

// Remove an unbooked slot. RLS delete policy already forbids removing booked
// slots, but we also check here for a friendly message.
export async function removeSlot(formData: FormData) {
  const slotId = String(formData.get("slotId") ?? "");
  if (!slotId) return;

  const supabase = await createClient();
  await supabase
    .from("availability")
    .delete()
    .eq("id", slotId)
    .eq("is_booked", false);

  revalidatePath("/availability");
  revalidatePath("/calendar");
}
