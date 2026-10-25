import type { AriaRole } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "border-info-fg/25 bg-info-soft text-info-fg",
  success: "border-success-fg/25 bg-success-soft text-success-fg",
  warning: "border-warning-fg/25 bg-warning-soft text-warning-fg",
  danger: "border-danger-fg/25 bg-danger-soft text-danger-fg",
};

/** Inline status / error box. Pass role/aria-live exactly as the call site
 *  needs (it adds none by itself). */
export function Alert({
  tone = "info",
  role,
  className,
  children,
  ...rest
}: {
  tone?: Tone;
  role?: AriaRole;
  className?: string;
  children: React.ReactNode;
  "aria-live"?: "polite" | "assertive" | "off";
  id?: string;
}) {
  return (
    <div
      role={role}
      className={cn("rounded-2xl border px-4 py-3 text-sm", tones[tone], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
