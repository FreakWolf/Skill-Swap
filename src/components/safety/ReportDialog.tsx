"use client";

import { useActionState, useRef } from "react";
import { Flag, X } from "lucide-react";
import { reportUser, type SafetyState } from "@/app/(app)/safety/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const REASONS: { value: string; label: string; hint?: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "spam_scam", label: "Spam or scam", hint: "e.g. asking for money or off-platform payment" },
  { value: "inappropriate", label: "Inappropriate or offensive content" },
  { value: "no_show", label: "Didn't show up / session didn't happen" },
  { value: "fake_profile", label: "Fake profile or impersonation" },
  { value: "safety", label: "I feel unsafe" },
  { value: "other", label: "Something else" },
];

type Context = "profile" | "message" | "session" | "offering";

export function ReportDialog({
  userId,
  userName,
  contextType,
  contextId,
  label = "Report",
  showBlockOption = true,
}: {
  userId: string;
  userName: string;
  contextType: Context;
  contextId?: string;
  label?: string;
  showBlockOption?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Once sent, reopening shows the confirmation instead of a fresh form,
  // which also prevents accidental duplicate reports.
  const [state, action, pending] = useActionState<SafetyState, FormData>(
    reportUser,
    undefined,
  );

  function open() {
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={open}>
        <Flag className="h-4 w-4" />
        {label}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`report-title-${userId}`}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 id={`report-title-${userId}`} className="font-semibold text-gray-900">
            Report {userName}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state?.ok ? (
          <div className="space-y-4 px-5 py-6">
            <p className="text-sm text-gray-700">
              Thanks for letting us know. Our team will review this report.
              {userName} won&apos;t be told who reported them.
            </p>
            <p className="text-sm text-gray-500">
              If you&apos;re in immediate danger, contact your local emergency
              services.
            </p>
            <div className="flex justify-end">
              <Button type="button" onClick={close}>Done</Button>
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-4 px-5 py-5">
            <input type="hidden" name="reportedUserId" value={userId} />
            <input type="hidden" name="contextType" value={contextType} />
            {contextId && <input type="hidden" name="contextId" value={contextId} />}

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">
                What&apos;s the problem?
              </legend>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <input type="radio" name="reason" value={r.value} required className="mt-1" />
                    <span>
                      <span className="text-gray-800">{r.label}</span>
                      {r.hint && <span className="block text-xs text-gray-400">{r.hint}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`report-details-${userId}`} className="mb-1.5 block text-sm font-medium text-gray-700">
                Details <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <Textarea
                id={`report-details-${userId}`}
                name="details"
                maxLength={2000}
                placeholder="What happened? Include dates or anything that helps us review."
              />
            </div>

            {showBlockOption && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="alsoBlock" defaultChecked className="h-4 w-4" />
                Also block {userName}
              </label>
            )}

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="submit" variant="danger" disabled={pending}>
                {pending ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
