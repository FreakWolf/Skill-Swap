import { cn } from "@/lib/cn";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 0-indexed
}) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-[var(--accent)] text-white",
                active && "bg-[var(--primary)] text-white",
                !done && !active && "bg-slate-200 text-slate-500",
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:block",
                active ? "font-medium text-slate-900" : "text-slate-500",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px flex-1 bg-[var(--border)]" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
