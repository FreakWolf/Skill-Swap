"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addSlot, type AvailabilityState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AddSlotForm({ offeringId }: { offeringId: string }) {
  const [state, action, pending] = useActionState<AvailabilityState, FormData>(
    addSlot,
    undefined,
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="offeringId" value={offeringId} />
      <Input
        type="datetime-local"
        name="startISO"
        required
        className="h-9 w-auto"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Adding…" : "Add slot"}
      </Button>
      {state?.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
    </form>
  );
}
