// Single-series vertical bars (e.g. weekly counts). Pure CSS, server-safe.
export function ColumnChart({
  data,
  color = "bg-brand-500",
  unit = "",
}: {
  data: { label: string; count: number }[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-700">{d.count}</span>
          <div className="flex h-full w-full items-end">
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
              role="img"
              aria-label={`${d.label}: ${d.count}${unit}`}
            />
          </div>
          <span className="text-[11px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
