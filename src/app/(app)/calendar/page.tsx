import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getCalendarItems, type CalendarItem } from "@/lib/data";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseMonth(param?: string): { year: number; month: number } {
  // month is 0-indexed internally.
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function ym(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

const dotColor: Record<CalendarItem["kind"], string> = {
  learning: "bg-purple-500",
  teaching: "bg-blue-500",
  open: "bg-amber-400",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { user } = await requireUser();
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonth(monthParam);

  // Range covering the visible grid (start of month .. end of month).
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const rangeStart = new Date(year, month, 1, 0, 0, 0);
  const rangeEnd = new Date(year, month + 1, 0, 23, 59, 59);

  const items = await getCalendarItems(
    user.id,
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
  );

  // Bucket items by day-of-month.
  const byDay = new Map<number, CalendarItem[]>();
  for (const it of items) {
    const d = new Date(it.starts_at).getDate();
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(it);
  }

  // Build the grid: leading blanks + days of the month.
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prev = month === 0 ? ym(year - 1, 11) : ym(year, month - 1);
  const next = month === 11 ? ym(year + 1, 0) : ym(year, month + 1);
  const monthLabel = firstOfMonth.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-gray-600">
            Your sessions and open time slots at a glance.
          </p>
        </div>
        <Link href="/availability">
          <Button variant="outline">Manage availability</Button>
        </Link>
      </div>

      <Card className="p-4 sm:p-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/calendar?month=${prev}`}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
          <Link
            href={`/calendar?month=${next}`}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
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
            const isToday = isThisMonth && today.getDate() === day;
            return (
              <div
                key={day}
                className={cn(
                  "min-h-20 rounded-lg border p-1.5 text-left",
                  isToday
                    ? "border-blue-400 bg-blue-50/40"
                    : "border-[var(--border)]",
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isToday ? "text-blue-600" : "text-gray-500",
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayItems.slice(0, 3).map((it) =>
                    it.href ? (
                      <Link
                        key={it.id}
                        href={it.href}
                        className="flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-gray-700 hover:bg-gray-100"
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor[it.kind])} />
                        <span className="truncate">
                          {new Date(it.starts_at).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          {it.title}
                        </span>
                      </Link>
                    ) : null,
                  )}
                  {dayItems.length > 3 && (
                    <span className="px-1 text-[10px] text-gray-400">
                      +{dayItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border)] pt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Teaching
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Learning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Open slot
          </span>
        </div>
      </Card>
    </div>
  );
}
