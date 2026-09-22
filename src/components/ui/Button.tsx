import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "brand" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  // Near-black primary — the de-facto action button in the reference UI.
  primary: "bg-[var(--primary)] text-white hover:bg-black/90 disabled:opacity-50",
  // Blue brand button (e.g. "Offer a Skill").
  brand: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
  secondary: "bg-neutral-200 text-slate-800 hover:bg-neutral-300 disabled:opacity-50",
  outline:
    "border border-[var(--border)] bg-white text-slate-800 hover:bg-neutral-100 disabled:opacity-50",
  ghost: "text-slate-700 hover:bg-gray-100 disabled:opacity-50",
  danger: "bg-[var(--destructive)] text-white hover:bg-red-700 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
