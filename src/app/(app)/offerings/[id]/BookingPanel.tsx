"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { bookSlot, type BookState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Availability } from "@/lib/types";

function formatSlot(iso: string, tz: string) {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: tz,
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
  tz,
}: {
  slots: Availability[];
  cost: number;
  balance: number;
  isOwnOffering: boolean;
  tz: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [state, action, pending] = useActionState<BookState, FormData>(
    bookSlot,
    undefined,
  );

  const canAfford = balance >= cost;

  if (isOwnOffering) {
    return (
      <p className="rounded-2xl bg-input p-4 text-sm text-muted">
        This is your own offering. Manage its slots from your profile.
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-2xl bg-input p-4 text-sm text-muted">
        No open time slots right now. Check back soon or message the teacher.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slotId" value={selected ?? ""} />

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Pick a time</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {slots.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelected(s.id)}
              aria-pressed={selected === s.id}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:active:scale-100",
                selected === s.id
                  ? "border-link bg-brand-soft text-brand-soft-fg ring-1 ring-link"
                  : "border-border-strong bg-card-solid text-foreground hover:bg-brand-soft",
              )}
            >
              {formatSlot(s.starts_at, tz)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-foreground">
          Anything the teacher should know? (optional)
        </p>
        <Textarea name="notes" placeholder="e.g. I'm a complete beginner and want to focus on…" />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
        <span className="text-sm text-muted">Cost</span>
        <span className="font-bold text-accent-fg">{cost} {cost === 1 ? "credit" : "credits"}</span>
      </div>

      {!canAfford && (
        <p className="rounded-2xl border border-warning-fg/25 bg-warning-soft px-4 py-3 text-sm text-warning-fg">
          You have {balance} {balance === 1 ? "credit" : "credits"} but this costs {cost}.{" "}
          <Link href="/credits" className="font-semibold underline">
            Buy credits
          </Link>{" "}
          or teach a skill to earn more.
        </p>
      )}

      {state?.error && (
        <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
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
