"use client";

import { useActionState } from "react";
import {
  completeSession,
  cancelSession,
  type SessionActionState,
} from "../actions";
import { Button } from "@/components/ui/Button";

// Permissions are computed on the server (and enforced again in the database
// functions), so this component only decides what to show.
export function SessionActions({
  bookingId,
  canComplete,
  canCancel,
  completeLabel,
  hint,
}: {
  bookingId: string;
  canComplete: boolean;
  canCancel: boolean;
  completeLabel: string;
  hint: string;
}) {
  const [completeState, completeAction, completing] = useActionState<
    SessionActionState,
    FormData
  >(completeSession, undefined);
  const [cancelState, cancelAction, cancelling] = useActionState<
    SessionActionState,
    FormData
  >(cancelSession, undefined);

  const error = completeState?.error ?? cancelState?.error;

  return (
    <div className="space-y-3">
      {(canComplete || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {canComplete && (
            <form action={completeAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <Button type="submit" disabled={completing}>
                {completing ? "Confirming…" : completeLabel}
              </Button>
            </form>
          )}
          {canCancel && (
            <form action={cancelAction}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <Button type="submit" variant="outline" disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Cancel session"}
              </Button>
            </form>
          )}
        </div>
      )}
      <p className="text-sm text-slate-500">{hint}</p>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
