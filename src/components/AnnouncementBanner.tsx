"use client";

import { useSyncExternalStore } from "react";
import { Megaphone, X } from "lucide-react";
import type { Announcement } from "@/lib/types";

const KEY = "skillswap.dismissedAnnouncements";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

// On the server (and during hydration) we don't know what was dismissed, so
// render nothing until the client snapshot is available. Avoids a flash.
function getServerSnapshot(): string | null {
  return null;
}

function parse(raw: string | null): string[] | null {
  if (raw === null) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Shows live announcements at the top of the app. Dismissals are remembered
// per browser so a member sees each announcement until they close it.
export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dismissed = parse(raw);
  if (dismissed === null) return null;

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...dismissed, id].slice(-50)));
    } catch {
      // Storage unavailable: the banner just stays until reload.
    }
    listeners.forEach((cb) => cb());
  };

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          role="status"
          className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-fg"
        >
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-fg" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{a.title}</p>
            {a.body && <p className="mt-0.5 whitespace-pre-wrap text-brand-fg">{a.body}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(a.id)}
            aria-label="Dismiss announcement"
            className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-fg hover:bg-brand-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
