import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// Inputs: tinted fill + a ≥3:1 outline so the field edge is visible in both
// themes.
const field =
  "w-full rounded-xl border border-border-strong bg-input px-3.5 text-sm text-foreground placeholder:text-subtle transition-[border-color,box-shadow] duration-150 focus:border-ring focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60";

/** Classes for native <select> elements so they match Input. */
export const selectClass = cn(field, "h-11 py-2 pr-8");

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, "h-11 py-2", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-24 py-2.5", className)} {...props} />;
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-foreground"
    >
      {children}
    </label>
  );
}
