import Link from "next/link";
import { Clock, Coins } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { OfferingWithDetails } from "@/lib/types";

export function OfferingCard({ offering }: { offering: OfferingWithDetails }) {
  return (
    <Link
      href={`/offerings/${offering.id}`}
      className="lift group flex h-full flex-col rounded-3xl border border-border bg-card-solid p-5 shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-soft-fg">
          {offering.skill?.name ?? "Skill"}
        </span>
        <span className="shrink-0 rounded-full bg-input px-2 py-0.5 text-xs font-medium capitalize text-muted">
          {offering.level}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 font-bold tracking-tight text-foreground transition-colors group-hover:text-link">
        {offering.title}
      </h3>
      {offering.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {offering.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <Avatar
          name={offering.teacher?.full_name ?? ""}
          url={offering.teacher?.avatar_url}
          size={28}
        />
        <span className="truncate text-sm text-muted">
          {offering.teacher?.full_name || "SwapSkills member"}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden /> {offering.duration_min}m
        </span>
      </div>
      <div className="flex-1" aria-hidden />
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-2xl font-extrabold tracking-tight text-foreground">
          <Coins className="h-5 w-5 text-accent-fg" aria-hidden />
          {offering.credit_cost}
          <span className="text-sm font-medium text-muted">cr</span>
        </span>
        <span className="bg-gradient-primary rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-soft transition-transform duration-150 group-hover:scale-105 motion-reduce:group-hover:scale-100">
          Book Now
        </span>
      </div>
    </Link>
  );
}
