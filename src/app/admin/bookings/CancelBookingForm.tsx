"use client";

import { useActionState } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { adminCancelBooking, type CancelState } from "./actions";

export function CancelBookingForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<CancelState, FormData>(adminCancelBooking, undefined);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <ConfirmButton
        confirm="Cancel this booking? The learner is refunded and both members are notified."
        size="sm"
        variant="ghost"
        disabled={pending}
        className="text-red-600 hover:bg-red-50"
      >
        {pending ? "Cancelling…" : "Cancel"}
      </ConfirmButton>
      {state?.error && <span role="alert" className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
