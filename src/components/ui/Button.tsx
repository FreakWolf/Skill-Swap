import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "brand"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "onBrandSolid"
  | "onBrandGhost";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  // Near-black primary — the de-facto action button in the reference UI.
  primary: "bg-[var(--primary)] text-white hover:bg-black/90 disabled:opacity-50",
  // Blue brand button (e.g. "Offer a Skill").
  brand: "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50",
  secondary: "bg-neutral-200 text-slate-800 hover:bg-neutral-300 disabled:opacity-50",
  outline:
    "border border-[var(--border)] bg-white text-slate-800 hover:bg-neutral-100 disabled:opacity-50",
  ghost: "text-slate-700 hover:bg-gray-100 disabled:opacity-50",
  danger: "bg-[var(--destructive)] text-white hover:bg-red-700 disabled:opacity-50",
  // For placement on the colored gradient hero: a solid white button with blue
  // text, and a translucent white-outline button.
  onBrandSolid: "bg-white text-brand-700 hover:bg-brand-50 disabled:opacity-50",
  onBrandGhost:
    "border border-white/40 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9",
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Render as a link styled like a button (no nested interactive elements). */
  href?: string;
}

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: Props) {
  const classes = buttonClasses(variant, size, className);
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={props["aria-label"]}
        aria-disabled={props.disabled || undefined}
        tabIndex={props.disabled ? -1 : undefined}
        onClick={props.disabled ? (e) => e.preventDefault() : undefined}
      >
        {props.children}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
