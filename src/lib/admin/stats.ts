import "server-only";

import { adminDb } from "./shared";

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

interface RawStats {
  users: number;
  new_users_30d: number;
  suspended: number;
  offerings: number;
  active_offerings: number;
  bookings: number;
  bookings_by_status: Record<string, number>;
  credits_in_circulation: number;
  revenue_paise: number;
  paid_purchases: number;
  open_reports: number;
  open_tickets: number;
  signups_by_week: { week: string; count: number }[];
  bookings_by_week: { week: string; count: number }[];
  top_skills: { name: string; count: number }[];
}

const WEEKS = 8;

// Fill the last 8 ISO weeks so the chart always has 8 columns, even when a
// week had no rows.
function weekly(rows: { week: string; count: number }[]): WeeklyCount[] {
  const byWeek = new Map(rows.map((r) => [new Date(r.week).toISOString().slice(0, 10), Number(r.count)]));
  const out: WeeklyCount[] = [];
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  for (let i = WEEKS - 1; i >= 0; i--) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    out.push({
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      count: byWeek.get(key) ?? 0,
    });
  }
  return out;
}

// All counts come from one SQL function (admin_overview_stats in 0009), so
// nothing downloads whole tables to count them.
export async function getAdminStats(): Promise<AdminStats> {
  const admin = await adminDb();
  const { data, error } = await admin.rpc("admin_overview_stats");
  if (error || !data) {
    console.error(`[admin] admin_overview_stats: ${error?.message ?? "no data"}`);
    throw new Error("Could not load admin statistics");
  }
  const s = data as RawStats;
  return {
    users: Number(s.users),
    newUsers30d: Number(s.new_users_30d),
    suspended: Number(s.suspended),
    offerings: Number(s.offerings),
    activeOfferings: Number(s.active_offerings),
    bookings: Number(s.bookings),
    bookingsByStatus: Object.fromEntries(
      Object.entries(s.bookings_by_status ?? {}).map(([k, v]) => [k, Number(v)]),
    ),
    creditsInCirculation: Number(s.credits_in_circulation),
    revenuePaise: Number(s.revenue_paise),
    paidPurchases: Number(s.paid_purchases),
    openReports: Number(s.open_reports),
    openTickets: Number(s.open_tickets),
    signupsByWeek: weekly(s.signups_by_week ?? []),
    bookingsByWeek: weekly(s.bookings_by_week ?? []),
    topSkills: (s.top_skills ?? []).map((t) => ({ name: t.name, count: Number(t.count) })),
  };
}
