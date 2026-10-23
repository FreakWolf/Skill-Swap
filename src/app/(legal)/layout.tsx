import Link from "next/link";
import { Logo } from "@/components/Logo";

// Shared shell for public legal pages (Terms, Privacy).
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo className="text-xl" />
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <article className="space-y-4 text-[15px] leading-7 text-gray-700 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_li]:ml-5 [&_li]:list-disc [&_a]:text-blue-600 [&_a]:underline">
          {children}
        </article>
      </main>
    </div>
  );
}
