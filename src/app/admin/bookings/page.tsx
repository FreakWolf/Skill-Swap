import Link from "next/link";
import {
  DataTable,
  FilterChips,
  PageHeader,
  Pagination,
  StatusBadge,
  fmtDate,
} from "@/components/admin/ui";
import { listBookings, type AdminBooking } from "@/lib/admin/bookings";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import { CancelBookingForm } from "./CancelBookingForm";

export const metadata = { title: "Bookings" };

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const status = param(sp, "status") || "all";
  const page = pageFrom(sp);
  const result = await listBookings({ status, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description={`${result.total} booking${result.total === 1 ? "" : "s"}`} />

      <FilterChips
        basePath="/admin/bookings"
        param="status"
        current={status}
        options={[
          { value: "all", label: "All" },
          { value: "confirmed", label: "Confirmed" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />

      <DataTable<AdminBooking>
        rows={result.rows}
        empty="No bookings match."
        columns={[
          { key: "when", header: "Starts", render: (b) => fmtDate(b.starts_at) },
          {
            key: "offering",
            header: "Offering",
            render: (b) => (
              <Link href={`/sessions/${b.id}`} className="font-medium text-gray-900 hover:underline">{b.offering_title}</Link>
            ),
          },
          {
            key: "people",
            header: "Learner → Teacher",
            render: (b) => (
              <span>
                <Link href={`/admin/users/${b.learner_id}`} className="hover:underline">{b.learner_name}</Link>
                <span className="text-gray-400"> → </span>
                <Link href={`/admin/users/${b.teacher_id}`} className="hover:underline">{b.teacher_name}</Link>
              </span>
            ),
          },
          { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
          { key: "cost", header: "Credits", className: "text-right", render: (b) => b.credit_cost },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (b) => (b.status === "confirmed" ? <CancelBookingForm id={b.id} /> : null),
          },
        ]}
      />

      <Pagination basePath="/admin/bookings" page={result.page} pageSize={result.pageSize} total={result.total} keep={{ status }} />
    </div>
  );
}
