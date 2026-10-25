import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getMyOfferingsWithSlots } from "@/lib/data";
import { getTimeZone, formatInTz } from "@/lib/time";
import { AddSlotForm } from "./AddSlotForm";
import { removeSlot } from "./actions";

function slotLabel(iso: string, tz: string) {
  return formatInTz(iso, tz, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { user } = await requireUser();
  const { deleted } = await searchParams;
  const [offerings, tz] = await Promise.all([
    getMyOfferingsWithSlots(user.id),
    getTimeZone(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
          <p className="mt-1 text-gray-600">
            Open time slots learners can book for the skills you teach.
          </p>
        </div>
        <Button href="/calendar" variant="outline">View calendar</Button>
      </div>

      {deleted && (
        <p role="status" className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-700">
          Offering deleted.
        </p>
      )}

      {offerings.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <CalendarPlus className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-gray-900">No offerings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Publish a skill first, then open time slots for it.
          </p>
          <Button href="/offer" variant="brand" className="mt-4">Offer a skill</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {offerings.map((o) => (
            <Card key={o.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">
                      <Link href={`/offerings/${o.id}`} className="hover:underline">{o.title}</Link>
                    </h2>
                    {!o.is_active && <Badge>Paused</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {o.skillName} · {o.duration_min} min · {o.credit_cost} cr ·{" "}
                    <Link href={`/offerings/${o.id}/edit`} className="font-medium text-brand-fg hover:underline">Edit</Link>
                  </p>
                </div>
                {o.is_active && <AddSlotForm offeringId={o.id} />}
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-4">
                {!o.is_active && (
                  <p className="mb-3 text-sm text-gray-500">
                    This offering is paused, so these slots are hidden and can&apos;t be booked.{" "}
                    <Link href={`/offerings/${o.id}/edit`} className="font-medium text-brand-fg hover:underline">Resume it</Link>{" "}
                    to open them again.
                  </p>
                )}
                {o.slots.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No open slots. Add times above so people can book.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {o.slots.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-card px-3 py-1.5 text-sm"
                      >
                        <span className="text-gray-700">
                          {slotLabel(s.starts_at, tz)}
                        </span>
                        {s.is_booked ? (
                          <Badge className="bg-teal-50 text-teal-700">Booked</Badge>
                        ) : (
                          <form action={removeSlot}>
                            <input type="hidden" name="slotId" value={s.id} />
                            <button
                              type="submit"
                              className="-my-1 -mr-1.5 flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove slot"
                            >
                              ✕
                            </button>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export const metadata = { title: "Availability" };
