import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { DataTable, PageHeader, StatTile, StatusBadge, fmtDate, shortId } from "@/components/admin/ui";
import { getUserDetail } from "@/lib/admin/users";
import { REPORT_REASONS } from "@/lib/admin/reports";
import { requireAdmin } from "@/lib/auth";
import { UserActions } from "./UserActions";

export const metadata = { title: "User" };

const reasonLabel: Record<string, string> = {
  signup_grant: "Starter credits",
  booking_hold: "Booking hold",
  booking_refund: "Refund",
  session_earning: "Session earning",
  adjustment: "Admin adjustment",
  purchase: "Purchase",
};

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user: me } = await requireAdmin();
  const d = await getUserDetail(id);
  if (!d) notFound();
  const p = d.profile;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-900">← All users</Link>

      <PageHeader title={p.full_name || "Unnamed member"} description={d.email}>
        <Link href={`/u/${p.id}`} className="text-sm font-medium text-brand-700 hover:underline">View public profile</Link>
      </PageHeader>

      <Card className="flex flex-wrap items-center gap-5 p-5">
        <Avatar name={p.full_name} url={p.avatar_url} size={64} />
        <div className="flex-1 space-y-1 text-sm text-gray-600">
          <div className="flex flex-wrap gap-1">
            {p.is_admin && <StatusBadge status="admin" />}
            {p.suspended_at ? <StatusBadge status="suspended" /> : <StatusBadge status="active" />}
            {!p.onboarded && <StatusBadge status="pending" label="not onboarded" />}
          </div>
          <p>{p.location || "No location"} · Joined {fmtDate(p.created_at, false)}</p>
          {p.languages.length > 0 && <p>Languages: {p.languages.join(", ")}</p>}
          {p.bio && <p className="text-gray-700">{p.bio}</p>}
          {p.suspended_at && (
            <p className="text-red-700">
              Suspended {fmtDate(p.suspended_at)}{p.suspended_reason ? `: ${p.suspended_reason}` : ""}
            </p>
          )}
          <p className="text-xs text-gray-400">ID {p.id}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Balance" value={d.balance} tone="amber" />
        <StatTile label="Offerings" value={d.offerings.length} sub={`${d.offerings.filter((o) => o.is_active).length} active`} />
        <StatTile label="Bookings" value={d.bookings.length} sub="most recent 20" tone="green" />
        <StatTile label="Reports" value={d.reportsAbout.length} sub={`about them · filed ${d.reportsBy}`} tone={d.reportsAbout.length > 0 ? "red" : "gray"} />
      </div>

      <UserActions id={p.id} isSelf={p.id === me.id} isAdmin={p.is_admin} suspendedAt={p.suspended_at} />

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Credit ledger</h2>
        <DataTable
          rows={d.ledger}
          empty="No credit movement yet."
          columns={[
            { key: "when", header: "When", render: (r) => fmtDate(r.created_at) },
            { key: "reason", header: "Reason", render: (r) => reasonLabel[r.reason] ?? r.reason },
            { key: "offering", header: "Session", render: (r) => r.offering_title ?? "—" },
            {
              key: "amount",
              header: "Credits",
              className: "text-right",
              render: (r) => (
                <span className={r.amount > 0 ? "font-semibold text-green-700" : "font-semibold text-gray-900"}>
                  {r.amount > 0 ? `+${r.amount}` : r.amount}
                </span>
              ),
            },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Bookings</h2>
        <DataTable
          rows={d.bookings}
          empty="No bookings."
          columns={[
            { key: "when", header: "Starts", render: (b) => fmtDate(b.starts_at) },
            { key: "offering", header: "Offering", render: (b) => b.offering_title },
            {
              key: "role",
              header: "Role",
              render: (b) => (b.learner_id === p.id ? `Learner · with ${b.other_name}` : `Teacher · for ${b.other_name}`),
            },
            { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
            { key: "cost", header: "Credits", className: "text-right", render: (b) => b.credit_cost },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Offerings</h2>
        <DataTable
          rows={d.offerings}
          empty="No offerings."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (o) => (
                <Link href={`/offerings/${o.id}`} className="font-medium text-gray-900 hover:underline">{o.title}</Link>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (o) => (
                <span className="flex gap-1">
                  <StatusBadge status={o.is_active ? "active" : "paused"} />
                  {o.is_featured && <StatusBadge status="featured" />}
                </span>
              ),
            },
            { key: "cost", header: "Credits", render: (o) => `${o.credit_cost} · ${o.duration_min} min` },
            { key: "created", header: "Created", render: (o) => fmtDate(o.created_at, false) },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Reports about this member</h2>
        <DataTable
          rows={d.reportsAbout}
          empty="No reports."
          columns={[
            { key: "when", header: "Filed", render: (r) => fmtDate(r.created_at) },
            { key: "by", header: "By", render: (r) => r.reporter_name },
            { key: "reason", header: "Reason", render: (r) => <Badge>{REPORT_REASONS[r.reason] ?? r.reason}</Badge> },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "link",
              header: "",
              className: "text-right",
              render: (r) => (
                <Link href={`/admin/reports?status=${r.status}#${shortId(r.id)}`} className="text-brand-700 hover:underline">Open</Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
