"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { createSkill, deleteSkill, updateSkill, type SkillState } from "./actions";

function Feedback({ state }: { state: SkillState }) {
  if (state?.error) return <span role="alert" className="text-xs text-red-600">{state.error}</span>;
  if (state?.ok) return <span role="status" className="text-xs text-teal-700">Saved.</span>;
  return null;
}

export function NewSkillForm({ categories }: { categories: string[] }) {
  const [state, action, pending] = useActionState<SkillState, FormData>(createSkill, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <Label htmlFor="new-name">Skill name</Label>
        <Input id="new-name" name="name" required maxLength={60} className="h-10" placeholder="e.g. Baking" />
      </div>
      <div className="min-w-40">
        <Label htmlFor="new-category">Category</Label>
        <Input id="new-category" name="category" list="skill-categories" required maxLength={40} className="h-10" placeholder="e.g. Lifestyle" />
        <datalist id="skill-categories">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <Button type="submit" variant="brand" disabled={pending} className="h-10">
        {pending ? "Adding…" : "Add skill"}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function SkillRowActions({
  id,
  name,
  category,
  isCustom,
  inUse,
}: {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
  inUse: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState<SkillState, FormData>(updateSkill, undefined);
  const [deleteState, deleteAction, deleting] = useActionState<SkillState, FormData>(deleteSkill, undefined);

  if (editing) {
    return (
      <form action={updateAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <Input name="name" defaultValue={name} required maxLength={60} className="h-9 w-40" aria-label="Skill name" />
        <Input name="category" defaultValue={category} required maxLength={40} list="skill-categories" className="h-9 w-32" aria-label="Category" />
        {isCustom && (
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" name="is_custom" value="false" /> Promote to catalogue
          </label>
        )}
        <Button type="submit" size="sm" variant="brand" disabled={updating}>{updating ? "Saving…" : "Save"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)} aria-label="Cancel">
          <X className="h-4 w-4" />
        </Button>
        <Feedback state={updateState} />
      </form>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" aria-hidden /> Edit
      </Button>
      {!inUse && (
        <form action={deleteAction} className="inline-flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <ConfirmButton confirm={`Delete "${name}"? This cannot be undone.`} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={deleting}>
            <Trash2 className="h-4 w-4" aria-hidden /> Delete
          </ConfirmButton>
          <Feedback state={deleteState} />
        </form>
      )}
    </div>
  );
}
