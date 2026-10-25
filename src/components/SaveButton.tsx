"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleFavorite } from "@/app/(app)/saved/actions";
import { cn } from "@/lib/cn";

// Bookmark toggle for an offering. Optimistic so it feels instant.
export function SaveButton({
  offeringId,
  saved,
  size = "sm",
  className,
}: {
  offeringId: string;
  saved: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(saved);

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from saved" : "Save offering"}
      title={optimistic ? "Saved" : "Save for later"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleFavorite(offeringId, !optimistic);
        });
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border bg-card/90 shadow-sm backdrop-blur transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        size === "sm" ? "h-8 w-8" : "h-10 gap-2 px-4 text-sm font-medium",
        optimistic
          ? "border-brand-300 text-brand-fg hover:bg-brand-50"
          : "border-[var(--border)] text-gray-500 hover:text-brand-fg",
        className,
      )}
    >
      <Bookmark className={cn("h-4 w-4", optimistic && "fill-current")} aria-hidden />
      {size === "md" && (optimistic ? "Saved" : "Save")}
    </button>
  );
}
