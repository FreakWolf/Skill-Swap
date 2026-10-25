import Link from "next/link";
import { Card, Badge } from "@/components/ui/Card";
import { FilterChips, PageHeader, Pagination, StatusBadge, fmtDate, shortId } from "@/components/admin/ui";
import { REPORT_REASONS, listReports } from "@/lib/admin/reports";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import { ReportTriage } from "./ReportTriage";

export const metadata = { title: "Reports" };

const contextHref = (type: string, id: string | null) => {
  if (!id) return null;
  if (type === "session") return `/sessions/${id}`;
  if (type === "message") return `/messages/${id}`;
  if (type === "offering") return `/offerings/${id}`;
  return `/u/${id}`;
};

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = param(sp, "status") || "open";
  const page = pageFrom(sp);
  const result = await listReports({ status, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Member reports, newest first. Resolving or dismissing records who closed it." />

      <FilterChips
        basePath="/admin/reports"
        param="status"
        current={status}
        options={[
          { value: "open", label: "Open" },
          { value: "reviewing", label: "Reviewing" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
          { value: "all", label: "All" },
        ]}
      />

      {result.rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-500">No reports with this status.</Card>
      ) : (
        <div className="space-y-4">
          {result.rows.map((r) => {
            const ctx = contextHref(r.context_type, r.context_id);
            return (
              <Card key={r.id} id={shortId(r.id)} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} />
                      <Badge>{REPORT_REASONS[r.reason] ?? r.reason}</Badge>
                      <span className="text-xs text-gray-500">{fmtDate(r.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <Link href={`/admin/users/${r.reporter?.id}`} className="font-medium hover:underline">{r.reporter?.full_name ?? "Member"}</Link>
                      {" reported "}
                      <Link href={`/admin/users/${r.reported?.id}`} className="font-medium hover:underline">{r.reported?.full_name ?? "Member"}</Link>
                      {r.reported?.suspended_at && <StatusBadge status="suspended" />}
                      {" · "}
                      <span className="capitalize">{r.context_type}</span>
                      {ctx && (
                        <>
                          {" · "}
                          <Link href={ctx} className="text-brand-fg hover:underline">open context</Link>
                        </>
                      )}
                    </p>
                  </div>
                  <Link href={`/admin/users/${r.reported?.id}`} className="text-sm font-medium text-brand-fg hover:underline">
                    Manage reported member
                  </Link>
                </div>
                {r.details && (
                  <blockquote className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{r.details}</blockquote>
                )}
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <ReportTriage id={r.id} status={r.status} notes={r.admin_notes} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination basePath="/admin/reports" page={result.page} pageSize={result.pageSize} total={result.total} keep={{ status }} />
    </div>
  );
}
