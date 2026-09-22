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

  const [balance, reviews, rating] = await Promise.all([
    getBalance(user.id),
    getReviewsFor(offering.teacher_id),
    getRatingSummary(offering.teacher_id),
  ]);

  const isOwn = offering.teacher_id === user.id;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <div>
          <Link href="/marketplace" className="text-sm text-slate-500 hover:underline">
            ← Back to explore
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-blue-50 text-blue-600">
              {offering.skill?.name}
            </Badge>
            <Badge className="capitalize">{offering.level}</Badge>
            <Badge className="capitalize">
              {offering.mode === "virtual" ? "Virtual" : "In person"}
            </Badge>
            <Badge>{offering.duration_min} min</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {offering.title}
          </h1>
        </div>

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

      {/* Booking sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20 p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {offering.credit_cost}
            </span>
            <span className="text-sm text-slate-500">credits / session</span>
          </div>
          <BookingPanel
            slots={slots}
            cost={offering.credit_cost}
            balance={balance}
            isOwnOffering={isOwn}
          />
        </Card>
      </div>
    </div>
  );
}
