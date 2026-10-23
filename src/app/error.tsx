"use client";

import { ErrorFallback } from "@/components/ErrorFallback";

// Shown when a page throws. Keeps the app shell (sidebar etc.) around it.
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorFallback {...props} />;
}
