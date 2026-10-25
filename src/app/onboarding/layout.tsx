import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { requireUser } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-strong sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo height={20} priority />
          <ThemeToggle />
        </div>
      </header>
      <main className="animate-page-in mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}

// Private onboarding steps: keep them out of search results.
export const metadata = { robots: { index: false, follow: false } };
