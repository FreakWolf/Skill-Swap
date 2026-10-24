import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { FilterChips, PageHeader, Pagination, StatusBadge, fmtDate } from "@/components/admin/ui";
import { listTickets } from "@/lib/admin/support";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import { TicketReply } from "./TicketReply";

export const metadata = { title: "Support" };

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = param(sp, "status") || "open";
  const page = pageFrom(sp);
  const result = await listTickets({ status, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Messages from the public contact form." />

      <FilterChips
        basePath="/admin/support"
        param="status"
        current={status}
        options={[
          { value: "open", label: "Open" },
          { value: "answered", label: "Answered" },
          { value: "closed", label: "Closed" },
          { value: "all", label: "All" },
        ]}
      />

      {result.rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-500">No tickets with this status.</Card>
      ) : (
        <div className="space-y-4">
          {result.rows.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={t.status} />
                    <span className="text-xs text-gray-500">{fmtDate(t.created_at)}</span>
                  </div>
                  <h2 className="mt-1 font-semibold text-gray-900">{t.subject}</h2>
                  <p className="text-sm text-gray-600">
                    {t.name} ·{" "}
                    <a
                      href={`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.subject}`)}${t.admin_reply ? `&body=${encodeURIComponent(t.admin_reply)}` : ""}`}
                      className="text-brand-700 hover:underline"
                    >
                      {t.email}
                    </a>
                    {t.admin_reply && <span className="text-xs text-gray-500"> (opens your mail app with the saved reply)</span>}
                    {t.user_id && (
                      <>
                        {" · "}
                        <Link href={`/admin/users/${t.user_id}`} className="text-brand-700 hover:underline">member</Link>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <blockquote className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{t.message}</blockquote>
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <TicketReply id={t.id} status={t.status} reply={t.admin_reply} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination basePath="/admin/support" page={result.page} pageSize={result.pageSize} total={result.total} keep={{ status }} />
    </div>
  );
}
