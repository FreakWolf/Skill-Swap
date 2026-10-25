"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import type { Announcement } from "@/lib/types";
import { saveAnnouncement, type AnnouncementState } from "./actions";

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time; we store UTC.
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AnnouncementForm({ existing, onDone }: { existing?: Announcement; onDone?: () => void }) {
  const [state, action, pending] = useActionState<AnnouncementState, FormData>(
    async (prev, fd) => {
      const result = await saveAnnouncement(prev, fd);
      if (result?.ok) onDone?.();
      return result;
    },
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      {existing && <input type="hidden" name="id" value={existing.id} />}
      <div>
        <Label htmlFor={`title-${existing?.id ?? "new"}`}>Title</Label>
        <Input id={`title-${existing?.id ?? "new"}`} name="title" defaultValue={existing?.title} required maxLength={120} placeholder="e.g. Scheduled maintenance on Sunday" />
      </div>
      <div>
        <Label htmlFor={`body-${existing?.id ?? "new"}`}>Message (optional)</Label>
        <Textarea id={`body-${existing?.id ?? "new"}`} name="body" defaultValue={existing?.body} maxLength={1000} rows={3} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`starts-${existing?.id ?? "new"}`}>Show from</Label>
          <Input id={`starts-${existing?.id ?? "new"}`} name="starts_at" type="datetime-local" defaultValue={toLocalInput(existing?.starts_at ?? null)} />
        </div>
        <div>
          <Label htmlFor={`ends-${existing?.id ?? "new"}`}>Hide after (optional)</Label>
          <Input id={`ends-${existing?.id ?? "new"}`} name="ends_at" type="datetime-local" defaultValue={toLocalInput(existing?.ends_at ?? null)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="is_active" defaultChecked={existing ? existing.is_active : true} className="h-4 w-4 rounded border-gray-300" />
        Active
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? "Saving…" : existing ? "Save changes" : "Publish announcement"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        )}
        {state?.ok && <span role="status" className="text-xs text-teal-700">Saved.</span>}
        {state?.error && <span role="alert" className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
