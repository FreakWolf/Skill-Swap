import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getMyOfferingsWithSlots } from "@/lib/data";
import { AddSlotForm } from "./AddSlotForm";
import { removeSlot } from "./actions";

function slotLabel(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AvailabilityPage() {
  const { user } = await requireUser();
  const offerings = await getMyOfferingsWithSlots(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
          <p className="mt-1 text-gray-600">
            Open time slots learners can book for the skills you teach.
          </p>
        </div>
        <Link href="/calendar">
          <Button variant="outline">View calendar</Button>
        </Link>
      </div>

      {offerings.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <CalendarPlus className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-gray-900">No offerings yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Publish a skill first, then open time slots for it.
          </p>
          <Link href="/offer" className="mt-4">
            <Button variant="brand">Offer a skill</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {offerings.map((o) => (
            <Card key={o.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-gray-900">{o.title}</h2>
                  <p className="text-sm text-gray-500">
                    {o.skillName} · {o.duration_min} min · {o.credit_cost} cr
                  </p>
                </div>
                <AddSlotForm offeringId={o.id} />
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-4">
                {o.slots.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No open slots. Add times above so people can book.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {o.slots.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm"
                      >
                        <span className="text-gray-700">
                          {slotLabel(s.starts_at)}
                        </span>
                        {s.is_booked ? (
                          <Badge className="bg-teal-50 text-teal-700">Booked</Badge>
                        ) : (
                          <form action={removeSlot}>
                            <input type="hidden" name="slotId" value={s.id} />
                            <button
                              type="submit"
                              className="text-gray-400 hover:text-red-600"
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
