import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  variant = "glass",
  interactive = false,
}: {
  className?: string;
  children: React.ReactNode;
  /** glass = frosted panel on the ambient canvas; solid = opaque card. */
  variant?: "glass" | "solid";
  /** Hover lift + press pop (for cards that are links). */
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        variant === "glass"
          ? "glass"
          : "border border-border bg-card-solid shadow-soft",
        interactive && "lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-input text-muted",
  brand: "bg-brand-soft text-brand-soft-fg",
  accent: "bg-accent-soft text-accent-fg",
  success: "bg-success-soft text-success-fg",
  warning: "bg-warning-soft text-warning-fg",
  danger: "bg-danger-soft text-danger-fg",
  info: "bg-info-soft text-info-fg",
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
