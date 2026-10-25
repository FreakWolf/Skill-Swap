"use client";

import { useId, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getThemePrefSnapshot,
  setThemePref,
  subscribeThemePref,
  type ThemePref,
} from "@/lib/theme";

const OPTIONS: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function choose(pref: ThemePref) {
  const root = document.documentElement;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) root.classList.add("theme-switching");
  setThemePref(pref);
  if (!reduce) window.setTimeout(() => root.classList.remove("theme-switching"), 300);
}

/** Light / Dark / System segmented control built from native radios, so it
 *  gets arrow-key navigation and screen-reader semantics for free.
 *  `compactOnMobile` swaps it for a single cycling button below 640px, for
 *  tight headers. */
export function ThemeToggle({
  size = "sm",
  className,
  compactOnMobile = false,
}: {
  size?: "sm" | "md";
  className?: string;
  compactOnMobile?: boolean;
}) {
  const name = useId();
  const pref = useSyncExternalStore(subscribeThemePref, getThemePrefSnapshot, () => "system" as const);
  if (compactOnMobile) {
    const i = OPTIONS.findIndex((o) => o.value === pref);
    const current = OPTIONS[i];
    const next = OPTIONS[(i + 1) % OPTIONS.length];
    const Icon = current.icon;
    return (
      <>
        <button
          type="button"
          onClick={() => choose(next.value)}
          aria-label={`Colour theme: ${current.label}. Switch to ${next.label}`}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground backdrop-blur-md transition-colors hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden",
            className,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </button>
        <ThemeToggle size={size} className={cn("hidden sm:inline-flex", className)} />
      </>
    );
  }
  return (
    <fieldset
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-card p-1 backdrop-blur-md",
        className,
      )}
    >
      <legend className="sr-only">Colour theme</legend>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const checked = pref === value;
        return (
          <label
            key={value}
            title={size === "sm" ? label : undefined}
            className={cn(
              "relative flex cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors duration-150",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              size === "sm" ? "h-8 w-8" : "h-9 px-3.5",
              checked
                ? "bg-gradient-primary text-white shadow-soft"
                : "text-muted hover:bg-brand-soft hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={checked}
              onChange={() => choose(value)}
              className="sr-only"
            />
            <Icon className="h-4 w-4" aria-hidden />
            <span className={size === "sm" ? "sr-only" : undefined}>{label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
