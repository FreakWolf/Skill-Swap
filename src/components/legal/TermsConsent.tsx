"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TermsContent } from "./TermsContent";
import { PrivacyContent } from "./PrivacyContent";
import { LEGAL_PROSE } from "./prose";

// How close (px) to the bottom counts as "read to the end".
const END_THRESHOLD = 24;

// Signup consent checkbox. The box can't be ticked directly the first time:
// trying to tick it (or clicking the document names) opens a dialog with the
// Terms and Privacy Policy. "I agree" unlocks only after scrolling to the end,
// and agreeing ticks the box. Submits as name="terms" value="on", which the
// signUp action requires.
export function TermsConsent() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState(false);
  const [hasRead, setHasRead] = useState(false); // read to the end at least once
  const [reachedEnd, setReachedEnd] = useState(false);
  const [progress, setProgress] = useState(0);

  function measure(el: HTMLDivElement) {
    const max = el.scrollHeight - el.clientHeight;
    const pct = max <= 0 ? 1 : el.scrollTop / max;
    setProgress((p) => Math.max(p, pct)); // never moves backwards
    if (max - el.scrollTop <= END_THRESHOLD) setReachedEnd(true);
  }

  function openDialog() {
    setReachedEnd(hasRead);
    setProgress(hasRead ? 1 : 0);
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden"; // lock page behind
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = 0;
      measure(el); // handles content short enough to need no scrolling
    });
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function agree() {
    setHasRead(true);
    setChecked(true);
    closeDialog();
  }

  return (
    <>
      <div className="flex items-start gap-2 text-sm text-slate-600">
        <input
          id="terms"
          type="checkbox"
          name="terms"
          required
          checked={checked}
          onChange={(e) => {
            // First tick opens the documents instead of ticking.
            if (e.target.checked && !hasRead) {
              openDialog();
              return;
            }
            setChecked(e.target.checked);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300"
          aria-describedby="terms-help"
        />
        <span>
          <label htmlFor="terms" className="cursor-pointer">
            I have read and agree to the
          </label>{" "}
          <button type="button" onClick={openDialog} className="text-brand-600 hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" onClick={openDialog} className="text-brand-600 hover:underline">
            Privacy Policy
          </button>
          .
          {!hasRead && (
            <span id="terms-help" className="mt-0.5 block text-xs text-slate-400">
              You&apos;ll need to read them to the end before agreeing.
            </span>
          )}
        </span>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="terms-dialog-title"
        onClose={() => {
          document.documentElement.style.overflow = "";
        }}
        onClick={(e) => {
          // Click on the backdrop (outside the panel) closes it.
          if (e.target === dialogRef.current) closeDialog();
        }}
        className="m-auto w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-xl bg-white p-0 shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex max-h-[85vh] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h2 id="terms-dialog-title" className="text-lg font-semibold text-gray-900">
              Terms of Service &amp; Privacy Policy
            </h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable documents */}
          <div
            ref={scrollRef}
            onScroll={(e) => measure(e.currentTarget)}
            tabIndex={0}
            aria-label="Terms of Service and Privacy Policy"
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5 focus:outline-none"
          >
            <div className={LEGAL_PROSE}>
              <TermsContent embedded />
              <hr className="my-10 border-[var(--border)]" />
              <PrivacyContent />
            </div>
          </div>

          {/* Read progress */}
          <div className="h-1 w-full bg-gray-100" aria-hidden>
            <div
              className="h-full bg-brand-600 transition-[width] duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
            <p className="text-sm text-gray-500" aria-live="polite">
              {reachedEnd
                ? "Thanks for reading. You can agree now."
                : "Scroll to the bottom to continue."}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="button" onClick={agree} disabled={!reachedEnd}>
                I agree
              </Button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
