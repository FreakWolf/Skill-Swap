import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { LedgerReason } from "@/lib/types";

export interface LedgerEntry {
  id: string;
  amount: number;
  reason: LedgerReason;
  created_at: string;
  booking_id: string | null;
  offeringTitle: string | null;
  /** Balance after this entry, oldest to newest. */
  runningBalance: number;
}

export const LEDGER_REASON_LABEL: Record<LedgerReason, string> = {
  signup_grant: "Starter credits",
  booking_hold: "Booked a session",
  booking_refund: "Refund (cancelled session)",
  session_earning: "Taught a session",
  adjustment: "Adjustment by SkillSwap",
  purchase: "Bought credits",
};

export const LEDGER_REASONS = Object.keys(LEDGER_REASON_LABEL) as LedgerReason[];

// Full credit history for the signed-in user with a running balance, newest
// first. RLS limits the query to the user's own rows.
export async function getLedger(
  userId: string,
  opts: { reason?: LedgerReason } = {},
): Promise<LedgerEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credit_transactions")
    .select(
      `id, amount, reason, created_at, booking_id,
       booking:bookings!credit_transactions_booking_id_fkey (
         offering:offerings!bookings_offering_id_fkey ( title )
       )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  let running = 0;
  const all = (data ?? []).map((r) => {
    const booking = Array.isArray(r.booking) ? r.booking[0] : r.booking;
    const offering = booking
      ? Array.isArray(booking.offering)
        ? booking.offering[0]
        : booking.offering
      : null;
    running += r.amount as number;
    return {
      id: r.id as string,
      amount: r.amount as number,
      reason: r.reason as LedgerReason,
      created_at: r.created_at as string,
      booking_id: (r.booking_id as string | null) ?? null,
      offeringTitle: (offering?.title as string | undefined) ?? null,
      runningBalance: running,
    };
  });

  const filtered = opts.reason ? all.filter((e) => e.reason === opts.reason) : all;
  return filtered.reverse();
}
