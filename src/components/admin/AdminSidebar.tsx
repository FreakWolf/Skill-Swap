"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Flag,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Tags,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

export const ADMIN_NAV = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Offerings", href: "/admin/offerings", icon: BookOpenCheck },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Reports", href: "/admin/reports", icon: Flag },
  { name: "Support", href: "/admin/support", icon: LifeBuoy },
  { name: "Purchases", href: "/admin/purchases", icon: CreditCard },
  { name: "Skills", href: "/admin/skills", icon: Tags },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Audit log", href: "/admin/audit", icon: ClipboardList },
] as const;

export function AdminSidebar({ badges }: { badges: { reports: number; support: number } }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
  const badgeFor = (href: string) =>
    href === "/admin/reports" ? badges.reports : href === "/admin/support" ? badges.support : 0;

  return (
    <>
      {/* Mobile: brand bar + horizontally scrolling nav */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-card lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" aria-label="Admin overview" className="flex items-center gap-2">
            <Logo height={18} decorative />
            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-fg">Admin</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" aria-hidden /> App
          </Link>
        </div>
        <nav aria-label="Admin sections" className="hide-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                isActive(item.href, "exact" in item && item.exact)
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-700",
              )}
            >
              {item.name}
              {badgeFor(item.href) > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{badgeFor(item.href)}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside
        aria-label="Admin navigation"
        className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-card lg:sticky lg:top-0 lg:flex lg:h-screen"
      >
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
          <Link href="/admin" aria-label="Admin overview" className="py-2">
            <Logo height={22} decorative priority />
          </Link>
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-fg">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href, "exact" in item && item.exact)
                    ? "bg-brand-50 text-brand-fg"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="flex-1">{item.name}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to app
          </Link>
        </div>
      </aside>
    </>
  );
}
