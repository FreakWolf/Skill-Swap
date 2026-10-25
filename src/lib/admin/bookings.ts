import "server-only";

import type { Booking } from "@/lib/types";
import { adminDb, PAGE_SIZE, one, paged, range, type Paged } from "./shared";

export interface AdminBooking extends Booking {
  offering_title: string;
  learner_name: string;
  teacher_name: string;
}

export async function listBookings(opts: {
  status?: string;
  page: number;
}): Promise<Paged<AdminBooking>> {
  const admin = await adminDb();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("bookings")
    .select(
      "*, offering:offerings!bookings_offering_id_fkey ( title ), learner:profiles!bookings_learner_id_fkey ( full_name ), teacher:profiles!bookings_teacher_id_fkey ( full_name )",
      { count: "exact" },
    )
    .order("starts_at", { ascending: false })
    .range(from, to);
  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);
  const { data, count } = await query;
  const rows = (data ?? []).map((b) => ({
    ...(b as unknown as Booking),
    offering_title: (one(b.offering) as { title: string } | null)?.title ?? "Offering",
    learner_name: (one(b.learner) as { full_name: string } | null)?.full_name ?? "",
    teacher_name: (one(b.teacher) as { full_name: string } | null)?.full_name ?? "",
  }));
  return paged(rows, count, opts.page);
}
