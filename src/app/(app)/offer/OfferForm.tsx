"use client";

import { useActionState, useState } from "react";
import { createOffering, type OfferState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { SKILL_LEVELS } from "@/lib/types";

export function OfferForm({ skillNames }: { skillNames: string[] }) {
  const [slots, setSlots] = useState<string[]>([]);
  const [slotInput, setSlotInput] = useState("");
  const [state, action, pending] = useActionState<OfferState, FormData>(
    createOffering,
    undefined,
  );

  function addSlot() {
    if (!slotInput) return;
    if (slots.includes(slotInput)) return;
    setSlots((prev) => [...prev, slotInput].sort());
    setSlotInput("");
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slots" value={JSON.stringify(slots)} />

      <div>
        <Label htmlFor="skillName">Skill</Label>
        <Input
          id="skillName"
          name="skillName"
          list="skill-options"
          required
          placeholder="Start typing… e.g. Guitar"
        />
        <datalist id="skill-options">
          {skillNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Beginner acoustic guitar — your first song"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What will the learner get out of this session?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue="beginner"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm capitalize"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" name="duration" type="number" min={15} max={480} step={15} defaultValue={60} />
        </div>
        <div>
          <Label htmlFor="cost">Cost (credits)</Label>
          <Input id="cost" name="cost" type="number" min={0} max={100} defaultValue={1} />
        </div>
      </div>

      <div>
        <Label htmlFor="mode">Format</Label>
        <select
          id="mode"
          name="mode"
          defaultValue="virtual"
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
        >
          <option value="virtual">Virtual (video call)</option>
          <option value="in_person">In person</option>
        </select>
      </div>

      {/* Availability slots */}
      <div>
        <Label>Available time slots</Label>
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={slotInput}
            onChange={(e) => setSlotInput(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addSlot}>
            Add slot
          </Button>
        </div>
        {slots.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {slots.map((s) => (
              <li
                key={s}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
              >
                {new Date(s).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                <button
                  type="button"
                  onClick={() => setSlots((p) => p.filter((x) => x !== s))}
                  className="text-slate-400 hover:text-red-600"
                  aria-label="Remove slot"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Add one or more times learners can book. You can add more later.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Publishing…" : "Publish offering"}
        </Button>
      </div>
    </form>
  );
}
