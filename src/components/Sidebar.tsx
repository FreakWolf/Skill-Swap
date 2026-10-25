"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Search,
  Calendar,
  CalendarCheck,
  MessageSquare,
  Bell,
  BarChart3,
  User,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  Coins,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { CountUp } from "@/components/motion/CountUp";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/cn";

export function Sidebar({
  name,
  email,
  avatarUrl,
  balance,
  unreadMessages = 0,
  unreadNotifications = 0,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  balance: number;
  unreadMessages?: number;
  unreadNotifications?: number;
}) {
  const nav = [
    { name: "Dashboard", href: "/dashboard", icon: Home, badge: 0 },
    { name: "Marketplace", href: "/marketplace", icon: Search, badge: 0 },
    { name: "Calendar", href: "/calendar", icon: Calendar, badge: 0 },
    { name: "Sessions", href: "/sessions", icon: CalendarCheck, badge: 0 },
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: unreadMessages },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadNotifications },
    { name: "Analytics", href: "/analytics", icon: BarChart3, badge: 0 },
  ];

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Mobile drawer: lock page scroll, move focus in, close on Escape, and
  // return focus to the menu button when it closes.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const opener = openButtonRef.current;
    root.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Mobile header (stays at the top while the page scrolls) */}
      <header className="glass-strong sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 lg:hidden">
        <button
          ref={openButtonRef}
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="app-sidebar"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
        <Link
          href="/dashboard"
          aria-label="SkillSwap home"
          className="min-w-0 rounded-full py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo height={16} decorative priority />
        </Link>
        <ThemeToggle compactOnMobile className="ml-auto" />
      </header>

      {/* Sidebar: slide-in drawer on mobile, sticky column on desktop.
          `invisible` when closed on mobile so its links aren't reachable by
          keyboard while off-screen. */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          "glass-strong fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-soft transition-[transform,visibility] duration-[250ms] ease-[var(--ease-out)] lg:visible lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:shadow-none",
          open ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <Link
            href="/dashboard"
            aria-label="SkillSwap home"
            className="min-w-0 rounded-full py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo height={21} decorative priority />
          </Link>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-brand-soft hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-brand-soft font-semibold text-brand-soft-fg"
                    : "text-muted hover:translate-x-0.5 hover:bg-card hover:text-foreground motion-reduce:hover:translate-x-0",
                )}
              >
                <Icon
                  className={cn("h-5 w-5 transition-transform duration-150 group-hover:scale-110 motion-reduce:group-hover:scale-100", active && "text-link")}
                  aria-hidden
                />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-4 border-t border-border pt-4">
            <Link
              href="/offer"
              onClick={() => setOpen(false)}
              className="lift bg-gradient-primary flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <PlusCircle className="h-5 w-5" aria-hidden />
              <span>Offer a Skill</span>
            </Link>
          </div>

          {/* Credits */}
          <div className="mt-3">
            <Link
              href="/credits"
              onClick={() => setOpen(false)}
              aria-current={isActive("/credits") ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold text-accent-fg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive("/credits")
                  ? "border-accent/60 bg-accent-soft"
                  : "border-accent/30 bg-accent-soft hover:border-accent/60",
              )}
            >
              <Coins className="h-5 w-5" aria-hidden />
              <span className="flex-1">
                <CountUp value={balance} /> {balance === 1 ? "credit" : "credits"}
              </span>
              <span className="rounded-full bg-card-solid px-2 py-0.5 text-xs font-bold">Buy</span>
            </Link>
          </div>
        </nav>

        <div className="flex items-center justify-between gap-2 px-5 pb-2">
          <span className="text-xs font-medium text-muted">Theme</span>
          <ThemeToggle />
        </div>

        {/* User */}
        <div className="relative border-t border-border p-3">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar name={name} url={avatarUrl} size={36} />
            <div className="min-w-0 flex-1 text-left">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">
                {name || "User"}
              </p>
              <p className="line-clamp-1 text-xs text-muted">
                {email || "user@example.com"}
              </p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="animate-fade-up absolute bottom-16 left-3 right-3 z-20 overflow-hidden rounded-2xl border border-border bg-elevated py-1.5 shadow-lift">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-brand-soft focus:outline-none focus-visible:bg-brand-soft"
                >
                  <User className="h-4 w-4" aria-hidden /> Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-brand-soft focus:outline-none focus-visible:bg-brand-soft"
                >
                  <Settings className="h-4 w-4" aria-hidden /> Settings
                </Link>
                <form action={logOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-danger-fg hover:bg-danger-soft focus:outline-none focus-visible:bg-danger-soft"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> Logout
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
