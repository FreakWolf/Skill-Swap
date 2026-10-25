"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { Button, ButtonLink } from "@/components/ui/Button";

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
      <div className="glass max-w-md rounded-3xl px-6 py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger-fg">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          Sorry about that. Please try again. If it keeps happening, let us know.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-subtle">Error reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/dashboard" variant="outline">
            Go to dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
