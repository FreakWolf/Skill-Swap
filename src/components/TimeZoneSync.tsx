"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Stores the browser's time zone in a `tz` cookie so server-rendered pages can
// format times locally. If the cookie was missing or stale, refresh once so
// the current page re-renders with the right zone.
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.slice(3);
    if (current && decodeURIComponent(current) === tz) return;

    document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
