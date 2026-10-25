import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getCalendarItems, type CalendarItem } from "@/lib/data";
import { getTimeZone, formatInTz, partsInTz } from "@/lib/time";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_MS = 24 * 60 * 60 * 1000;

function parseMonth(
  param: string | undefined,
  tz: string,
): { year: number; month: number } {
  // month is 0-indexed internally.
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m - 1 };
  }
  const { year, month } = partsInTz(new Date(), tz);
  return { year, month };
}

function ym(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

const dotColor: Record<CalendarItem["kind"], string> = {
  learning: "bg-brand-orange-500",
  teaching: "bg-brand-500",
  open: "bg-info-fg",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { user } = await requireUser();
  const [{ month: monthParam }, tz] = await Promise.all([
    searchParams,
    getTimeZone(),
  ]);
  const { year, month } = parseMonth(monthParam, tz);

  // Pure calendar math (independent of any time zone): which weekday the
  // month starts on and how many days it has.
  const leadingBlanks = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Fetch a slightly wider window (±1 day), then bucket by the user's local
  // date so items near midnight land on the right day.
  const rangeStart = new Date(Date.UTC(year, month, 1) - DAY_MS);
  const rangeEnd = new Date(Date.UTC(year, month + 1, 1) + DAY_MS);
  const items = await getCalendarItems(
    user.id,
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
  );

  const byDay = new Map<number, CalendarItem[]>();
  for (const it of items) {
    const p = partsInTz(new Date(it.starts_at), tz);
    if (p.year !== year || p.month !== month) continue;
    if (!byDay.has(p.day)) byDay.set(p.day, []);
    byDay.get(p.day)!.push(it);
  }

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = month === 0 ? ym(year - 1, 11) : ym(year, month - 1);
  const next = month === 11 ? ym(year + 1, 0) : ym(year, month + 1);
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleString(
    undefined,
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  const today = partsInTz(new Date(), tz);
  const isThisMonth = today.year === year && today.month === month;

  // Items in this month (in the user's zone), already sorted by start time.
  const monthItems = [...byDay.keys()]
    .sort((a, b) => a - b)
    .flatMap((d) => byDay.get(d) ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="mt-1 text-muted">
            Your sessions and open time slots at a glance.
          </p>
        </div>
        <ButtonLink href="/availability" variant="outline">
          Manage availability
        </ButtonLink>
      </div>

      <Card className="p-4 sm:p-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/calendar?month=${prev}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{monthLabel}</h2>
          <Link
            href={`/calendar?month=${next}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-muted">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b-${i}`} />;
            const dayItems = byDay.get(day) ?? [];
            const isToday = isThisMonth && today.day === day;
            return (
              <div
                key={day}
                className={cn(
                  "min-h-12 rounded-xl border p-1 text-left transition-colors sm:min-h-20 sm:p-1.5",
                  isToday
                    ? "border-link bg-brand-soft ring-1 ring-link"
                    : "border-border bg-card-solid/60 hover:bg-card-solid",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isToday ? "text-brand-soft-fg" : "text-muted",
                  )}
                >
                  {day}
                </span>
                {/* Phones: titles don't fit, so just show dots; the list below has the details. */}
                {dayItems.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
                    {dayItems.slice(0, 4).map((it) => (
                      <span key={it.id} className={cn("h-1.5 w-1.5 rounded-full", dotColor[it.kind])} />
                    ))}
                  </div>
                )}
                <div className="mt-1 hidden space-y-1 sm:block">
                  {dayItems.slice(0, 3).map((it) =>
                    it.href ? (
                      <Link
                        key={it.id}
                        href={it.href}
                        className="flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] text-foreground hover:bg-brand-soft"
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor[it.kind])} />
                        <span className="truncate">
                          {formatInTz(it.starts_at, tz, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          {it.title}
                        </span>
                      </Link>
                    ) : null,
                  )}
                  {dayItems.length > 3 && (
                    <span className="px-1 text-[10px] text-muted">
                      +{dayItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Teaching
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-orange-500" /> Learning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-info-fg" /> Open slot
          </span>
        </div>
      </Card>

      {/* Readable list of the month's items (essential on phones, handy everywhere). */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-3 font-semibold tracking-tight text-foreground">This month</h2>
        {monthItems.length === 0 ? (
          <p className="text-sm text-muted">Nothing scheduled in {monthLabel}.</p>
        ) : (
          <ul className="divide-y divide-border">
            {monthItems.map((it) => (
              <li key={it.id}>
                <Link
                  href={it.href ?? "/calendar"}
                  className="-mx-2 flex min-h-12 items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand-soft"
                >
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotColor[it.kind])} aria-hidden />
                  <span className="w-24 shrink-0 text-sm leading-tight">
                    <span className="block text-foreground">
                      {formatInTz(it.starts_at, tz, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatInTz(it.starts_at, tz, { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </span>
                  <span className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-foreground">{it.title}</span>
                  <span className="shrink-0 rounded-full bg-input px-2 py-0.5 text-xs font-medium text-muted">{KIND_LABEL[it.kind]}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

const KIND_LABEL: Record<CalendarItem["kind"], string> = {
  teaching: "Teaching",
  learning: "Learning",
  open: "Open slot",
};

export const metadata = { title: "Calendar" };
