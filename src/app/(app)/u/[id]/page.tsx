import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { OfferingCard } from "@/components/OfferingCard";
import { MessageButton } from "@/components/MessageButton";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getUserSkills,
  getOfferingsByTeacher,
  getReviewsFor,
  getRatingSummary,
} from "@/lib/data";
import type { Profile } from "@/lib/types";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();
  const isSelf = user.id === id;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Profile>();
  if (!profile) notFound();

  const [skills, offerings, reviews, rating] = await Promise.all([
    getUserSkills(id),
    getOfferingsByTeacher(id),
    getReviewsFor(id),
    getRatingSummary(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={profile.full_name} url={profile.avatar_url} size={72} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profile.full_name || "SkillSwap member"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Stars value={rating.avg} />
              <span>
                {rating.count > 0
                  ? `${rating.avg.toFixed(1)} · ${rating.count} review${rating.count > 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>
            {profile.location && (
              <p className="mt-0.5 text-sm text-slate-500">{profile.location}</p>
            )}
          </div>
          {!isSelf && (
            <div className="ml-auto">
              <MessageButton otherId={id} variant="brand" />
            </div>
          )}
        </div>
        {profile.bio && <p className="mt-4 text-slate-700">{profile.bio}</p>}
        {profile.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.languages.map((l) => (
              <Badge key={l}>{l}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Teaches</h2>
          {skills.teach.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.teach.map((s) => (
                <Badge key={s.id} className="bg-blue-50 text-blue-600">
                  {s.name} · {s.level}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nothing listed yet.</p>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Wants to learn</h2>
          {skills.learn.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.learn.map((s) => (
                <Badge key={s.id} className="bg-teal-50 text-teal-700">
                  {s.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Nothing listed yet.</p>
          )}
        </Card>
      </div>

      {/* Offerings */}
      {offerings.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Available sessions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o) => (
              <OfferingCard key={o.id} offering={o} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews yet.</p>
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
  );
}
