import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/admin/shared";

async function getBadges() {
  const admin = await adminDb();
  const [reports, support] = await Promise.all([
    admin.from("reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    admin.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);
  return { reports: reports.count ?? 0, support: support.count ?? 0 };
}

// Admin shell: requires profiles.is_admin. Full-width content with its own
// navigation, separate from the member sidebar. Every data helper under
// src/lib/admin re-checks the session itself (adminDb), because pages render
// concurrently with this layout.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const badges = await getBadges();

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-card px-4 py-2 text-sm font-medium text-brand-fg shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <AdminSidebar badges={badges} />
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

export const metadata = {
  title: { default: "Admin", template: "%s · Admin · SkillSwap" },
  robots: { index: false, follow: false },
};
