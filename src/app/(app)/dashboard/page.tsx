import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OfferingCard } from "@/components/OfferingCard";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import { getRecommendedOfferings, getMyBookings } from "@/lib/data";
import {
  Sparkles,
  GraduationCap,
  Coins,
  Star,
  Calendar as CalendarIcon,
} from "lucide-react";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const [balance, recommended, bookings] = await Promise.all([
    getBalance(user.id),
    getRecommendedOfferings(user.id),
    getMyBookings(user.id),
  ]);

  const now = new Date().getTime();
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.starts_at).getTime() >= now,
  );
  const taught = bookings.filter(
    (b) => b.teacher_id === user.id && b.status === "completed",
  ).length;
  const learned = bookings.filter(
    (b) => b.learner_id === user.id && b.status === "completed",
  ).length;

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  const stats = [
    { label: "Credits", value: balance, icon: Coins, tile: "bg-amber-100 text-amber-600", num: "text-amber-600" },
    { label: "Sessions taught", value: taught, icon: GraduationCap, tile: "bg-blue-100 text-blue-600", num: "text-blue-600" },
    { label: "Sessions learned", value: learned, icon: Sparkles, tile: "bg-purple-100 text-purple-600", num: "text-purple-600" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarIcon, tile: "bg-green-100 text-green-600", num: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {firstName}.</p>
        </div>
        <CreditPill balance={balance} />
      </div>

      {/* Hero banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold">Trade skills, not cash</h2>
        <p className="mt-2 max-w-xl text-blue-50">
          Teach what you know to earn credits, then spend them to learn
          something new. What will you do today?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/marketplace">
            <Button variant="onBrandSolid">Find a teacher</Button>
          </Link>
          <Link href="/offer">
            <Button variant="onBrandGhost">Offer a skill</Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5 transition-shadow hover:shadow-md">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.tile}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={`mt-4 text-3xl font-bold ${s.num}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
            <Link href="/marketplace" className="text-sm font-medium text-blue-600 hover:underline">
              Explore all
            </Link>
          </div>
          {recommended.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recommended.map((o) => (
                <OfferingCard key={o.id} offering={o} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-gray-500">
              No matches yet. As people publish skills you want to learn,
              they&apos;ll show up here.
            </Card>
          )}
        </section>

        {/* Upcoming sessions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
            <Link href="/sessions" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((b) => (
                <Card key={b.id} className="rounded-r border-l-4 border-blue-500 bg-blue-50/50 p-4">
                  <p className="font-medium text-gray-900">{b.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                    <Star className="h-3.5 w-3.5" />
                    {b.learner_id === user.id ? "Learning" : "Teaching"} ·{" "}
                    {formatWhen(b.starts_at)}
                  </p>
                  <Link href={`/sessions/${b.id}`}>
                    <Button size="sm" className="mt-3 w-full">
                      View session
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-gray-500">
              No upcoming sessions.{" "}
              <Link href="/marketplace" className="font-medium text-blue-600 hover:underline">
                Find a teacher
              </Link>
              .
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
