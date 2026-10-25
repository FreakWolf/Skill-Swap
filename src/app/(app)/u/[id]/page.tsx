import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { OfferingCard } from "@/components/OfferingCard";
import { Reveal } from "@/components/motion/Reveal";
import { MessageButton } from "@/components/MessageButton";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { BlockButton } from "@/components/safety/BlockButton";
import { requireUser } from "@/lib/auth";
import { getBlockStatus } from "@/lib/safety";
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

  const block = isSelf
    ? { iBlocked: false, blockedMe: false }
    : await getBlockStatus(user.id, id);
  const name = profile.full_name || "SkillSwap member";

  // They blocked me: don't reveal the profile or that a block exists.
  if (block.blockedMe) {
    return (
      <Card className="mx-auto max-w-lg p-10 text-center">
        <p className="font-semibold text-foreground">This profile isn&apos;t available</p>
        <p className="mt-1 text-sm text-subtle">
          It may have been removed, or you can&apos;t interact with this member.
        </p>
      </Card>
    );
  }

  // I blocked them: show only who it is and a way to undo it.
  if (block.iBlocked) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="flex justify-center">
          <Avatar name={name} url={profile.avatar_url} size={64} />
        </div>
        <p className="mt-4 font-semibold text-foreground">You blocked {name}</p>
        <p className="mt-1 text-sm text-subtle">
          You can&apos;t message or book each other, and you&apos;re hidden from
          each other in Explore.
        </p>
        <div className="mt-4 flex justify-center">
          <BlockButton userId={id} userName={name} blocked />
        </div>
      </Card>
    );
  }

  const [skills, offerings, reviews, rating] = await Promise.all([
    getUserSkills(id),
    getOfferingsByTeacher(id),
    getReviewsFor(id),
    getRatingSummary(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden p-6">
        <div aria-hidden className="blob -right-10 -top-16 h-40 w-40 bg-brand-orange-200/50 dark:bg-brand-orange-500/10" />
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar name={profile.full_name} url={profile.avatar_url} size={80} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {profile.full_name || "SkillSwap member"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Stars value={rating.avg} />
              <span>
                {rating.count > 0
                  ? `${rating.avg.toFixed(1)} · ${rating.count} review${rating.count > 1 ? "s" : ""}`
                  : "No reviews yet"}
              </span>
            </div>
            {profile.location && (
              <p className="mt-0.5 text-sm text-muted">{profile.location}</p>
            )}
          </div>
          {!isSelf && (
            <div className="ml-auto flex flex-wrap items-center gap-1">
              <MessageButton otherId={id} variant="brand" />
              <ReportDialog userId={id} userName={name} contextType="profile" />
              <BlockButton userId={id} userName={name} blocked={false} />
            </div>
          )}
        </div>
        {profile.bio && <p className="relative mt-4 text-muted">{profile.bio}</p>}
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
          <h2 className="mb-3 font-semibold tracking-tight text-foreground">Teaches</h2>
          {skills.teach.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.teach.map((s) => (
                <Badge key={s.id} tone="brand">
                  {s.name} · {s.level}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">Nothing listed yet.</p>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 font-semibold tracking-tight text-foreground">Wants to learn</h2>
          {skills.learn.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.learn.map((s) => (
                <Badge key={s.id} tone="accent">
                  {s.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">Nothing listed yet.</p>
          )}
        </Card>
      </div>

      {/* Offerings */}
      {offerings.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
            Available sessions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o, i) => (
              <Reveal key={o.id} delay={i}>
                <OfferingCard offering={o} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold tracking-tight text-foreground">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-subtle">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="flex gap-3">
                <Avatar name={r.reviewerName} url={r.reviewerAvatar} size={36} />
                <div>
                  <div className="flex items-center gap-2">
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
  );
}

// Tab title = the member's name.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .maybeSingle<{ full_name: string }>();
  return { title: data?.full_name || "Profile" };
}
