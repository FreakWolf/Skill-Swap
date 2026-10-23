import "server-only";

import { cookies } from "next/headers";

// The browser writes its IANA time zone (e.g. "Asia/Kolkata") into the `tz`
// cookie (see components/TimeZoneSync). Server-rendered pages read it so times
// display in the user's local zone instead of the server's UTC.
export async function getTimeZone(): Promise<string> {
  const raw = (await cookies()).get("tz")?.value;
  if (!raw) return "UTC";
  const tz = decodeURIComponent(raw);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC"; // invalid / tampered value
  }
}

// Format an ISO timestamp in the given time zone.
export function formatInTz(
  iso: string,
  tz: string,
  opts: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleString(undefined, { ...opts, timeZone: tz });
}

// Year / month (0-indexed) / day of an instant as seen in a time zone.
export function partsInTz(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}
