"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  completeSession,
  cancelSession,
  type SessionActionState,
} from "../actions";
import { Button } from "@/components/ui/Button";

export function SessionActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [completeState, completeAction, completing] = useActionState<
    SessionActionState,
    FormData
  >(completeSession, undefined);
  const [cancelState, cancelAction, cancelling] = useActionState<
    SessionActionState,
    FormData
  >(cancelSession, undefined);

  // Refresh server data when an action succeeds.
  if (completeState?.ok || cancelState?.ok) {
    router.refresh();
  }

  const error = completeState?.error ?? cancelState?.error;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <form action={completeAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Button type="submit" disabled={completing}>
            {completing ? "Marking…" : "Mark complete"}
          </Button>
        </form>
        <form action={cancelAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Button type="submit" variant="outline" disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel session"}
          </Button>
        </form>
      </div>
      <p className="text-xs text-slate-400">
        Marking complete releases the held credits to the teacher. Cancelling
        refunds the learner.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
