import Link from "next/link";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/Avatar";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import { getMyBookings, type BookingWithDetails } from "@/lib/data";

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusStyle: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-600",
  completed: "bg-teal-50 text-teal-700",
  cancelled: "bg-slate-100 text-slate-500",
  pending: "bg-amber-50 text-amber-700",
};

function SessionRow({
  b,
  userId,
}: {
  b: BookingWithDetails;
  userId: string;
}) {
  const iAmLearner = b.learner_id === userId;
  const other = iAmLearner ? b.teacher : b.learner;
  return (
    <Link href={`/sessions/${b.id}`}>
      <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
        <Avatar name={other?.full_name ?? ""} url={other?.avatar_url} size={44} />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{b.title}</p>
          <p className="truncate text-sm text-slate-500">
            {iAmLearner ? "Learning from" : "Teaching"}{" "}
            {other?.full_name || "member"} · {when(b.starts_at)}
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <Badge className={statusStyle[b.status] ?? ""}>{b.status}</Badge>
          <span className="text-xs text-slate-400">
            {iAmLearner ? "-" : "+"}
            {b.credit_cost} cr
          </span>
        </div>
      </Card>
    </Link>
  );
}

export default async function SessionsPage() {
  const { user } = await requireUser();
  const [bookings, balance] = await Promise.all([
    getMyBookings(user.id),
    getBalance(user.id),
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
          <h1 className="text-2xl font-bold text-slate-900">Your sessions</h1>
          <p className="mt-1 text-slate-600">
            Manage bookings and track your credits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="outline" size="sm">Calendar</Button>
          </Link>
          <CreditPill balance={balance} />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <SessionRow key={b.id} b={b} userId={user.id} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-sm text-slate-500">
            Nothing scheduled.{" "}
            <Link href="/marketplace" className="font-medium text-blue-600 hover:underline">
              Find a teacher
            </Link>
            .
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">History</h2>
        {past.length > 0 ? (
          <div className="space-y-3">
            {past.map((b) => (
              <SessionRow key={b.id} b={b} userId={user.id} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-sm text-slate-500">
            No past sessions yet.
          </Card>
        )}
      </section>
    </div>
  );
}
