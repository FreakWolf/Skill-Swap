import { cn } from "@/lib/cn";

// The reference uses a simple blue wordmark. Keep it clean and recognizable.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight text-blue-600", className)}>
      SkillSwap
    </span>
  );
}
