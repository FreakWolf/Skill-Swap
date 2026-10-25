import Link from "next/link";
import {
  BookOpenCheck,
  CalendarCheck,
  Coins,
  CreditCard,
  Flag,
  LifeBuoy,
  UserX,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BarList } from "@/components/charts/BarList";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { PageHeader, StatTile, StatusBadge } from "@/components/admin/ui";
import { getAdminStats } from "@/lib/admin/stats";
import { formatPrice } from "@/lib/credit-packs";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const s = await getAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="What is happening across SkillSwap right now." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Members" value={s.users} sub={`${s.newUsers30d} joined in the last 30 days`} icon={Users} tone="brand" />
        <StatTile label="Active offerings" value={s.activeOfferings} sub={`${s.offerings} total`} icon={BookOpenCheck} tone="orange" />
        <StatTile label="Bookings" value={s.bookings} sub={`${s.bookingsByStatus.confirmed ?? 0} upcoming or in progress`} icon={CalendarCheck} tone="green" />
        <StatTile label="Credits in circulation" value={s.creditsInCirculation} sub="Sum of all member balances" icon={Coins} tone="amber" />
        <StatTile label="Revenue" value={formatPrice(s.revenuePaise)} sub={`${s.paidPurchases} paid purchases`} icon={CreditCard} tone="green" />
        <StatTile label="Open reports" value={s.openReports} sub="Open or under review" icon={Flag} tone={s.openReports > 0 ? "red" : "gray"} />
        <StatTile label="Open tickets" value={s.openTickets} sub="From the contact form" icon={LifeBuoy} tone={s.openTickets > 0 ? "amber" : "gray"} />
        <StatTile label="Suspended" value={s.suspended} sub="Accounts currently suspended" icon={UserX} tone={s.suspended > 0 ? "red" : "gray"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Signups per week</h2>
          <ColumnChart data={s.signupsByWeek} />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Bookings per week</h2>
          <ColumnChart data={s.bookingsByWeek} color="bg-brand-orange-500" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Most offered skills</h2>
          {s.topSkills.length > 0 ? (
            <BarList items={s.topSkills} />
          ) : (
            <p className="text-sm text-gray-500">No active offerings yet.</p>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Bookings by status</h2>
          <ul className="space-y-2">
            {["confirmed", "completed", "cancelled", "pending"].map((st) => (
              <li key={st} className="flex items-center justify-between text-sm">
                <StatusBadge status={st} />
                <span className="font-medium text-gray-900">{s.bookingsByStatus[st] ?? 0}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link href="/admin/reports" className="font-medium text-brand-700 hover:underline">Review reports</Link>
            <span className="text-gray-300">·</span>
            <Link href="/admin/support" className="font-medium text-brand-700 hover:underline">Answer tickets</Link>
            <span className="text-gray-300">·</span>
            <Link href="/admin/announcements" className="font-medium text-brand-700 hover:underline">Post an announcement</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
