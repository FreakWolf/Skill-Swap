import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { getBookingDetail, hasReviewed } from "@/lib/data";
import { MessageButton } from "@/components/MessageButton";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { getTimeZone, formatInTz } from "@/lib/time";
import { SessionActions } from "./SessionActions";
import { ReviewForm } from "./ReviewForm";

// Must match the teacher fallback window in complete_booking() (0005 migration).
const TEACHER_CLAIM_DELAY_MS = 48 * 60 * 60 * 1000;

function when(iso: string, tz: string) {
  return formatInTz(iso, tz, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ booked?: string }>;
}) {
  const { id } = await params;
  const { booked } = await searchParams;
  const { user } = await requireUser();

  const booking = await getBookingDetail(id);
  if (!booking) notFound();

  // Only participants may view.
  if (booking.learner_id !== user.id && booking.teacher_id !== user.id) {
    redirect("/sessions");
  }

  const iAmLearner = booking.learner_id === user.id;
  const other = iAmLearner ? booking.teacher : booking.learner;
  const [alreadyReviewed, tz] = await Promise.all([
    hasReviewed(id, user.id),
    getTimeZone(),
  ]);

  // What this participant may do right now. Mirrors the rules enforced in the
  // complete_booking / cancel_booking database functions.
  const now = new Date().getTime();
  const startsAt = new Date(booking.starts_at).getTime();
  const teacherClaimAt =
    new Date(booking.ends_at).getTime() + TEACHER_CLAIM_DELAY_MS;
  const started = now >= startsAt;

  const canCancel = !started;
  const canComplete = iAmLearner ? started : now >= teacherClaimAt;
  const completeLabel = iAmLearner ? "Confirm session happened" : "Claim credits";

  let hint: string;
  if (!started) {
    hint = iAmLearner
      ? "You can confirm the session once it starts. Cancelling before then refunds your credits."
      : "Your learner confirms completion after the session. You can cancel before it starts, which refunds them.";
  } else if (iAmLearner) {
    hint = `Confirming releases ${booking.credit_cost} credit(s) to your teacher. Only confirm if the session took place. If it didn't, use "Report a problem" above.`;
  } else if (canComplete) {
    hint = "Your learner hasn't confirmed within 48 hours of the session ending, so you can claim the credits now.";
  } else {
    hint = `Waiting for your learner to confirm. If they don't, you can claim the credits from ${when(new Date(teacherClaimAt).toISOString(), tz)}.`;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/sessions" className="text-sm text-slate-500 hover:underline">
        ← All sessions
      </Link>

      {booked && (
        <div className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700">
          Booked! Your credits are held and will transfer to the teacher once
          you confirm the session happened.
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="capitalize">{booking.status}</Badge>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {booking.title}
            </h1>
            {booking.skillName && (
              <p className="text-slate-500">{booking.skillName}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold text-amber-600">
            {iAmLearner ? "-" : "+"}
            {booking.credit_cost} cr
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-4">
          <Avatar name={other?.full_name ?? ""} url={other?.avatar_url} size={44} />
          <div>
            <p className="font-medium text-slate-900">
              {other?.full_name || "SkillSwap member"}
            </p>
            <p className="text-sm text-slate-500">
              {iAmLearner ? "Your teacher" : "Your learner"}
            </p>
          </div>
          {other?.id && (
            <div className="ml-auto flex flex-wrap items-center gap-1">
              <MessageButton otherId={other.id} />
              <ReportDialog
                userId={other.id}
                userName={other.full_name || "this member"}
                contextType="session"
                contextId={booking.id}
                label="Report a problem"
              />
            </div>
          )}
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">When</dt>
            <dd className="font-medium text-slate-800">{when(booking.starts_at, tz)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Role</dt>
            <dd className="font-medium text-slate-800">
              {iAmLearner ? "Learning" : "Teaching"}
            </dd>
          </div>
        </dl>

        {booking.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Learner note: </span>
            {booking.notes}
          </div>
        )}
      </Card>

      {/* Session controls */}
      {booking.status === "confirmed" && (
        <Card className="p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Session controls</h2>
          <SessionActions
            bookingId={booking.id}
            canComplete={canComplete}
            canCancel={canCancel}
            completeLabel={completeLabel}
            hint={hint}
          />
        </Card>
      )}

      {/* Rating after completion */}
      {booking.status === "completed" && (
        <Card className="p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Rate this session</h2>
          {alreadyReviewed ? (
            <p className="text-sm text-slate-500">
              You&apos;ve already reviewed this session. Thanks!
            </p>
          ) : (
            <ReviewForm
              bookingId={booking.id}
              revieweeId={other?.id ?? ""}
              revieweeName={other?.full_name || "your partner"}
            />
          )}
        </Card>
      )}

      {booking.status === "cancelled" && (
        <Card className="p-6 text-sm text-slate-500">
          This session was cancelled and any held credits were refunded.
        </Card>
      )}
    </div>
  );
}

export const metadata = { title: "Session" };
