// Shared Sentry settings for server, edge and browser.
// Sentry stays OFF until NEXT_PUBLIC_SENTRY_DSN is set (locally in .env.local,
// in production in Vercel → Settings → Environment Variables).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryOptions = {
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // Errors only. Raise this (e.g. 0.1) later to sample performance traces.
  tracesSampleRate: 0,
  // Privacy: don't attach IP addresses, cookies or request headers.
  sendDefaultPii: false,
};
