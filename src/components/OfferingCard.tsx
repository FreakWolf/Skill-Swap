import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/ui/Card";
import type { OfferingWithDetails } from "@/lib/types";

export function OfferingCard({ offering }: { offering: OfferingWithDetails }) {
  return (
    <Link href={`/offerings/${offering.id}`} className="group block">
      <Card className="h-full cursor-pointer p-5 transition-all hover:shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-md bg-black px-2 py-0.5 text-xs font-medium text-white">
            {offering.skill?.name ?? "Skill"}
          </span>
          <span className="shrink-0 text-xs capitalize text-gray-400">
            {offering.level}
          </span>
        </div>

        <h3 className="mt-3 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
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
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Star className="h-3 w-3" /> {offering.duration_min}m
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="text-2xl font-bold text-gray-900">
            {offering.credit_cost}
            <span className="ml-1 text-sm font-normal text-gray-500">cr</span>
          </span>
          <span className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white">
            Book Now
          </span>
        </div>
      </Card>
    </Link>
  );
}
