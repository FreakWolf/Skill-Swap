"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import {
  adjustCredits,
  setAdminFlag,
  suspendUser,
  unsuspendUser,
  type AdminActionState,
} from "../actions";

function Feedback({ state }: { state: AdminActionState }) {
  if (state?.error) {
    return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  if (state?.ok) {
    return <p role="status" className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">Done.</p>;
  }
  return null;
}

export function UserActions({
  id,
  isSelf,
  isAdmin,
  suspendedAt,
}: {
  id: string;
  isSelf: boolean;
  isAdmin: boolean;
  suspendedAt: string | null;
}) {
  const [suspendState, suspendAction, suspending] = useActionState<AdminActionState, FormData>(suspendUser, undefined);
  const [unsuspendState, unsuspendAction, unsuspending] = useActionState<AdminActionState, FormData>(unsuspendUser, undefined);
  const [adminState, adminAction, savingAdmin] = useActionState<AdminActionState, FormData>(setAdminFlag, undefined);
  const [creditState, creditAction, adjusting] = useActionState<AdminActionState, FormData>(adjustCredits, undefined);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5">
        <h2 className="font-semibold text-gray-900">Account status</h2>
        {suspendedAt ? (
          <form action={unsuspendAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={id} />
            <p className="text-sm text-gray-600">This account is suspended. The member sees a notice and cannot use the app.</p>
            <Button type="submit" variant="outline" disabled={unsuspending}>
              {unsuspending ? "Working…" : "Lift suspension"}
            </Button>
            <Feedback state={unsuspendState} />
          </form>
        ) : (
          <form action={suspendAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={id} />
            <div>
              <Label htmlFor="reason">Reason shown to the member (optional)</Label>
              <Textarea id="reason" name="reason" maxLength={300} className="min-h-20" placeholder="e.g. Repeated no-shows" />
            </div>
            <ConfirmButton
              confirm="Suspend this account? They will be signed out of the app until you lift it."
              variant="danger"
              disabled={suspending || isSelf}
            >
              {suspending ? "Working…" : "Suspend account"}
            </ConfirmButton>
            {isSelf && <p className="text-xs text-gray-500">You cannot suspend yourself.</p>}
            <Feedback state={suspendState} />
          </form>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-gray-900">Admin access</h2>
        <form action={adminAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="value" value={isAdmin ? "false" : "true"} />
          <p className="text-sm text-gray-600">
            {isAdmin ? "This member can open the admin panel." : "This member is a regular user."}
          </p>
          <ConfirmButton
            confirm={isAdmin ? "Remove admin access from this member?" : "Grant admin access to this member? They will be able to see and change everything here."}
            variant={isAdmin ? "outline" : "brand"}
            disabled={savingAdmin || (isSelf && isAdmin)}
          >
            {savingAdmin ? "Working…" : isAdmin ? "Remove admin" : "Make admin"}
          </ConfirmButton>
          {isSelf && isAdmin && <p className="text-xs text-gray-500">You cannot remove your own access.</p>}
          <Feedback state={adminState} />
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-gray-900">Adjust credits</h2>
        <form action={creditAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={id} />
          <div>
            <Label htmlFor="amount">Amount (negative to remove)</Label>
            <Input id="amount" name="amount" type="number" min={-1000} max={1000} step={1} required placeholder="e.g. 2 or -1" />
          </div>
          <div>
            <Label htmlFor="note">Note (sent to the member)</Label>
            <Input id="note" name="note" maxLength={300} placeholder="e.g. Goodwill for a cancelled session" />
          </div>
          <Button type="submit" variant="brand" disabled={adjusting}>
            {adjusting ? "Applying…" : "Apply adjustment"}
          </Button>
          <Feedback state={creditState} />
        </form>
      </Card>
    </div>
  );
}
