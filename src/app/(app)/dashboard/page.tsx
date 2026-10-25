import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfferingCard } from "@/components/OfferingCard";
import { CreditPill } from "@/components/CreditPill";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { requireUser, getBalance } from "@/lib/auth";
import { getRecommendedOfferings, getMyBookings } from "@/lib/data";
import { getTimeZone, formatInTz } from "@/lib/time";
import {
  Sparkles,
  GraduationCap,
  Coins,
  Star,
  Search,
  CalendarX,
  Calendar as CalendarIcon,
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
  const [balance, recommended, bookings, tz] = await Promise.all([
    getBalance(user.id),
    getRecommendedOfferings(user.id),
    getMyBookings(user.id),
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
    { label: "Credits", value: balance, icon: Coins, tile: "bg-accent-soft text-accent-fg", num: "text-accent-fg" },
    { label: "Sessions taught", value: taught, icon: GraduationCap, tile: "bg-brand-soft text-brand-soft-fg", num: "text-link" },
    { label: "Sessions learned", value: learned, icon: Sparkles, tile: "bg-warning-soft text-warning-fg", num: "text-warning-fg" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarIcon, tile: "bg-success-soft text-success-fg", num: "text-success-fg" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted">Welcome back, {firstName}.</p>
        </div>
        <CreditPill balance={balance} animate />
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-hero relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8">
        <div aria-hidden className="blob -right-10 -top-16 h-56 w-56 bg-brand-orange-500/30" />
        <div aria-hidden className="blob -bottom-24 left-1/3 h-56 w-56 bg-brand-400/40 [animation-delay:-6s]" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Trade skills, not cash</h2>
          <p className="mt-2 max-w-xl text-white">
            Teach what you know to earn credits, then spend them to learn
            something new. What will you do today?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/marketplace" variant="onBrandSolid">
              Find a teacher
            </ButtonLink>
            <ButtonLink href="/offer" variant="onBrandGhost">
              Offer a skill
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={i} className="glass lift rounded-3xl p-4 sm:p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${s.tile}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className={`mt-3 text-3xl font-extrabold tracking-tight sm:mt-4 ${s.num}`}>
                <CountUp value={s.value} />
              </p>
              <p className="text-sm text-muted">{s.label}</p>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Recommended for you</h2>
            <Link href="/marketplace" className="-my-1 inline-block rounded py-1 text-sm font-semibold text-link hover:underline">
              Explore all
            </Link>
          </div>
          {recommended.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recommended.map((o, i) => (
                <Reveal key={o.id} delay={i}>
                  <OfferingCard offering={o} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title="No matches yet" headingLevel={3}>
              As people publish skills you want to learn, they&apos;ll show up here.
            </EmptyState>
          )}
        </section>

        {/* Upcoming sessions */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Upcoming</h2>
            <Link href="/sessions" className="-my-1 inline-block rounded py-1 text-sm font-semibold text-link hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((b, i) => (
                <Reveal key={b.id} delay={i}>
                  <Card className="relative overflow-hidden p-4 pl-5">
                    <span aria-hidden className="bg-gradient-primary absolute inset-y-0 left-0 w-1.5" />
                    <p className="font-semibold text-foreground">{b.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                      <Star className="h-3.5 w-3.5" aria-hidden />
                      {b.learner_id === user.id ? "Learning" : "Teaching"} ·{" "}
                      {formatWhen(b.starts_at, tz)}
                    </p>
                    <ButtonLink href={`/sessions/${b.id}`} size="sm" className="mt-3 w-full">
                      View session
                    </ButtonLink>
                  </Card>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarX} title="No upcoming sessions" headingLevel={3}>
              <Link href="/marketplace" className="font-semibold text-link hover:underline">
                Find a teacher
              </Link>{" "}
              to book your first one.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

export const metadata = { title: "Dashboard" };
