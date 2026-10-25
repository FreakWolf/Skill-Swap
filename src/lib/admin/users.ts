import "server-only";

import type { Booking, CreditTransaction, Offering, Profile, Report } from "@/lib/types";
import { adminDb, PAGE_SIZE, like, one, paged, range, type Paged } from "./shared";

export type UserFilter = "all" | "admins" | "suspended";

export async function listUsers(opts: {
  q?: string;
  filter?: UserFilter;
  page: number;
}): Promise<Paged<Profile>> {
  const admin = await adminDb();
  const { from, to } = range(opts.page, PAGE_SIZE);
  let query = admin
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (opts.q) query = query.ilike("full_name", like(opts.q));
  if (opts.filter === "admins") query = query.eq("is_admin", true);
  if (opts.filter === "suspended") query = query.not("suspended_at", "is", null);
  const { data, count } = await query;
  return paged(data as Profile[] | null, count, opts.page);
}

export interface UserDetail {
  profile: Profile;
  email: string;
  balance: number;
  ledger: (CreditTransaction & { offering_title: string | null })[];
  bookings: (Booking & { offering_title: string; other_name: string })[];
  offerings: Offering[];
  reportsAbout: (Report & { reporter_name: string })[];
  reportsBy: number;
}

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  const admin = await adminDb();
  const { data: profile } = await admin.from("profiles").select("*").eq("id", id).maybeSingle<Profile>();
  if (!profile) return null;

  const [authUser, balance, ledger, bookings, offerings, reportsAbout, reportsBy] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("credit_balances").select("balance").eq("user_id", id).maybeSingle<{ balance: number }>(),
    admin
      .from("credit_transactions")
      .select("*, booking:bookings!credit_transactions_booking_id_fkey ( offering:offerings!bookings_offering_id_fkey ( title ) )")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("bookings")
      .select(
        "*, offering:offerings!bookings_offering_id_fkey ( title ), learner:profiles!bookings_learner_id_fkey ( full_name ), teacher:profiles!bookings_teacher_id_fkey ( full_name )",
      )
      .or(`learner_id.eq.${id},teacher_id.eq.${id}`)
      .order("starts_at", { ascending: false })
      .limit(20),
    admin.from("offerings").select("*").eq("teacher_id", id).order("created_at", { ascending: false }),
    admin
      .from("reports")
      .select("*, reporter:profiles!reports_reporter_id_fkey ( full_name )")
      .eq("reported_user_id", id)
      .order("created_at", { ascending: false }),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("reporter_id", id),
  ]);

  return {
    profile,
    email: authUser.data.user?.email ?? "",
    balance: balance.data?.balance ?? 0,
    ledger: (ledger.data ?? []).map((r) => {
      const booking = one(r.booking) as { offering: unknown } | null;
      const offering = booking ? (one(booking.offering) as { title: string } | null) : null;
      return { ...(r as unknown as CreditTransaction), offering_title: offering?.title ?? null };
    }),
    bookings: (bookings.data ?? []).map((b) => {
      const offering = one(b.offering) as { title: string } | null;
      const learner = one(b.learner) as { full_name: string } | null;
      const teacher = one(b.teacher) as { full_name: string } | null;
      const isLearner = b.learner_id === id;
      return {
        ...(b as unknown as Booking),
        offering_title: offering?.title ?? "Offering",
        other_name: (isLearner ? teacher?.full_name : learner?.full_name) ?? "Member",
      };
    }),
    offerings: (offerings.data ?? []) as Offering[],
    reportsAbout: (reportsAbout.data ?? []).map((r) => ({
      ...(r as unknown as Report),
      reporter_name: (one(r.reporter) as { full_name: string } | null)?.full_name ?? "Member",
    })),
    reportsBy: reportsBy.count ?? 0,
  };
}
