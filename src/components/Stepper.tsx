import { Check } from "lucide-react";
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
          <li
            key={label}
            className="flex flex-1 items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done && "bg-success-soft text-success-fg",
                active && "bg-gradient-primary text-white shadow-soft",
                !done && !active && "bg-input text-muted",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-label="Done" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:block",
                active ? "font-semibold text-foreground" : "text-muted",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px flex-1 bg-border-strong/40" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
