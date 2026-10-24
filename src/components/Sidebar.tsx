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
  ShieldCheck,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { logOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/cn";

export function Sidebar({
  name,
  email,
  avatarUrl,
  balance,
  unreadMessages = 0,
  unreadNotifications = 0,
  isAdmin = false,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  balance: number;
  unreadMessages?: number;
  unreadNotifications?: number;
  isAdmin?: boolean;
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
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          ref={openButtonRef}
          onClick={() => setOpen(true)}
          className="mr-2 flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="app-sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" aria-label="SkillSwap home" className="py-2">
          <Logo height={20} decorative priority />
        </Link>
      </header>

      {/* Sidebar: slide-in drawer on mobile, sticky column on desktop.
          `invisible` when closed on mobile so its links aren't reachable by
          keyboard while off-screen. */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-[transform,visibility] duration-200 ease-in-out lg:visible lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <Link href="/dashboard" aria-label="SkillSwap home" className="py-2">
            {/* 25px tall ≈ 209px wide: fills the 216px-wide brand area. */}
            <Logo height={25} decorative priority />
          </Link>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <Link
              href="/offer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Offer a Skill</span>
            </Link>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive("/admin")
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="flex-1 text-left">Admin</span>
            </Link>
          )}

          {/* Credits */}
          <div className="mt-4">
            <Link
              href="/credits"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                isActive("/credits")
                  ? "border-amber-300 bg-amber-100 text-amber-800"
                  : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
              )}
            >
              <Coins className="h-5 w-5" aria-hidden />
              <span className="flex-1">
                {balance} {balance === 1 ? "credit" : "credits"}
              </span>
              <span className="text-xs font-semibold text-amber-800">Buy</span>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="relative border-t border-gray-200 p-3">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
          >
            <Avatar name={name} url={avatarUrl} size={36} />
            <div className="flex-1 text-left">
              <p className="line-clamp-1 text-sm font-medium text-gray-900">
                {name || "User"}
              </p>
              <p className="line-clamp-1 text-xs text-gray-500">
                {email || "user@example.com"}
              </p>
            </div>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute bottom-16 left-3 right-3 z-20 overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-700 hover:bg-gray-50"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admin panel
                  </Link>
                )}
                <form action={logOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
