import { Logo } from "@/components/Logo";
import { requireUser } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
