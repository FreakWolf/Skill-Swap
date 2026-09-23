"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Search,
  Calendar,
  CalendarCheck,
  MessageSquare,
  Bell,
  User,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  Coins,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
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
  ];

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Mobile header */}
      <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="mr-2 flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-xl font-bold text-blue-600">SkillSwap</span>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            SkillSwap
          </Link>
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
                    ? "bg-blue-50 text-blue-600"
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
              className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Offer a Skill</span>
            </Link>
          </div>

          {/* Credits */}
          <div className="mt-4">
            <Link
              href="/sessions"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700"
            >
              <Coins className="h-5 w-5" />
              <span>
                {balance} {balance === 1 ? "credit" : "credits"}
              </span>
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
