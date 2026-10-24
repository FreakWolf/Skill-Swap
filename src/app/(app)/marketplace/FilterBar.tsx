"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { SKILL_LEVELS } from "@/lib/types";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "cost_asc", label: "Credits: low to high" },
  { value: "cost_desc", label: "Credits: high to low" },
  { value: "shortest", label: "Shortest session" },
  { value: "longest", label: "Longest session" },
];

const selectClass =
  "h-9 rounded-md border border-[var(--border)] bg-white px-2.5 text-sm capitalize text-slate-700 focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30";

// Level / format / max credits / sort, all kept in the URL so results are
// shareable and the back button works.
export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const level = params.get("level") ?? "all";
  const mode = params.get("mode") ?? "all";
  const maxCost = params.get("max") ?? "";
  const sort = params.get("sort") ?? "newest";
  const activeCount = [level !== "all", mode !== "all", maxCost !== "", sort !== "newest"].filter(Boolean).length;

  function set(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value || value === "all" || (key === "sort" && value === "newest")) sp.delete(key);
    else sp.set(key, value);
    startTransition(() => router.push(`/marketplace?${sp.toString()}`));
  }

  function clear() {
    const sp = new URLSearchParams(params.toString());
    for (const k of ["level", "mode", "max", "sort"]) sp.delete(k);
    startTransition(() => router.push(`/marketplace?${sp.toString()}`));
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2", pending && "opacity-70")}>
      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
      </span>

      <label className="sr-only" htmlFor="filter-level">Level</label>
      <select id="filter-level" value={level} onChange={(e) => set("level", e.target.value)} className={selectClass}>
        <option value="all">Any level</option>
        {SKILL_LEVELS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-mode">Format</label>
      <select id="filter-mode" value={mode} onChange={(e) => set("mode", e.target.value)} className={selectClass}>
        <option value="all">Any format</option>
        <option value="virtual">Virtual</option>
        <option value="in_person">In person</option>
      </select>

      <label className="sr-only" htmlFor="filter-max">Max credits</label>
      <select id="filter-max" value={maxCost} onChange={(e) => set("max", e.target.value)} className={selectClass}>
        <option value="">Any cost</option>
        {[0, 1, 2, 3, 5, 10].map((n) => (
          <option key={n} value={String(n)}>{n === 0 ? "Free only" : `Up to ${n} credit${n === 1 ? "" : "s"}`}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-sort">Sort</label>
      <select id="filter-sort" value={sort} onChange={(e) => set("sort", e.target.value)} className={cn(selectClass, "ml-auto normal-case")}>
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>Sort: {s.label}</option>
        ))}
      </select>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-gray-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden /> Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
