"use client";

import { useActionState, useState } from "react";
import { bookSlot, type BookState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Availability } from "@/lib/types";

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingPanel({
  slots,
  cost,
  balance,
  isOwnOffering,
}: {
  slots: Availability[];
  cost: number;
  balance: number;
  isOwnOffering: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [state, action, pending] = useActionState<BookState, FormData>(
    bookSlot,
    undefined,
  );

  const canAfford = balance >= cost;

  if (isOwnOffering) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        This is your own offering. Manage its slots from your profile.
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        No open time slots right now. Check back soon or message the teacher.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slotId" value={selected ?? ""} />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Pick a time</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {slots.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selected === s.id
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-[var(--border)] bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {formatSlot(s.starts_at)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">
          Anything the teacher should know? (optional)
        </p>
        <Textarea name="notes" placeholder="e.g. I'm a complete beginner and want to focus on…" />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">Cost</span>
        <span className="font-semibold text-amber-600">{cost} credits</span>
      </div>

      {!canAfford && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          You have {balance} credits but this costs {cost}. Teach a skill to
          earn more.
        </p>
      )}

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={pending || !selected || !canAfford}
      >
        {pending ? "Booking…" : selected ? "Confirm booking" : "Select a time"}
      </Button>
    </form>
  );
}
