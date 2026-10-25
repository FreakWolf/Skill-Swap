import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/ui/Card";
import { SaveButton } from "@/components/SaveButton";
import type { OfferingWithDetails } from "@/lib/types";

export function OfferingCard({
  offering,
  saved,
}: {
  offering: OfferingWithDetails;
  /** When provided, shows the bookmark toggle in its current state. */
  saved?: boolean;
}) {
  const paused = !offering.is_active;

  return (
    <div className="group relative h-full">
      <Link href={`/offerings/${offering.id}`} className="block h-full">
        <Card className="h-full cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between gap-2 pr-8">
            <span className="inline-flex items-center rounded-md bg-black px-2 py-0.5 text-xs font-medium text-white">
              {offering.skill?.name ?? "Skill"}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs capitalize text-gray-500">
              {offering.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-orange-50 px-1.5 py-0.5 font-medium normal-case text-brand-orange-700">
                  <Sparkles className="h-3 w-3" aria-hidden /> Featured
                </span>
              )}
              {paused && (
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium normal-case text-gray-600">Paused</span>
              )}
              {offering.level}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
            {offering.title}
          </h3>
          {offering.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {offering.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Avatar
              name={offering.teacher?.full_name ?? ""}
              url={offering.teacher?.avatar_url}
              size={28}
            />
            <span className="truncate text-sm text-gray-700">
              {offering.teacher?.full_name || "SkillSwap member"}
            </span>
            <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" aria-hidden /> {offering.duration_min}m
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-2xl font-bold text-gray-900">
              {offering.credit_cost}
              <span className="ml-1 text-sm font-normal text-gray-500">cr</span>
            </span>
            <span className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white">
              {paused ? "View" : "Book Now"}
            </span>
          </div>
        </Card>
      </Link>
      {saved !== undefined && (
        <SaveButton offeringId={offering.id} saved={saved} className="absolute right-3 top-3" />
      )}
    </div>
  );
}
