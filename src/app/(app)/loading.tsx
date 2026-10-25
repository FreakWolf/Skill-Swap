import { Skeleton } from "@/components/ui/Skeleton";

// Shown instantly during navigation while the page's server data loads,
// so clicks feel responsive instead of blank/frozen.
export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <Skeleton className="h-9 w-56 rounded-full" />
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </div>
  );
}
