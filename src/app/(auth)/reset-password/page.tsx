import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/lib/auth";
import { ResetPasswordForm } from "./ResetPasswordForm";

// Reached from the emailed reset link via /auth/callback, which signs the user
// in first. Without a session the link was invalid or expired.
export default async function ResetPasswordPage() {
  const session = await getSessionUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo variant="full" height={150} priority />
          </Link>
        </div>
        <Card className="p-6 shadow-lg sm:p-8">
          <h1 className="mb-4 text-lg font-semibold text-gray-900">
            Choose a new password
          </h1>
          {session ? (
            <ResetPasswordForm />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600">
                This reset link is invalid or has expired.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Request a new link
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export const metadata = { title: "Choose a new password", robots: { index: false } };
