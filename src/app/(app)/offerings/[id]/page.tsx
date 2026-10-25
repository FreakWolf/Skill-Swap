import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getSavedOfferingIds } from "@/lib/favorites";
import { SaveButton } from "@/components/SaveButton";
import { BookingPanel } from "./BookingPanel";
import { OwnerControls } from "./OwnerControls";

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

  const isOwn = offering.teacher_id === user.id;
  // Paused offerings are only visible to their owner.
  if (!offering.is_active && !isOwn) notFound();

  const [balance, reviews, rating, tz, savedIds] = await Promise.all([
    getBalance(user.id),
    getReviewsFor(offering.teacher_id),
    getRatingSummary(offering.teacher_id),
    getTimeZone(),
    getSavedOfferingIds(user.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Title block spans the full width so, on phones, booking comes right after it. */}
      <div>
        <Link href="/marketplace" className="inline-block py-1 text-sm text-slate-500 hover:underline">
          ← Back to explore
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="bg-brand-50 text-brand-fg">
            {offering.skill?.name}
          </Badge>
          <Badge className="capitalize">{offering.level}</Badge>
          <Badge className="capitalize">
            {offering.mode === "virtual" ? "Virtual" : "In person"}
          </Badge>
          <Badge>{offering.duration_min} min</Badge>
          {offering.is_featured && (
            <Badge className="bg-brand-orange-50 text-brand-orange-700">Featured</Badge>
          )}
          {!offering.is_active && <Badge>Paused</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {offering.title}
          </h1>
          {!isOwn && <SaveButton offeringId={offering.id} saved={savedIds.has(offering.id)} size="md" />}
        </div>
      </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">

        {offering.description && (
          <Card className="p-6">
            <h2 className="mb-2 font-semibold text-slate-900">About this session</h2>
            <p className="whitespace-pre-line text-slate-700">
              {offering.description}
            </p>
          </Card>
        )}

        {/* Teacher */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Your teacher</h2>
          <Link href={`/u/${offering.teacher_id}`} className="flex items-center gap-3">
            <Avatar
              name={offering.teacher?.full_name ?? ""}
              url={offering.teacher?.avatar_url}
              size={48}
            />
            <div>
              <p className="font-medium text-slate-900">
                {offering.teacher?.full_name || "SkillSwap member"}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-500">
                <Stars value={rating.avg} />
                <span>
                  {rating.count > 0
                    ? `${rating.avg.toFixed(1)} (${rating.count})`
                    : "No reviews yet"}
                </span>
              </div>
              {offering.teacher?.location && (
                <p className="text-sm text-slate-500">{offering.teacher.location}</p>
              )}
            </div>
          </Link>
        </Card>

        {/* Reviews */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">
              No reviews yet. Be the first to book and review.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="flex gap-3">
                  <Avatar name={r.reviewerName} url={r.reviewerAvatar} size={36} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {r.reviewerName}
                      </span>
                      <Stars value={r.rating} size={13} />
                    </div>
                    {r.comment && (
                      <p className="mt-0.5 text-sm text-slate-600">{r.comment}</p>
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
        <Card className="p-5 sm:p-6 lg:sticky lg:top-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {offering.credit_cost}
            </span>
            <span className="text-sm text-slate-500">
              {offering.credit_cost === 1 ? "credit" : "credits"} / session
            </span>
          </div>
          {isOwn ? (
            <OwnerControls id={offering.id} isActive={offering.is_active} openSlots={slots.length} />
          ) : (
            <BookingPanel
              slots={slots}
              cost={offering.credit_cost}
              balance={balance}
              isOwnOffering={false}
              tz={tz}
            />
          )}
        </Card>
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
