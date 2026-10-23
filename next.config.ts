import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry's build plugin only uploads source maps (readable stack traces).
// It's applied only when an auth token is present, so builds work without
// Sentry configured. Error reporting itself is controlled by the DSN.
const withSentry = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentry
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
    })
  : nextConfig;
