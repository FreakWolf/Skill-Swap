"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { updateTicket, type TicketState } from "./actions";

const STATUSES = ["open", "answered", "closed"] as const;

export function TicketReply({ id, status, reply }: { id: string; status: string; reply: string }) {
  const [state, action, pending] = useActionState<TicketState, FormData>(updateTicket, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <Label htmlFor={`reply-${id}`}>Reply / internal note</Label>
        <Textarea id={`reply-${id}`} name="admin_reply" defaultValue={reply} maxLength={2000} rows={3} className="min-h-20" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={status}
          aria-label="Ticket status"
          className="h-9 rounded-md border border-[var(--border)] bg-card px-3 text-sm capitalize focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="brand" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state?.ok && <span role="status" className="text-xs text-teal-700">Saved.</span>}
        {state?.error && <span role="alert" className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
