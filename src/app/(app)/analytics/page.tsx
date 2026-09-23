import {
  Coins,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Sparkles,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MiniBarChart } from "@/components/charts/MiniBarChart";
import { BarList } from "@/components/charts/BarList";
import { requireUser } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const { user } = await requireUser();
  const a = await getAnalytics(user.id);

  const stats = [
    { label: "Balance", value: a.balance, icon: Coins, tile: "bg-amber-100 text-amber-600", num: "text-amber-600" },
    { label: "Credits earned", value: a.totalEarned, icon: TrendingUp, tile: "bg-green-100 text-green-600", num: "text-green-600" },
    { label: "Credits spent", value: a.totalSpent, icon: TrendingDown, tile: "bg-red-100 text-red-600", num: "text-red-600" },
    { label: "Sessions taught", value: a.sessionsTaught, icon: GraduationCap, tile: "bg-blue-100 text-blue-600", num: "text-blue-600" },
    { label: "Sessions learned", value: a.sessionsLearned, icon: Sparkles, tile: "bg-purple-100 text-purple-600", num: "text-purple-600" },
    {
      label: "Avg rating",
      value: a.reviewCount > 0 ? a.avgRating.toFixed(1) : "—",
      icon: Star,
      tile: "bg-yellow-100 text-yellow-600",
      num: "text-yellow-600",
      sub: a.reviewCount > 0 ? `${a.reviewCount} review${a.reviewCount > 1 ? "s" : ""}` : "No reviews",
    },
  ];

  const hasActivity =
    a.totalEarned > 0 || a.totalSpent > 0 || a.sessionsTaught > 0 || a.sessionsLearned > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">
          Your teaching and learning activity at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.tile}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={`mt-4 text-3xl font-bold ${s.num}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              {"sub" in s && s.sub && (
                <p className="text-xs text-gray-400">{s.sub}</p>
              )}
            </Card>
          );
        })}
      </div>

      {!hasActivity ? (
        <Card className="p-10 text-center text-sm text-gray-500">
          No activity yet. Once you teach or learn, your credit flow and skill
          stats will show up here.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Credits over time */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-gray-900">
              Credits over time
            </h2>
            <MiniBarChart data={a.creditsByMonth} />
          </Card>

          {/* Top taught skills */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-gray-900">
              Top skills you teach
            </h2>
            {a.topTaughtSkills.length > 0 ? (
              <BarList items={a.topTaughtSkills} />
            ) : (
              <p className="text-sm text-gray-500">
                Complete a teaching session to see your top skills.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
