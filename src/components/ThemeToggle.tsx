"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
const getSnapshot = (): ThemePreference => readThemePreference();
const getServerSnapshot = (): ThemePreference => "system";

function usePreference(): [ThemePreference, (p: ThemePreference) => void] {
  const pref = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Follow the OS while on "system"; re-apply after cross-tab changes.
  useEffect(() => {
    applyTheme(pref);
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const set = (p: ThemePreference) => {
    saveThemePreference(p);
    listeners.forEach((cb) => cb());
  };
  return [pref, set];
}

/** Segmented Light / Dark / System control (Settings, marketing header). */
export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [pref, set] = usePreference();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex rounded-lg border border-border bg-card p-0.5", className)}
    >
      {OPTIONS.map((o) => {
        const active = pref === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? o.label : undefined}
            title={o.label}
            onClick={() => set(o.value)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              compact ? "w-8" : "px-3",
              active ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-gray-100 hover:text-foreground",
            )}
          >
            <o.icon className="h-4 w-4" aria-hidden />
            {!compact && o.label}
          </button>
        );
      })}
    </div>
  );
}

/** One-button cycle (Light → Dark → System) for tight spots like the sidebar. */
export function ThemeCycleButton({ className }: { className?: string }) {
  const [pref, set] = usePreference();
  const idx = OPTIONS.findIndex((o) => o.value === pref);
  const current = OPTIONS[idx] ?? OPTIONS[2];
  const next = OPTIONS[(idx + 1) % OPTIONS.length];
  return (
    <button
      type="button"
      onClick={() => set(next.value)}
      aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
      title={`Theme: ${current.label}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-foreground",
        className,
      )}
    >
      <current.icon className="h-5 w-5" aria-hidden />
      <span className="flex-1 text-left">Theme</span>
      <span className="text-xs text-gray-500">{current.label}</span>
    </button>
  );
}
