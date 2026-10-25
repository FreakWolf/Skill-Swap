import Link from "next/link";
import { CalendarDays, CalendarX, History } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { Avatar } from "@/components/Avatar";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import { getMyBookings, type BookingWithDetails } from "@/lib/data";
import { getTimeZone, formatInTz } from "@/lib/time";

function when(iso: string, tz: string) {
  return formatInTz(iso, tz, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusTone: Record<string, "brand" | "success" | "neutral" | "warning"> = {
  confirmed: "brand",
  completed: "success",
  cancelled: "neutral",
  pending: "warning",
};

function SessionRow({
  b,
  userId,
  tz,
}: {
  b: BookingWithDetails;
  userId: string;
  tz: string;
}) {
  const iAmLearner = b.learner_id === userId;
  const other = iAmLearner ? b.teacher : b.learner;
  return (
    <Link
      href={`/sessions/${b.id}`}
      className="lift flex items-center gap-4 rounded-3xl border border-border bg-card-solid p-4 shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
        <Avatar name={other?.full_name ?? ""} url={other?.avatar_url} size={44} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{b.title}</p>
          <p className="truncate text-sm text-muted">
            {iAmLearner ? "Learning from" : "Teaching"}{" "}
            {other?.full_name || "member"} · {when(b.starts_at, tz)}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
          <Badge tone={statusTone[b.status] ?? "neutral"} className="capitalize">{b.status}</Badge>
          <span className={iAmLearner ? "text-xs font-semibold text-muted" : "text-xs font-semibold text-success-fg"}>
            {iAmLearner ? "-" : "+"}
            {b.credit_cost} cr
          </span>
        </div>
    </Link>
  );
}

export default async function SessionsPage() {
  const { user } = await requireUser();
  const [bookings, balance, tz] = await Promise.all([
    getMyBookings(user.id),
    getBalance(user.id),
    getTimeZone(),
  ]);

  const isUpcoming = (b: BookingWithDetails) =>
    b.status === "confirmed" &&
    new Date(b.starts_at).getTime() >= new Date().getTime();
  const upcoming = bookings.filter(isUpcoming);
  const past = bookings.filter((b) => !isUpcoming(b));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your sessions</h1>
          <p className="mt-1 text-muted">
            Manage bookings and track your credits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/calendar" variant="outline" size="sm">
            <CalendarDays className="h-4 w-4" aria-hidden /> Calendar
          </ButtonLink>
          <CreditPill balance={balance} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((b, i) => (
              <Reveal key={b.id} delay={i}>
                <SessionRow b={b} userId={user.id} tz={tz} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarX} title="Nothing scheduled" headingLevel={3}>
            <Link href="/marketplace" className="font-semibold text-link hover:underline">
              Find a teacher
            </Link>{" "}
            to book your next session.
          </EmptyState>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">History</h2>
        {past.length > 0 ? (
          <div className="space-y-3">
            {past.map((b, i) => (
              <Reveal key={b.id} delay={i}>
                <SessionRow b={b} userId={user.id} tz={tz} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState icon={History} title="No past sessions yet" headingLevel={3} />
        )}
      </section>
    </div>
  );
}

export const metadata = { title: "Sessions" };
