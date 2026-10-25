import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/** Shared frame for the auth pages: ambient canvas, floating blobs, logo,
 *  a glass card and the theme toggle. */
export function AuthShell({
  subtitle,
  children,
}: {
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="blob -left-24 top-10 h-72 w-72 bg-brand-300/40 dark:bg-brand-600/25" />
      <div
        aria-hidden
        className="blob -right-20 bottom-0 h-80 w-80 bg-brand-orange-200/50 [animation-delay:-6s] dark:bg-brand-orange-500/15"
      />
      <div className="relative flex justify-end p-4">
        <ThemeToggle />
      </div>
      <main className="relative flex flex-1 items-start justify-center px-4 pb-12 sm:items-center">
        <div className="animate-fade-up w-full max-w-md">
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="inline-block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Logo variant="full" height={132} priority />
            </Link>
            {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
          </div>
          <Card className="p-6 sm:p-8">{children}</Card>
        </div>
      </main>
    </div>
  );
}

/** Log in / Sign up switch at the top of the auth card. */
export function AuthTabs({ active }: { active: "login" | "signup" }) {
  const tab = "rounded-full py-2 text-center transition-colors";
  const on = `${tab} bg-gradient-primary font-semibold text-white shadow-soft`;
  const off = `${tab} text-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`;
  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-border bg-input p-1 text-sm font-medium">
      {active === "login" ? (
        <span className={on}>Log in</span>
      ) : (
        <Link href="/login" className={off}>
          Log in
        </Link>
      )}
      {active === "signup" ? (
        <span className={on}>Sign up</span>
      ) : (
        <Link href="/signup" className={off}>
          Sign up
        </Link>
      )}
    </div>
  );
}
