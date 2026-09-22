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

  function apply(next: { q?: string; category?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category && next.category !== "All") sp.set("category", next.category);
      else sp.delete("category");
    }
    startTransition(() => router.push(`/marketplace?${sp.toString()}`));
  }

  return (
    <div className="space-y-4">
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
          placeholder="Search skills, titles, or teachers…"
          className="h-11"
        />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "…" : "Search"}
        </Button>
      </form>

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
    </div>
  );
}
