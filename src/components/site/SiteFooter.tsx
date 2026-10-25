import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SITE } from "@/lib/site";

const linkClass =
  "inline-block rounded py-1.5 text-sm text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Rich public footer. `onLanding` keeps the section anchors on-page;
 *  elsewhere they point back to the landing page. */
export function SiteFooter({ onLanding = false }: { onLanding?: boolean }) {
  const base = onLanding ? "" : "/";
  const columns = [
    {
      title: "Product",
      links: [
        { href: `${base}#how-it-works`, label: "How it works" },
        { href: `${base}#features`, label: "Features" },
        { href: `${base}#pricing`, label: "Pricing" },
        { href: `${base}#faq`, label: "FAQ" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/login", label: "Log in" },
        { href: "/signup", label: "Sign up" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
      ],
    },
  ];
  const domain = SITE.url.replace(/^https?:\/\//, "");
  return (
    <footer className="glass-strong mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo height={18} />
          <p className="mt-3 max-w-xs text-sm text-muted">
            {SITE.tagline}. Teach what you know, learn what you don&apos;t.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            Mobile app coming soon
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-foreground">{c.title}</h2>
            <ul className="mt-3 space-y-1">
              {c.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("#") || l.href.startsWith("/#") ? (
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-muted sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.name} · {domain}
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
