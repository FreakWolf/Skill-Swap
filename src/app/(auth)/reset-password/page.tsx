import Link from "next/link";
import { AuthShell } from "@/components/site/AuthShell";
import { getSessionUser } from "@/lib/auth";
import { ResetPasswordForm } from "./ResetPasswordForm";

// Reached from the emailed reset link via /auth/callback, which signs the user
// in first. Without a session the link was invalid or expired.
export default async function ResetPasswordPage() {
  const session = await getSessionUser();
  return (
    <AuthShell>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
        Choose a new password
      </h1>
      {session ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted">
            This reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-link hover:underline"
          >
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export const metadata = { title: "Choose a new password", robots: { index: false } };
