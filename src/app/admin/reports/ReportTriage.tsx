"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { updateReport, type ReportState } from "./actions";

const STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;

export function ReportTriage({ id, status, notes }: { id: string; status: string; notes: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(updateReport, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div>
          <Label htmlFor={`status-${id}`}>Status</Label>
          <select
            id={`status-${id}`}
            name="status"
            defaultValue={status}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-card px-3 text-sm capitalize focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`notes-${id}`}>Internal notes</Label>
          <Textarea id={`notes-${id}`} name="admin_notes" defaultValue={notes} maxLength={2000} className="min-h-10" rows={2} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" variant="brand" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state?.ok && <span role="status" className="text-xs text-teal-700">Saved.</span>}
        {state?.error && <span role="alert" className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
