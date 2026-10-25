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
  compact = false,
}: {
  userId: string;
  userName: string;
  contextType: Context;
  contextId?: string;
  label?: string;
  showBlockOption?: boolean;
  /** Icon-only on small screens (label kept for screen readers). */
  compact?: boolean;
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
      <Button type="button" variant="ghost" size="sm" onClick={open} className={compact ? "max-sm:h-10 max-sm:px-2.5" : undefined}>
        <Flag className="h-4 w-4" aria-hidden />
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`report-title-${userId}`}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[28px] border border-glass-border bg-elevated p-0 text-foreground shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id={`report-title-${userId}`} className="font-semibold tracking-tight text-foreground">
            Report {userName}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-brand-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {state?.ok ? (
          <div className="space-y-4 px-5 py-6">
            <p className="text-sm text-muted">
              Thanks for letting us know. Our team will review this report.
              {userName} won&apos;t be told who reported them.
            </p>
            <p className="text-sm text-subtle">
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
              <legend className="mb-2 text-sm font-semibold text-foreground">
                What&apos;s the problem?
              </legend>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-brand-soft has-[:checked]:bg-brand-soft"
                  >
                    <input type="radio" name="reason" value={r.value} required className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
                    <span>
                      <span className="text-foreground">{r.label}</span>
                      {r.hint && <span className="block text-xs text-muted">{r.hint}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor={`report-details-${userId}`} className="mb-1.5 block text-sm font-semibold text-foreground">
                Details <span className="font-normal text-subtle">(optional)</span>
              </label>
              <Textarea
                id={`report-details-${userId}`}
                name="details"
                maxLength={2000}
                placeholder="What happened? Include dates or anything that helps us review."
              />
            </div>

            {showBlockOption && (
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="alsoBlock" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
                Also block {userName}
              </label>
            )}

            {state?.error && (
              <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">{state.error}</p>
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
