import type { SkillCount } from "@/lib/analytics";

// Horizontal ranked bars for top skills. Pure CSS.
export function BarList({ items }: { items: SkillCount[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground">{it.name}</span>
            <span className="font-semibold text-muted">{it.count}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-input">
            <div
              className="bg-gradient-primary animate-grow-x h-full rounded-full"
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
