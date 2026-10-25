"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { SKILL_LEVELS, type Offering } from "@/lib/types";
import { updateOffering, type EditState } from "./actions";

export function EditOfferingForm({
  offering,
  skillName,
  skillNames,
}: {
  offering: Offering;
  skillName: string;
  skillNames: string[];
}) {
  const [state, action, pending] = useActionState<EditState, FormData>(updateOffering, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={offering.id} />

      <div>
        <Label htmlFor="skillName">Skill</Label>
        <Input id="skillName" name="skillName" list="skill-options" required defaultValue={skillName} />
        <datalist id="skill-options">
          {skillNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={offering.title} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={offering.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            defaultValue={offering.level}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-card px-3 text-sm capitalize"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" name="duration" type="number" min={15} max={480} step={15} defaultValue={offering.duration_min} />
        </div>
        <div>
          <Label htmlFor="cost">Cost (credits)</Label>
          <Input id="cost" name="cost" type="number" min={0} max={100} defaultValue={offering.credit_cost} />
        </div>
      </div>

      <div>
        <Label htmlFor="mode">Format</Label>
        <select
          id="mode"
          name="mode"
          defaultValue={offering.mode}
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-card px-3 text-sm"
        >
          <option value="virtual">Virtual (video call)</option>
          <option value="in_person">In person</option>
        </select>
      </div>

      <p className="text-xs text-slate-500">
        Changing the duration updates the end time of your open slots. Booked sessions keep their original times.
      </p>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">Saved.</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
