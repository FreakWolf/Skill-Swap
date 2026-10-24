import Link from "next/link";
import { DataTable, FilterChips, PageHeader, Pagination, StatTile, StatusBadge, fmtDate } from "@/components/admin/ui";
import { listPurchases, type AdminPurchase } from "@/lib/admin/purchases";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import { formatPrice } from "@/lib/credit-packs";

export const metadata = { title: "Purchases" };

export default async function AdminPurchasesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = param(sp, "status") || "all";
  const page = pageFrom(sp);
  const { purchases, totals } = await listPurchases({ status, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" description="Credit packs bought through Razorpay." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Revenue" value={formatPrice(totals.paidPaise)} tone="green" />
        <StatTile label="Paid purchases" value={totals.paidCount} tone="brand" />
        <StatTile label="Credits sold" value={totals.paidCredits} tone="amber" />
        <StatTile label="Failed payments" value={totals.failedCount} tone={totals.failedCount > 0 ? "red" : "gray"} />
      </div>

      <FilterChips
        basePath="/admin/purchases"
        param="status"
        current={status}
        options={[
          { value: "all", label: "All" },
          { value: "paid", label: "Paid" },
          { value: "created", label: "Pending" },
          { value: "failed", label: "Failed" },
        ]}
      />

      <DataTable<AdminPurchase>
        rows={purchases.rows}
        empty="No purchases match."
        columns={[
          { key: "when", header: "Created", render: (p) => fmtDate(p.created_at) },
          {
            key: "user",
            header: "Member",
            render: (p) => <Link href={`/admin/users/${p.user_id}`} className="hover:underline">{p.user_name || p.user_id.slice(0, 8)}</Link>,
          },
          { key: "pack", header: "Pack", render: (p) => `${p.pack_id} · ${p.credits} credit${p.credits === 1 ? "" : "s"}` },
          { key: "amount", header: "Amount", render: (p) => formatPrice(p.amount_paise) },
          { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} label={p.status === "created" ? "pending" : p.status} /> },
          {
            key: "ids",
            header: "Razorpay",
            render: (p) => (
              <span className="font-mono text-xs text-gray-600">
                {p.provider_order_id}
                {p.provider_payment_id && <><br />{p.provider_payment_id}</>}
              </span>
            ),
          },
          { key: "paid", header: "Paid at", render: (p) => fmtDate(p.paid_at) },
        ]}
      />

      <Pagination basePath="/admin/purchases" page={purchases.page} pageSize={purchases.pageSize} total={purchases.total} keep={{ status }} />
    </div>
  );
}
