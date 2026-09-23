"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SearchBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const activeCategory = params.get("category") ?? "All";
  const view = params.get("view") === "people" ? "people" : "skills";

  function apply(next: { q?: string; category?: string; view?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category && next.category !== "All") sp.set("category", next.category);
      else sp.delete("category");
    }
    if (next.view !== undefined) {
      if (next.view === "people") sp.set("view", "people");
      else sp.delete("view");
    }
    startTransition(() => router.push(`/marketplace?${sp.toString()}`));
  }

  return (
    <div className="space-y-4">
      {/* View tabs */}
      <div className="inline-flex rounded-lg border border-[var(--border)] bg-white p-1">
        {(["skills", "people"] as const).map((v) => (
          <button
            key={v}
            onClick={() => apply({ view: v })}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              view === v
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {v === "skills" ? "Skills" : "People"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex gap-2"
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            view === "people"
              ? "Search people by name or skill…"
              : "Search skills, titles, or teachers…"
          }
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "…" : "Search"}
        </Button>
      </form>

      {/* Category filters only apply to the Skills view. */}
      {view === "skills" && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => apply({ category: c })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                activeCategory === c
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
