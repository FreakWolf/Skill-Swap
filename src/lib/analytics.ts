import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface MonthlyFlow {
  label: string; // e.g. "Apr"
  earned: number;
  spent: number;
}

export interface SkillCount {
  name: string;
  count: number;
}

export interface Analytics {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  sessionsTaught: number;
  sessionsLearned: number;
  avgRating: number;
  reviewCount: number;
  creditsByMonth: MonthlyFlow[];
  topTaughtSkills: SkillCount[];
}

// Computes the current user's activity analytics from existing tables:
// credit_transactions (ledger), bookings, reviews. All read-only.
export async function getAnalytics(userId: string): Promise<Analytics> {
  const supabase = await createClient();

  const [{ data: ledger }, { data: bookings }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("credit_transactions")
        .select("amount, reason, created_at")
        .eq("user_id", userId),
      supabase
        .from("bookings")
        .select(
          `learner_id, teacher_id, status,
           offering:offerings!bookings_offering_id_fkey (
             skill:skills!offerings_skill_id_fkey ( name )
           )`,
        )
        .or(`learner_id.eq.${userId},teacher_id.eq.${userId}`),
      supabase.from("reviews").select("rating").eq("reviewee_id", userId),
    ]);

  // Ledger totals + balance.
  let totalEarned = 0;
  let totalSpent = 0;
  let balance = 0;
  for (const t of ledger ?? []) {
    const amt = t.amount as number;
    balance += amt;
    if (amt > 0) totalEarned += amt;
    else totalSpent += -amt;
  }

  // Last 6 months of net flow, bucketed by month.
  const now = new Date();
  const months: { key: string; label: string; earned: number; spent: number }[] =
    [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString(undefined, { month: "short" }),
      earned: 0,
      spent: 0,
    });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  for (const t of ledger ?? []) {
    const d = new Date(t.created_at as string);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const idx = monthIndex.get(key);
    if (idx === undefined) continue;
    const amt = t.amount as number;
    if (amt > 0) months[idx].earned += amt;
    else months[idx].spent += -amt;
  }

  // Session counts + top taught skills (completed teaching sessions).
  let sessionsTaught = 0;
  let sessionsLearned = 0;
  const taughtSkill = new Map<string, number>();
  for (const b of bookings ?? []) {
    const isTeacher = (b.teacher_id as string) === userId;
    const completed = b.status === "completed";
    if (completed && isTeacher) {
      sessionsTaught += 1;
      const offering = Array.isArray(b.offering) ? b.offering[0] : b.offering;
      const skill = offering
        ? Array.isArray(offering.skill)
          ? offering.skill[0]
          : offering.skill
        : null;
      const name = (skill?.name as string) ?? "Other";
      taughtSkill.set(name, (taughtSkill.get(name) ?? 0) + 1);
    }
    if (completed && !isTeacher) sessionsLearned += 1;
  }

  const topTaughtSkills = Array.from(taughtSkill.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Rating.
  const ratings = (reviews ?? []).map((r) => r.rating as number);
  const reviewCount = ratings.length;
  const avgRating = reviewCount
    ? ratings.reduce((a, b) => a + b, 0) / reviewCount
    : 0;

  return {
    balance,
    totalEarned,
    totalSpent,
    sessionsTaught,
    sessionsLearned,
    avgRating,
    reviewCount,
    creditsByMonth: months.map((m) => ({
      label: m.label,
      earned: m.earned,
      spent: m.spent,
    })),
    topTaughtSkills,
  };
}
