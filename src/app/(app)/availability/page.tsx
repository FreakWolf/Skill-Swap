import { CalendarPlus } from "lucide-react";
import { Card, Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
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

export default async function AvailabilityPage() {
  const { user } = await requireUser();
  const [offerings, tz] = await Promise.all([
    getMyOfferingsWithSlots(user.id),
    getTimeZone(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Availability</h1>
          <p className="mt-1 text-muted">
            Open time slots learners can book for the skills you teach.
          </p>
        </div>
        <ButtonLink href="/calendar" variant="outline">
          View calendar
        </ButtonLink>
      </div>

      {offerings.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No offerings yet"
          action={<ButtonLink href="/offer">Offer a skill</ButtonLink>}
        >
          Publish a skill first, then open time slots for it.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {offerings.map((o, i) => (
            <Reveal key={o.id} delay={i}>
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold tracking-tight text-foreground">{o.title}</h2>
                  <p className="text-sm text-muted">
                    {o.skillName} · {o.duration_min} min · {o.credit_cost} cr
                  </p>
                </div>
                <AddSlotForm offeringId={o.id} />
              </div>

              <div className="mt-4 border-t border-border pt-4">
                {o.slots.length === 0 ? (
                  <p className="text-sm text-muted">
                    No open slots. Add times above so people can book.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {o.slots.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 rounded-full border border-border bg-card-solid px-3.5 py-1.5 text-sm shadow-soft"
                      >
                        <span className="font-medium text-foreground">
                          {slotLabel(s.starts_at, tz)}
                        </span>
                        {s.is_booked ? (
                          <Badge tone="success">Booked</Badge>
                        ) : (
                          <form action={removeSlot}>
                            <input type="hidden" name="slotId" value={s.id} />
                            <button
                              type="submit"
                              className="-my-1 -mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-danger-soft hover:text-danger-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export const metadata = { title: "Availability" };
