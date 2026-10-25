"use client";

import { useActionState, useState } from "react";
import { saveSkills, type OnboardingState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import { SKILL_LEVELS, type SkillDirection, type SkillLevel } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Selection {
  name: string;
  direction: SkillDirection;
  level: SkillLevel;
}

export function SkillsForm({
  catalog,
}: {
  catalog: { name: string; category: string }[];
}) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [custom, setCustom] = useState("");
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    saveSkills,
    undefined,
  );

  function has(name: string) {
    return selections.some((s) => s.name.toLowerCase() === name.toLowerCase());
  }

  function add(name: string, direction: SkillDirection) {
    const trimmed = name.trim();
    if (!trimmed || has(trimmed)) return;
    setSelections((prev) => [
      ...prev,
      { name: trimmed, direction, level: "beginner" },
    ]);
  }

  function remove(name: string) {
    setSelections((prev) => prev.filter((s) => s.name !== name));
  }

  function update(name: string, patch: Partial<Selection>) {
    setSelections((prev) =>
      prev.map((s) => (s.name === name ? { ...s, ...patch } : s)),
    );
  }

  const categories = Array.from(new Set(catalog.map((c) => c.category)));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="selections" value={JSON.stringify(selections)} />

      {/* Catalog */}
      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="mb-2 text-sm font-semibold text-subtle">{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {catalog
                .filter((c) => c.category === cat)
                .map((c) => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => add(c.name, "teach")}
                    disabled={has(c.name)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-[color,border-color,transform] duration-150 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                      has(c.name)
                        ? "cursor-default border-transparent bg-input text-subtle"
                        : "border-border-strong bg-card-solid text-foreground hover:border-link hover:text-link",
                    )}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom skill */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-subtle">
          Don&apos;t see it? Add your own
        </h3>
        <div className="flex gap-2">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Watercolor calligraphy"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(custom, "teach");
                setCustom("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              add(custom, "teach");
              setCustom("");
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Selected */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-subtle">
          Your skills ({selections.length})
        </h3>
        {selections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-strong p-4 text-sm text-muted">
            Tap skills above to add them. For each one, choose whether you can
            teach it or want to learn it, and set your level.
          </p>
        ) : (
          <ul className="space-y-2">
            {selections.map((s) => (
              <li
                key={s.name}
                className="animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card-solid p-3 shadow-soft"
              >
                <span className="font-medium text-foreground">{s.name}</span>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {/* teach / learn toggle */}
                  <div className="flex overflow-hidden rounded-full border border-border-strong">
                    {(["teach", "learn"] as SkillDirection[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update(s.name, { direction: d })}
                        className={cn(
                          "px-3 py-1 text-xs font-medium capitalize",
                          s.direction === d
                            ? "bg-gradient-primary text-white"
                            : "bg-card-solid text-muted hover:bg-brand-soft",
                        )}
                      >
                        {d === "teach" ? "I teach" : "I want to learn"}
                      </button>
                    ))}
                  </div>

                  {/* level */}
                  <select
                    value={s.level}
                    onChange={(e) =>
                      update(s.name, { level: e.target.value as SkillLevel })
                    }
                    className="h-8 rounded-full border border-border-strong bg-input px-2.5 text-xs capitalize text-foreground"
                  >
                    {SKILL_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => remove(s.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-subtle hover:bg-danger-soft hover:text-danger-fg"
                    aria-label={`Remove ${s.name}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state?.error && (
        <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-xs text-subtle">
          <Badge tone="brand">Teach = earn credits</Badge>
          <Badge tone="accent">Learn = spend credits</Badge>
        </div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Finishing…" : "Finish setup"}
        </Button>
      </div>
    </form>
  );
}
