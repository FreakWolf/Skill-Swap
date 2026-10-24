import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { one } from "./shared";

export interface WeeklyCount {
  label: string;
  count: number;
}

export interface AdminStats {
  users: number;
  newUsers30d: number;
  suspended: number;
  offerings: number;
  activeOfferings: number;
  bookings: number;
  bookingsByStatus: Record<string, number>;
  creditsInCirculation: number;
  revenuePaise: number;
  paidPurchases: number;
  openReports: number;
  openTickets: number;
  signupsByWeek: WeeklyCount[];
  bookingsByWeek: WeeklyCount[];
  topSkills: { name: string; count: number }[];
}

const WEEKS = 8;

function weekBuckets(): { start: Date; label: string }[] {
  const now = new Date();
  const out: { start: Date; label: string }[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() - i * 7 - 6);
    start.setUTCHours(0, 0, 0, 0);
    out.push({
      start,
      label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

function bucketise(dates: string[]): WeeklyCount[] {
  const buckets = weekBuckets();
  const counts = buckets.map(() => 0);
  for (const iso of dates) {
    const t = new Date(iso).getTime();
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (t >= buckets[i].start.getTime()) {
        counts[i]++;
        break;
      }
    }
  }
  return buckets.map((b, i) => ({ label: b.label, count: counts[i] }));
}

export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const since8w = weekBuckets()[0].start.toISOString();

  const [
    users,
    newUsers,
    suspended,
    offerings,
    activeOfferings,
    bookings,
    bookingStatuses,
    balances,
    purchases,
    openReports,
    openTickets,
    signups,
    recentBookings,
    offeringSkills,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since30),
    admin.from("profiles").select("id", { count: "exact", head: true }).not("suspended_at", "is", null),
    admin.from("offerings").select("id", { count: "exact", head: true }),
    admin.from("offerings").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("bookings").select("id", { count: "exact", head: true }),
    admin.from("bookings").select("status"),
    admin.from("credit_balances").select("balance"),
    admin.from("credit_purchases").select("amount_paise").eq("status", "paid"),
    admin.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("profiles").select("created_at").gte("created_at", since8w),
    admin.from("bookings").select("created_at").gte("created_at", since8w),
    admin.from("offerings").select("skill:skills!offerings_skill_id_fkey ( name )").eq("is_active", true),
  ]);

  const bookingsByStatus: Record<string, number> = {};
  for (const b of bookingStatuses.data ?? []) {
    bookingsByStatus[b.status as string] = (bookingsByStatus[b.status as string] ?? 0) + 1;
  }

  const skillCounts = new Map<string, number>();
  for (const row of offeringSkills.data ?? []) {
    const name = (one(row.skill) as { name: string } | null)?.name;
    if (name) skillCounts.set(name, (skillCounts.get(name) ?? 0) + 1);
  }
  const topSkills = [...skillCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    users: users.count ?? 0,
    newUsers30d: newUsers.count ?? 0,
    suspended: suspended.count ?? 0,
    offerings: offerings.count ?? 0,
    activeOfferings: activeOfferings.count ?? 0,
    bookings: bookings.count ?? 0,
    bookingsByStatus,
    creditsInCirculation: (balances.data ?? []).reduce((s, r) => s + Number(r.balance ?? 0), 0),
    revenuePaise: (purchases.data ?? []).reduce((s, r) => s + Number(r.amount_paise ?? 0), 0),
    paidPurchases: purchases.data?.length ?? 0,
    openReports: openReports.count ?? 0,
    openTickets: openTickets.count ?? 0,
    signupsByWeek: bucketise((signups.data ?? []).map((r) => r.created_at as string)),
    bookingsByWeek: bucketise((recentBookings.data ?? []).map((r) => r.created_at as string)),
    topSkills,
  };
}
