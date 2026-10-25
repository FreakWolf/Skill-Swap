import { cn } from "@/lib/cn";

/** Shimmering placeholder block (static under reduced motion). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}
