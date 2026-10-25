import { LEGAL_PROSE } from "@/components/legal/prose";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

// Shared shell for public legal pages (Terms, Privacy).
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-elevated px-4 py-2 text-sm font-semibold text-link shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <article className={`glass animate-fade-up rounded-3xl p-6 sm:p-10 ${LEGAL_PROSE}`}>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
