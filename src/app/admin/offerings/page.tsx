import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  DataTable,
  FilterChips,
  PageHeader,
  Pagination,
  SearchForm,
  StatusBadge,
  fmtDate,
} from "@/components/admin/ui";
import { listOfferings, type AdminOffering, type OfferingFilter } from "@/lib/admin/offerings";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import { setOfferingFlag } from "./actions";

export const metadata = { title: "Offerings" };

function FlagForm({ id, field, value, label, variant = "outline" }: {
  id: string;
  field: "is_featured" | "is_active";
  value: boolean;
  label: string;
  variant?: "outline" | "ghost" | "danger";
}) {
  return (
    <form action={setOfferingFlag} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(value)} />
      <Button type="submit" size="sm" variant={variant}>{label}</Button>
    </form>
  );
}

export default async function AdminOfferingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = param(sp, "q");
  const filter = (param(sp, "filter") || "all") as OfferingFilter;
  const page = pageFrom(sp);
  const result = await listOfferings({ q, filter, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Offerings" description={`${result.total} offering${result.total === 1 ? "" : "s"}`}>
        <SearchForm placeholder="Search by title" defaultValue={q} keep={{ filter }} />
      </PageHeader>

      <FilterChips
        basePath="/admin/offerings"
        param="filter"
        current={filter}
        keep={{ q }}
        options={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "paused", label: "Paused" },
          { value: "featured", label: "Featured" },
        ]}
      />

      <DataTable<AdminOffering>
        rows={result.rows}
        empty="No offerings match."
        columns={[
          {
            key: "title",
            header: "Offering",
            render: (o) => (
              <div>
                <Link href={`/offerings/${o.id}`} className="font-medium text-gray-900 hover:underline">{o.title}</Link>
                <p className="text-xs text-gray-500">{o.skill_name} · {o.level} · {o.mode === "virtual" ? "Virtual" : "In person"}</p>
              </div>
            ),
          },
          {
            key: "teacher",
            header: "Teacher",
            render: (o) => (
              <Link href={`/admin/users/${o.teacher_id}`} className="hover:underline">{o.teacher_name}</Link>
            ),
          },
          { key: "cost", header: "Credits", render: (o) => `${o.credit_cost} · ${o.duration_min} min` },
          {
            key: "status",
            header: "Status",
            render: (o) => (
              <span className="flex flex-wrap gap-1">
                <StatusBadge status={o.is_active ? "active" : "paused"} />
                {o.is_featured && <StatusBadge status="featured" />}
              </span>
            ),
          },
          { key: "created", header: "Created", render: (o) => fmtDate(o.created_at, false) },
          {
            key: "actions",
            header: "",
            className: "text-right whitespace-nowrap",
            render: (o) => (
              <span className="flex justify-end gap-2">
                {o.is_active && (
                  <FlagForm id={o.id} field="is_featured" value={!o.is_featured} label={o.is_featured ? "Unfeature" : "Feature"} />
                )}
                <FlagForm
                  id={o.id}
                  field="is_active"
                  value={!o.is_active}
                  label={o.is_active ? "Pause" : "Activate"}
                  variant={o.is_active ? "ghost" : "outline"}
                />
              </span>
            ),
          },
        ]}
      />

      <Pagination basePath="/admin/offerings" page={result.page} pageSize={result.pageSize} total={result.total} keep={{ q, filter }} />
    </div>
  );
}
