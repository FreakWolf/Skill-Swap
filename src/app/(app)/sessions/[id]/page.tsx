import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { getBookingDetail, hasReviewed } from "@/lib/data";
import { ArrowLeft, CheckCircle2, Video } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
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
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All sessions
      </Link>

      {booked && (
        <Alert tone="success" className="animate-fade-up flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Booked! Your credits are held and will transfer to the teacher once
            you confirm the session happened.
          </span>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone={booking.status === "completed" ? "success" : booking.status === "confirmed" ? "brand" : "neutral"} className="capitalize">{booking.status}</Badge>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {booking.title}
            </h1>
            {booking.skillName && (
              <p className="text-muted">{booking.skillName}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent-fg">
            {iAmLearner ? "-" : "+"}
            {booking.credit_cost} cr
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Avatar name={other?.full_name ?? ""} url={other?.avatar_url} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {other?.full_name || "SkillSwap member"}
            </p>
            <p className="text-sm text-muted">
              {iAmLearner ? "Your teacher" : "Your learner"}
            </p>
          </div>
          {/* Own row on phones, beside the name on wider screens. */}
          {other?.id && (
            <div className="flex w-full flex-wrap items-center gap-1 sm:ml-auto sm:w-auto">
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
          <div className="rounded-2xl bg-input p-3">
            <dt className="text-muted">When</dt>
            <dd className="font-medium text-foreground">{when(booking.starts_at, tz)}</dd>
          </div>
          <div className="rounded-2xl bg-input p-3">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-foreground">
              {iAmLearner ? "Learning" : "Teaching"}
            </dd>
          </div>
        </dl>

        {booking.notes && (
          <div className="mt-4 rounded-2xl bg-input p-3 text-sm text-muted">
            <span className="font-semibold text-foreground">Learner note: </span>
            {booking.notes}
          </div>
        )}

        {/* Interim: SkillSwap doesn't create meeting links yet, so tell people how to meet. */}
        {booking.status === "confirmed" && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-link/30 bg-brand-soft p-4 text-sm text-foreground">
            <Video className="mt-0.5 h-4 w-4 shrink-0 text-link" aria-hidden />
            <p>
              <span className="font-semibold">How to meet: </span>
              {booking.mode === "in_person"
                ? "agree on a safe, public place and time with "
                : "share a Zoom or Google Meet link with "}
              {other?.full_name || "your partner"} in{" "}
              <Link href="/messages" className="font-semibold text-link underline-offset-2 hover:underline">
                Messages
              </Link>{" "}
              before the session starts.
            </p>
          </div>
        )}
      </Card>

      {/* Session controls */}
      {booking.status === "confirmed" && (
        <Card className="p-6">
          <h2 className="mb-3 font-semibold tracking-tight text-foreground">Session controls</h2>
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
          <h2 className="mb-3 font-semibold tracking-tight text-foreground">Rate this session</h2>
          {alreadyReviewed ? (
            <p className="text-sm text-muted">
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
        <Card className="p-6 text-sm text-muted">
          This session was cancelled and any held credits were refunded.
        </Card>
      )}
    </div>
  );
}

export const metadata = { title: "Session" };
