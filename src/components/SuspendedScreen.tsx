import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { logOut } from "@/app/(auth)/actions";
import { LEGAL } from "@/lib/legal-config";

// Shown instead of the app when profiles.suspended_at is set.
export function SuspendedScreen({ reason, since }: { reason: string; since: string }) {
  const date = new Date(since).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-background to-brand-orange-50 px-6 py-12">
      <Logo height={24} priority />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-[var(--border)] bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Your account is suspended</h1>
        <p className="mt-2 text-gray-600">
          Your SkillSwap account was suspended on {date}. You can&apos;t book, teach or message while it is suspended.
        </p>
        {reason && (
          <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm text-gray-700">
            <span className="font-medium">Reason given:</span> {reason}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-600">
          If you think this is a mistake, write to{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-brand-fg hover:underline">{LEGAL.contactEmail}</a>{" "}
          or use the <Link href="/contact" className="font-medium text-brand-fg hover:underline">contact form</Link>.
        </p>
        <form action={logOut} className="mt-6">
          <Button type="submit" variant="outline" className="w-full">Sign out</Button>
        </form>
      </div>
    </div>
  );
}
