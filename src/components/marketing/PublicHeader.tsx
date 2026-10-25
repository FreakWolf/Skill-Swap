import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSessionUser } from "@/lib/auth";

export const MARKETING_NAV = [
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
] as const;

// Sticky, full-width header for public pages. Shows auth CTAs when signed
// out, or a dashboard link when a session exists.
export async function PublicHeader() {
  const session = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/60 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0 py-1" aria-label="SkillSwap home">
          <Logo height={22} priority className="max-w-[40vw] object-contain" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle compact className="hidden sm:inline-flex" />
          {session ? (
            <Button href="/dashboard" variant="brand">Go to dashboard</Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="hidden sm:block">Log in</Button>
              <Button href="/signup" variant="brand">Sign up</Button>
            </>
          )}

          {/* Mobile menu: native <details>, no JS needed. */}
          <details className="relative md:hidden">
            <summary
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md text-slate-700 hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border)] bg-card p-2 shadow-lg">
              {MARKETING_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ))}
              {!session && (
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 sm:hidden"
                >
                  Log in
                </Link>
              )}
              <div className="mt-2 border-t border-border px-1 pt-2 sm:hidden">
                <ThemeToggle className="w-full justify-between" />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
