import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-md border border-transparent bg-neutral-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-24", className)} {...props} />;
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
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
}
