import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo variant="full" height={150} priority />
          </Link>
          <p className="mt-3 text-slate-600">
            Learn skills, teach others, grow together.
          </p>
        </div>
        <Card className="p-6 shadow-lg sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-neutral-200 p-1 text-sm font-medium">
            <span className="rounded-full bg-white py-2 text-center text-black shadow-sm">
              Log in
            </span>
            <Link href="/signup" className="rounded-full py-2 text-center text-slate-600 hover:text-black">
              Sign up
            </Link>
          </div>
          {error === "link_expired" && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              That link is invalid or has expired. Log in, or{" "}
              <Link href="/forgot-password" className="font-medium underline">
                request a new reset link
              </Link>
              .
            </p>
          )}
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Log in",
  description: "Log in to SkillSwap to book sessions, message teachers, and manage your credits.",
  alternates: { canonical: "/login" },
};
