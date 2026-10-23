import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry-options";

// Next.js calls this once per server runtime at startup.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(sentryOptions);
  }
}

// Reports errors thrown while handling requests (pages, server actions, routes).
export const onRequestError = Sentry.captureRequestError;
