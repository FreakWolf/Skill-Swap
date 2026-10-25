import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins, MessageCircle } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { requireUser, getBalance } from "@/lib/auth";
import {
  getOfferingWithSlots,
  getReviewsFor,
  getRatingSummary,
} from "@/lib/data";
import { getTimeZone } from "@/lib/time";
import { getHiddenUserIds } from "@/lib/safety";
import { createClient } from "@/lib/supabase/server";
import { BookingPanel } from "./BookingPanel";

export default async function OfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const result = await getOfferingWithSlots(id);
  if (!result) notFound();
  const { offering, slots } = result;

  // Offerings from someone the viewer blocked (or was blocked by) aren't viewable.
  if ((await getHiddenUserIds()).has(offering.teacher_id)) notFound();

  const [balance, reviews, rating, tz] = await Promise.all([
    getBalance(user.id),
    getReviewsFor(offering.teacher_id),
    getRatingSummary(offering.teacher_id),
    getTimeZone(),
  ]);

  const isOwn = offering.teacher_id === user.id;

  return (
    <div className="space-y-6">
      {/* Title block spans the full width so, on phones, booking comes right after it. */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to explore
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{offering.skill?.name}</Badge>
          <Badge className="capitalize">{offering.level}</Badge>
          <Badge className="capitalize">
            {offering.mode === "virtual" ? "Virtual" : "In person"}
          </Badge>
          <Badge>{offering.duration_min} min</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {offering.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {offering.description && (
            <Card className="p-6">
              <h2 className="mb-2 font-semibold tracking-tight text-foreground">About this session</h2>
              <p className="whitespace-pre-line text-muted">
                {offering.description}
              </p>
            </Card>
          )}

          {/* Teacher */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold tracking-tight text-foreground">Your teacher</h2>
            <Link
              href={`/u/${offering.teacher_id}`}
              className="-m-2 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-brand-soft"
            >
              <Avatar
                name={offering.teacher?.full_name ?? ""}
                url={offering.teacher?.avatar_url}
                size={48}
              />
              <div>
                <p className="font-semibold text-foreground">
                  {offering.teacher?.full_name || "SkillSwap member"}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                  <Stars value={rating.avg} />
                  <span>
                    {rating.count > 0
                      ? `${rating.avg.toFixed(1)} (${rating.count})`
                      : "No reviews yet"}
                  </span>
                </div>
                {offering.teacher?.location && (
                  <p className="text-sm text-muted">{offering.teacher.location}</p>
                )}
              </div>
            </Link>
          </Card>

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold tracking-tight text-foreground">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted">
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                No reviews yet. Be the first to book and review.
              </p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <Avatar name={r.reviewerName} url={r.reviewerAvatar} size={36} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {r.reviewerName}
                        </span>
                        <Stars value={r.rating} size={13} />
                      </div>
                      {r.comment && (
                        <p className="mt-0.5 text-sm text-muted">{r.comment}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Booking sidebar: first on phones (right under the title), right column on desktop */}
        <div className="order-first lg:order-none lg:col-span-1">
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:p-6 lg:sticky lg:top-6">
            <div aria-hidden className="blob -right-12 -top-12 h-36 w-36 bg-brand-orange-200/50 dark:bg-brand-orange-500/15" />
            <div className="relative mb-4 flex items-baseline justify-between">
              <span className="inline-flex items-center gap-2 text-4xl font-extrabold tracking-tight text-foreground">
                <Coins className="h-7 w-7 text-accent-fg" aria-hidden />
                {offering.credit_cost}
              </span>
              <span className="text-sm text-muted">
                {offering.credit_cost === 1 ? "credit" : "credits"} / session
              </span>
            </div>
            <div className="relative">
              <BookingPanel
                slots={slots}
                cost={offering.credit_cost}
                balance={balance}
                isOwnOffering={isOwn}
                tz={tz}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab title = the offering's own title.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("offerings")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();
  return { title: data?.title ?? "Offering" };
}
