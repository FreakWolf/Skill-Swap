import Link from "next/link";
import { AuthShell, AuthTabs } from "@/components/site/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { safeNext } from "@/lib/safe-next";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <AuthShell subtitle="Learn skills, teach others, grow together.">
      <h1 className="sr-only">Log in to SwapSkills</h1>
      <AuthTabs active="login" />
      {error === "link_expired" && (
        <Alert tone="warning" className="mb-4">
          That link is invalid or has expired. Log in, or{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            request a new reset link
          </Link>
          .
        </Alert>
      )}
      <LoginForm next={safeNext(next)} />
    </AuthShell>
  );
}

export const metadata = {
  title: "Log in",
  description: "Log in to SwapSkills to book sessions, message teachers, and manage your credits.",
  alternates: { canonical: "/login" },
};
