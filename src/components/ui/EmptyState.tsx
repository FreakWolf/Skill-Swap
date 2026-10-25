import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Friendly empty state: icon tile, title, body and an optional action. */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
  headingLevel = 2,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={cn("glass rounded-3xl px-6 py-12 text-center", className)}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-fg">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <H className="mt-4 text-lg font-semibold tracking-tight text-foreground">{title}</H>
      {children && <div className="mx-auto mt-1.5 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
