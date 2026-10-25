import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "brand"
  | "accent"
  | "secondary"
  | "outline"
  | "ghost"
  | "dangerGhost"
  | "danger"
  | "onBrandSolid"
  | "onBrandGhost";
type Size = "sm" | "md" | "lg" | "icon";

// Gradient primary: white text passes on every stop (≥5.56:1).
const gradient =
  "bg-gradient-primary text-primary-foreground shadow-soft hover:brightness-110";

const variants: Record<Variant, string> = {
  primary: gradient,
  // Kept as an alias so older call sites keep compiling.
  brand: gradient,
  // Orange gradient with ink text (6.8:1).
  accent: "bg-gradient-accent text-ink shadow-glow-orange hover:brightness-105",
  secondary: "bg-brand-soft text-brand-soft-fg hover:brightness-95 dark:hover:brightness-125",
  outline:
    "border border-border-strong bg-card text-foreground backdrop-blur-md hover:bg-card-solid",
  ghost: "text-foreground hover:bg-brand-soft",
  dangerGhost: "text-danger-fg hover:bg-danger-soft",
  danger: "bg-destructive text-white hover:brightness-110",
  // For the purple hero gradient: solid white with deep purple text, and a
  // translucent white outline.
  onBrandSolid: "bg-white text-brand-800 shadow-soft hover:bg-brand-50",
  onBrandGhost: "border border-white/40 bg-white/15 text-white hover:bg-white/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold",
    "transition-[transform,box-shadow,filter,background-color,color] duration-150 ease-[var(--ease-spring)]",
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: Props) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}

/** A link that looks like a button (never nest a <button> inside <a>). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonVariants({ variant, size, className })} {...props} />;
}
