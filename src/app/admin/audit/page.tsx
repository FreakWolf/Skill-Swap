import Link from "next/link";
import { Badge } from "@/components/ui/Card";
import { DataTable, PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { listAudit, type AuditRow } from "@/lib/admin/audit";
import { pageFrom, type SearchParams } from "@/lib/admin/shared";

export const metadata = { title: "Audit log" };

const targetHref = (type: string, id: string) => {
  if (type === "user") return `/admin/users/${id}`;
  if (type === "offering") return `/offerings/${id}`;
  if (type === "booking") return `/admin/bookings`;
  if (type === "report") return `/admin/reports?status=all`;
  if (type === "support_ticket") return `/admin/support?status=all`;
  if (type === "announcement") return `/admin/announcements`;
  if (type === "skill") return `/admin/skills`;
  return null;
};

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = pageFrom(sp);
  const result = await listAudit(page);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Every admin action, newest first." />

      <DataTable<AuditRow>
        rows={result.rows}
        empty="No admin actions recorded yet."
        columns={[
          { key: "when", header: "When", render: (r) => fmtDate(r.created_at) },
          {
            key: "admin",
            header: "Admin",
            render: (r) =>
              r.admin ? (
                <Link href={`/admin/users/${r.admin.id}`} className="hover:underline">{r.admin.full_name}</Link>
              ) : (
                <span className="text-gray-500">system</span>
              ),
          },
          { key: "action", header: "Action", render: (r) => <Badge>{r.action}</Badge> },
          {
            key: "target",
            header: "Target",
            render: (r) => {
              const href = targetHref(r.target_type, r.target_id);
              const label = `${r.target_type} ${r.target_id.slice(0, 8)}`;
              return href ? <Link href={href} className="font-mono text-xs text-brand-fg hover:underline">{label}</Link> : <span className="font-mono text-xs">{label}</span>;
            },
          },
          {
            key: "details",
            header: "Details",
            render: (r) =>
              Object.keys(r.details ?? {}).length > 0 ? (
                <code className="block max-w-md truncate text-xs text-gray-600">{JSON.stringify(r.details)}</code>
              ) : (
                <span className="text-gray-400">—</span>
              ),
          },
        ]}
      />

      <Pagination basePath="/admin/audit" page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
