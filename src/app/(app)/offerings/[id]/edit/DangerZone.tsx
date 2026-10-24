"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteOffering, setOfferingActive, type EditState } from "./actions";

export function DangerZone({ id, isActive }: { id: string; isActive: boolean }) {
  const [pauseState, pauseAction, pausing] = useActionState<EditState, FormData>(setOfferingActive, undefined);
  const [deleteState, deleteAction, deleting] = useActionState<EditState, FormData>(deleteOffering, undefined);

  return (
    <div className="space-y-4">
      <form action={pauseAction} className="flex flex-wrap items-center justify-between gap-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="active" value={String(!isActive)} />
        <div>
          <p className="font-medium text-gray-900">{isActive ? "Pause this offering" : "Resume this offering"}</p>
          <p className="text-sm text-gray-500">
            {isActive
              ? "Hides it from the marketplace and keeps your open slots on hold. Booked sessions are not affected."
              : "Makes it bookable again, with the time slots you already had."}
          </p>
        </div>
        <Button type="submit" variant="outline" disabled={pausing}>
          {pausing ? "Working…" : isActive ? "Pause" : "Resume"}
        </Button>
        {pauseState?.error && <p role="alert" className="w-full text-sm text-red-600">{pauseState.error}</p>}
      </form>

      <form action={deleteAction} className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <input type="hidden" name="id" value={id} />
        <div>
          <p className="font-medium text-gray-900">Delete this offering</p>
          <p className="text-sm text-gray-500">
            Permanent if it has never been booked. Otherwise it is paused so session history is kept.
          </p>
        </div>
        <ConfirmButton
          confirm="Delete this offering? This cannot be undone."
          variant="danger"
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </ConfirmButton>
        {deleteState?.error && <p role="alert" className="w-full text-sm text-amber-700">{deleteState.error}</p>}
      </form>
    </div>
  );
}
