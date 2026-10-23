import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LEGAL_PROSE } from "@/components/legal/prose";

// Shared shell for public legal pages (Terms, Privacy).
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="py-1">
            <Logo height={22} priority />
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link href="/terms" className="inline-block py-2 hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="inline-block py-2 hover:text-gray-900">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <article className={LEGAL_PROSE}>
          {children}
        </article>
      </main>
    </div>
  );
}
