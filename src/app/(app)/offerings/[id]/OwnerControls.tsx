import { CalendarPlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Replaces the booking form when the viewer owns the offering.
export function OwnerControls({ id, isActive, openSlots }: { id: string; isActive: boolean; openSlots: number }) {
  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        This is your offering.{" "}
        {isActive
          ? openSlots > 0
            ? `${openSlots} open slot${openSlots === 1 ? "" : "s"} learners can book.`
            : "It has no open slots, so nobody can book it yet."
          : "It is paused and hidden from the marketplace."}
      </p>
      <Button href={`/offerings/${id}/edit`} className="w-full">
        <Pencil className="h-4 w-4" aria-hidden /> Edit offering
      </Button>
      <Button href="/availability" variant="outline" className="w-full">
        <CalendarPlus className="h-4 w-4" aria-hidden /> Manage time slots
      </Button>
    </div>
  );
}
