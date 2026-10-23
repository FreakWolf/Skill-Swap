import type { MonthlyFlow } from "@/lib/analytics";

// Grouped monthly bar chart of credits earned (blue) vs spent (amber).
// Pure CSS bars — no charting library.
export function MiniBarChart({ data }: { data: MonthlyFlow[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.earned, d.spent)));

  return (
    <div>
      <div className="flex items-end justify-between gap-3 h-40">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/3 rounded-t bg-brand-500 transition-all"
                style={{ height: `${(d.earned / max) * 100}%` }}
                title={`Earned ${d.earned}`}
                role="img"
                aria-label={`${d.label}: earned ${d.earned}`}
              />
              <div
                className="w-1/3 rounded-t bg-brand-orange-500 transition-all"
                style={{ height: `${(d.spent / max) * 100}%` }}
                title={`Spent ${d.spent}`}
                role="img"
                aria-label={`${d.label}: spent ${d.spent}`}
              />
            </div>
            <span className="text-xs text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Earned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-orange-500" /> Spent
        </span>
      </div>
    </div>
  );
}
