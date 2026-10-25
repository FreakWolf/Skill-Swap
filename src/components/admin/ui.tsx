import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Small server-safe building blocks shared by the admin pages.

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-gray-600">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "brand",
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "brand" | "orange" | "green" | "amber" | "red" | "gray";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-fg",
    orange: "bg-brand-orange-100 text-brand-orange-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

const statusTones: Record<string, string> = {
  // bookings
  confirmed: "bg-brand-50 text-brand-fg",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  pending: "bg-amber-50 text-amber-700",
  // reports / tickets
  open: "bg-red-50 text-red-700",
  reviewing: "bg-amber-50 text-amber-700",
  resolved: "bg-green-50 text-green-700",
  dismissed: "bg-gray-100 text-gray-600",
  answered: "bg-brand-50 text-brand-fg",
  closed: "bg-gray-100 text-gray-600",
  // purchases
  created: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  // generic
  active: "bg-green-50 text-green-700",
  paused: "bg-gray-100 text-gray-600",
  featured: "bg-brand-orange-50 text-brand-orange-700",
  admin: "bg-brand-50 text-brand-fg",
  suspended: "bg-red-50 text-red-700",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        statusTones[status] ?? "bg-gray-100 text-gray-700",
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

// GET form that keeps the other query params (filters) while searching.
export function SearchForm({
  placeholder,
  defaultValue,
  keep = {},
}: {
  placeholder: string;
  defaultValue?: string;
  keep?: Record<string, string>;
}) {
  return (
    <form method="get" className="flex w-full max-w-sm items-center gap-2">
      {Object.entries(keep).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-9 w-full rounded-md border border-[var(--border)] bg-card pl-9 pr-3 text-sm focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">Search</Button>
    </form>
  );
}

// Link-based filter chips: each chip sets one query param.
export function FilterChips({
  basePath,
  param,
  current,
  options,
  keep = {},
}: {
  basePath: string;
  param: string;
  current: string;
  options: { value: string; label: string }[];
  keep?: Record<string, string>;
}) {
  const qs = (value: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) p.set(k, v);
    if (value && value !== "all") p.set(param, value);
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Link
          key={o.value}
          href={qs(o.value)}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            (current || "all") === o.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  keep = {},
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  keep?: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-gray-600">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:bg-gray-50">
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:bg-gray-50">
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-gray-50/60">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function fmtDate(iso: string | null | undefined, withTime = true) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "UTC",
  }) + (withTime ? " UTC" : "");
}

export function shortId(id: string) {
  return id.slice(0, 8);
}
