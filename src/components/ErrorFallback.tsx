"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

// Friendly "something went wrong" screen. Reports the error to Sentry (a no-op
// until a DSN is configured) and lets the user retry.
export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sorry about that. Please try again. If it keeps happening, let us know.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-400">Error reference: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex h-9 items-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
