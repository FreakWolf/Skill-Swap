import Link from "next/link";
import { Card, Badge } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { Stars } from "@/components/Stars";
import { MessageButton } from "@/components/MessageButton";
import { ButtonLink } from "@/components/ui/Button";
import type { TeacherSummary } from "@/lib/types";

export function TeacherCard({ teacher }: { teacher: TeacherSummary }) {
  return (
    <Card variant="solid" interactive className="flex h-full flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar name={teacher.full_name} url={teacher.avatar_url} size={48} />
        <div className="min-w-0">
          <Link
            href={`/u/${teacher.id}`}
            className="block truncate rounded font-bold tracking-tight text-foreground hover:text-link"
          >
            {teacher.full_name}
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <Stars value={teacher.rating.avg} size={12} />
            <span>
              {teacher.rating.count > 0
                ? `${teacher.rating.avg.toFixed(1)} (${teacher.rating.count})`
                : "New"}
            </span>
            {teacher.location && <span>· {teacher.location}</span>}
          </div>
        </div>
      </div>
      {teacher.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted">{teacher.bio}</p>
      )}
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Teaches
        </p>
        <div className="flex flex-wrap gap-1.5">
          {teacher.teachSkills.slice(0, 5).map((s) => (
            <Badge key={s} tone="brand">
              {s}
            </Badge>
          ))}
          {teacher.teachSkills.length > 5 && (
            <Badge>+{teacher.teachSkills.length - 5}</Badge>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-4">
        <ButtonLink href={`/u/${teacher.id}`} variant="outline" className="flex-1">
          View profile
        </ButtonLink>
        <MessageButton otherId={teacher.id} variant="brand" />
      </div>
      {teacher.offeringCount > 0 && (
        <p className="mt-2 text-center text-xs text-muted">
          {teacher.offeringCount} active{" "}
          {teacher.offeringCount === 1 ? "offering" : "offerings"}
        </p>
      )}
    </Card>
  );
}
