import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { name: "How it works", href: "/#how-it-works" },
      { name: "Pricing", href: "/pricing" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms", href: "/terms" },
      { name: "Privacy", href: "/privacy" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-card">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo height={20} />
            <p className="mt-4 max-w-xs text-sm text-gray-600">{SITE.description}</p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-600 hover:text-gray-900">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} {SITE.name}. {SITE.tagline}.</span>
          <span>Earn credits by teaching. Spend them to learn.</span>
        </div>
      </div>
    </footer>
  );
}
