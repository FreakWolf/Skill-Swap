import { AuthShell } from "@/components/site/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell subtitle="Enter your email and we'll send you a link to reset your password.">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

export const metadata = { title: "Forgot password", robots: { index: false } };
