"use client";

import "./globals.css";
import { ErrorFallback } from "@/components/ErrorFallback";

// Last-resort error screen when the root layout itself fails. Must render
// its own <html> and <body>.
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ErrorFallback {...props} />
      </body>
    </html>
  );
}
