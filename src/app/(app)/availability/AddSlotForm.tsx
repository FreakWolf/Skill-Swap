"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addSlot, type AvailabilityState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AddSlotForm({ offeringId }: { offeringId: string }) {
  const [local, setLocal] = useState("");
  const [state, action, pending] = useActionState<AvailabilityState, FormData>(
    addSlot,
    undefined,
  );

  // The datetime-local value has no time zone. Convert it to UTC ISO here in
  // the browser so the server (UTC) stores the time the user meant.
  const startISO = local ? new Date(local).toISOString() : "";

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="offeringId" value={offeringId} />
      <input type="hidden" name="startISO" value={startISO} />
      <Input
        type="datetime-local"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        required
        aria-label="Slot start time"
        className="h-9 w-auto"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending || !local}>
        <Plus className="h-4 w-4" />
        {pending ? "Adding…" : "Add slot"}
      </Button>
      {state?.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
    </form>
  );
}
