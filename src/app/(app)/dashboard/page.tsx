import Link from "next/link";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OfferingCard } from "@/components/OfferingCard";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import {
  getRecommendedOfferings,
  getMyBookings,
  getFeaturedOfferings,
  getMyOfferingSummary,
} from "@/lib/data";
import { getSavedOfferingIds } from "@/lib/favorites";
import { getTimeZone, formatInTz } from "@/lib/time";
import {
  Sparkles,
  GraduationCap,
  Coins,
  Bookmark,
  Calendar as CalendarIcon,
  CalendarPlus,
  MessageSquare,
  PlusCircle,
  Search,
  Clock,
} from "lucide-react";

function formatWhen(iso: string, tz: string) {
  return formatInTz(iso, tz, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const [balance, recommended, featured, bookings, mine, savedIds, tz] = await Promise.all([
    getBalance(user.id),
    getRecommendedOfferings(user.id),
    getFeaturedOfferings(user.id, 4),
    getMyBookings(user.id),
    getMyOfferingSummary(user.id),
    getSavedOfferingIds(user.id),
    getTimeZone(),
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
    { label: "Credits", value: balance, icon: Coins, tile: "bg-amber-100 text-amber-700", num: "text-amber-700", href: "/credits" },
    { label: "Sessions taught", value: taught, icon: GraduationCap, tile: "bg-brand-100 text-brand-600", num: "text-brand-600", href: "/sessions" },
    { label: "Sessions learned", value: learned, icon: Sparkles, tile: "bg-brand-orange-100 text-brand-orange-700", num: "text-brand-orange-700", href: "/sessions" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarIcon, tile: "bg-green-100 text-green-600", num: "text-green-600", href: "/calendar" },
    { label: "Saved", value: savedIds.size, icon: Bookmark, tile: "bg-gray-100 text-gray-700", num: "text-gray-700", href: "/saved" },
  ];

  const quickActions = [
    { label: "Find a teacher", href: "/marketplace", icon: Search },
    { label: "Offer a skill", href: "/offer", icon: PlusCircle },
    { label: "Add time slots", href: "/availability", icon: CalendarPlus },
    { label: "Messages", href: "/messages", icon: MessageSquare },
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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-8 text-white shadow-lg">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-orange-400/30 blur-3xl" />
        <h2 className="relative text-2xl font-bold">Trade skills, not cash</h2>
        <p className="relative mt-2 max-w-xl text-brand-50">
          Teach what you know to earn credits, then spend them to learn
          something new. What will you do today?
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Button key={a.href} href={a.href} variant={a.href === "/marketplace" ? "onBrandSolid" : "onBrandGhost"}>
              <a.icon className="h-4 w-4" aria-hidden /> {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="block">
              <Card className="h-full p-4 transition-shadow hover:shadow-md sm:p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${s.tile}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className={`mt-3 text-2xl font-bold sm:mt-4 sm:text-3xl ${s.num}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-brand-orange-500" aria-hidden /> Featured this week
            </h2>
            <Link href="/marketplace" className="-my-1 inline-block py-1 text-sm font-medium text-brand-600 hover:underline">
              See marketplace
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((o) => (
              <OfferingCard key={o.id} offering={o} saved={savedIds.has(o.id)} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
            <Link href="/marketplace" className="-my-1 inline-block py-1 text-sm font-medium text-brand-600 hover:underline">
              Explore all
            </Link>
          </div>
          {recommended.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {recommended.map((o) => (
                <OfferingCard key={o.id} offering={o} saved={savedIds.has(o.id)} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-gray-500">
              No matches yet. As people publish skills you want to learn,
              they&apos;ll show up here.
            </Card>
          )}
        </section>

        <div className="space-y-6">
          {/* Upcoming sessions */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
              <Link href="/sessions" className="-my-1 inline-block py-1 text-sm font-medium text-brand-600 hover:underline">
                View all
              </Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map((b) => (
                  <Card key={b.id} className="rounded-r border-l-4 border-brand-500 bg-brand-50/50 p-4">
                    <p className="font-medium text-gray-900">{b.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {b.learner_id === user.id ? "Learning" : "Teaching"} ·{" "}
                      {formatWhen(b.starts_at, tz)}
                    </p>
                    <Button href={`/sessions/${b.id}`} size="sm" className="mt-3 w-full">
                      View session
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-sm text-gray-500">
                No upcoming sessions.{" "}
                <Link href="/marketplace" className="font-medium text-brand-600 hover:underline">
                  Find a teacher
                </Link>
                .
              </Card>
            )}
          </section>

          {/* Your offerings */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your offerings</h2>
              <Link href="/availability" className="-my-1 inline-block py-1 text-sm font-medium text-brand-600 hover:underline">
                Manage
              </Link>
            </div>
            <Card className="p-4">
              {mine.total === 0 ? (
                <div className="text-center text-sm text-gray-500">
                  You haven&apos;t published a skill yet.
                  <Button href="/offer" variant="brand" size="sm" className="mt-3 block w-full">Offer a skill</Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge className="bg-green-50 text-green-700">{mine.active} active</Badge>
                    {mine.paused > 0 && <Badge>{mine.paused} paused</Badge>}
                    {mine.featured > 0 && <Badge className="bg-brand-orange-50 text-brand-orange-700">{mine.featured} featured</Badge>}
                  </div>
                  <ul className="mt-3 divide-y divide-[var(--border)]">
                    {mine.latest.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <Link href={`/offerings/${o.id}`} className="min-w-0 truncate font-medium text-gray-900 hover:underline">
                          {o.title}
                        </Link>
                        <Link href={`/offerings/${o.id}/edit`} className="shrink-0 text-brand-600 hover:underline">
                          Edit
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata = { title: "Dashboard" };
