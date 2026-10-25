import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import {
  DataTable,
  FilterChips,
  PageHeader,
  Pagination,
  SearchForm,
  StatusBadge,
  fmtDate,
} from "@/components/admin/ui";
import { listUsers, type UserFilter } from "@/lib/admin/users";
import { pageFrom, param, type SearchParams } from "@/lib/admin/shared";
import type { Profile } from "@/lib/types";

export const metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = param(sp, "q");
  const filter = (param(sp, "filter") || "all") as UserFilter;
  const page = pageFrom(sp);
  const result = await listUsers({ q, filter, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${result.total} member${result.total === 1 ? "" : "s"}`}>
        <SearchForm placeholder="Search by name" defaultValue={q} keep={{ filter }} />
      </PageHeader>

      <FilterChips
        basePath="/admin/users"
        param="filter"
        current={filter}
        keep={{ q }}
        options={[
          { value: "all", label: "All" },
          { value: "admins", label: "Admins" },
          { value: "suspended", label: "Suspended" },
        ]}
      />

      <DataTable<Profile>
        rows={result.rows}
        empty="No members match."
        columns={[
          {
            key: "name",
            header: "Member",
            render: (u) => (
              <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                <Avatar name={u.full_name} url={u.avatar_url} size={32} />
                <span>
                  <span className="block font-medium text-gray-900">{u.full_name || "Unnamed"}</span>
                  <span className="block text-xs text-gray-500">{u.location || "—"}</span>
                </span>
              </Link>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (u) => (
              <span className="flex flex-wrap gap-1">
                {u.is_admin && <StatusBadge status="admin" />}
                {u.suspended_at ? <StatusBadge status="suspended" /> : <StatusBadge status="active" />}
                {!u.onboarded && <StatusBadge status="pending" label="not onboarded" />}
              </span>
            ),
          },
          { key: "joined", header: "Joined", render: (u) => fmtDate(u.created_at, false) },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (u) => (
              <Link href={`/admin/users/${u.id}`} className="text-sm font-medium text-brand-fg hover:underline">
                Manage
              </Link>
            ),
          },
        ]}
      />

      <Pagination basePath="/admin/users" page={result.page} pageSize={result.pageSize} total={result.total} keep={{ q, filter }} />
    </div>
  );
}
