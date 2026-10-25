import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const ANCHORS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/** Public sticky glass header (landing + legal pages). Section anchors only
 *  on the landing page; below 640px it collapses to logo, toggle, Sign up. */
export function SiteHeader({ anchors = false }: { anchors?: boolean }) {
  return (
    <header className="glass-strong sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href="/"
          aria-label="SkillSwap home"
          className="shrink-0 rounded-full py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo height={18} decorative priority />
        </Link>
        {anchors && (
          <nav aria-label="Sections" className="ml-4 hidden items-center gap-1 lg:flex">
            {ANCHORS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {a.label}
              </a>
            ))}
          </nav>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle compactOnMobile />
          <span className="hidden sm:inline-flex">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
          </span>
          <ButtonLink href="/signup" size="sm">
            Sign up
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
