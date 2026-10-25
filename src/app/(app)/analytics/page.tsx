import {
  Coins,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Sparkles,
  Star,
} from "lucide-react";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { MiniBarChart } from "@/components/charts/MiniBarChart";
import { BarList } from "@/components/charts/BarList";
import { requireUser } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const { user } = await requireUser();
  const a = await getAnalytics(user.id);

  const stats = [
    { label: "Balance", value: a.balance, icon: Coins, tile: "bg-accent-soft text-accent-fg", num: "text-accent-fg" },
    { label: "Credits earned", value: a.totalEarned, icon: TrendingUp, tile: "bg-success-soft text-success-fg", num: "text-success-fg" },
    { label: "Credits spent", value: a.totalSpent, icon: TrendingDown, tile: "bg-danger-soft text-danger-fg", num: "text-danger-fg" },
    { label: "Sessions taught", value: a.sessionsTaught, icon: GraduationCap, tile: "bg-brand-soft text-brand-soft-fg", num: "text-link" },
    { label: "Sessions learned", value: a.sessionsLearned, icon: Sparkles, tile: "bg-accent-soft text-accent-fg", num: "text-accent-fg" },
    {
      label: "Avg rating",
      value: a.reviewCount > 0 ? a.avgRating.toFixed(1) : "—",
      icon: Star,
      tile: "bg-warning-soft text-warning-fg",
      num: "text-warning-fg",
      sub: a.reviewCount > 0 ? `${a.reviewCount} review${a.reviewCount > 1 ? "s" : ""}` : "No reviews",
    },
  ];

  const hasActivity =
    a.totalEarned > 0 || a.totalSpent > 0 || a.sessionsTaught > 0 || a.sessionsLearned > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-muted">
          Your teaching and learning activity at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={i} className="glass lift rounded-3xl p-4 sm:p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.tile}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className={`mt-4 text-3xl font-extrabold tracking-tight ${s.num}`}>
                {typeof s.value === "number" ? <CountUp value={s.value} /> : s.value}
              </p>
              <p className="text-sm text-muted">{s.label}</p>
              {"sub" in s && s.sub && (
                <p className="text-xs text-muted">{s.sub}</p>
              )}
            </Reveal>
          );
        })}
      </div>

      {!hasActivity ? (
        <EmptyState icon={BarChart3} title="No activity yet">
          Once you teach or learn, your credit flow and skill stats will show up here.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Credits over time */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold tracking-tight text-foreground">
              Credits over time
            </h2>
            <MiniBarChart data={a.creditsByMonth} />
          </Card>

          {/* Top taught skills */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold tracking-tight text-foreground">
              Top skills you teach
            </h2>
            {a.topTaughtSkills.length > 0 ? (
              <BarList items={a.topTaughtSkills} />
            ) : (
              <p className="text-sm text-muted">
                Complete a teaching session to see your top skills.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export const metadata = { title: "Analytics" };
