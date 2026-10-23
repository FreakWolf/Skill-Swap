import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo className="text-3xl" />
          </Link>
          <p className="mt-3 text-slate-600">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <Card className="p-6 shadow-lg sm:p-8">
          <h1 className="mb-4 text-lg font-semibold text-gray-900">Reset your password</h1>
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}

export const metadata = { title: "Forgot password", robots: { index: false } };
