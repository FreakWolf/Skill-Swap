import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { LEGAL_PROSE } from "@/components/legal/prose";

// Shared shell for public legal pages (Terms, Privacy). Uses the same header
// and footer as the marketing site, with a reading-width article.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <article className={LEGAL_PROSE}>
          {children}
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
