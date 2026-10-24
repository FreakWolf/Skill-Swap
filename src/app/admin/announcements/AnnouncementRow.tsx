"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { StatusBadge, fmtDate } from "@/components/admin/ui";
import type { Announcement } from "@/lib/types";
import { AnnouncementForm } from "./AnnouncementForm";
import { deleteAnnouncement, toggleAnnouncement, type AnnouncementState } from "./actions";

export function AnnouncementRow({ a, live }: { a: Announcement; live: boolean }) {
  const [editing, setEditing] = useState(false);
  const [toggleState, toggleAction, toggling] = useActionState<AnnouncementState, FormData>(toggleAnnouncement, undefined);
  const [deleteState, deleteAction, deleting] = useActionState<AnnouncementState, FormData>(deleteAnnouncement, undefined);
  const error = toggleState?.error ?? deleteState?.error;

  return (
    <Card className="p-5">
      {editing ? (
        <AnnouncementForm existing={a} onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={live ? "active" : a.is_active ? "pending" : "paused"} label={live ? "live" : a.is_active ? "scheduled / expired" : "inactive"} />
              <span className="text-xs text-gray-500">
                From {fmtDate(a.starts_at)}{a.ends_at ? ` until ${fmtDate(a.ends_at)}` : ""}
              </span>
            </div>
            <h2 className="mt-1 font-semibold text-gray-900">{a.title}</h2>
            {a.body && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{a.body}</p>}
            {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex items-center gap-1">
            <form action={toggleAction}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="value" value={String(!a.is_active)} />
              <Button type="submit" size="sm" variant="outline" disabled={toggling}>
                {toggling ? "…" : a.is_active ? "Deactivate" : "Activate"}
              </Button>
            </form>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" aria-hidden /> Edit
            </Button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmButton confirm="Delete this announcement?" size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={deleting}>
                <Trash2 className="h-4 w-4" aria-hidden /> Delete
              </ConfirmButton>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
