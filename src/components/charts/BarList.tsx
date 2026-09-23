import type { SkillCount } from "@/lib/analytics";

// Horizontal ranked bars for top skills. Pure CSS.
export function BarList({ items }: { items: SkillCount[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-700">{it.name}</span>
            <span className="font-medium text-gray-500">{it.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
