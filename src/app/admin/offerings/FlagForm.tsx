"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { setOfferingFlag, type FlagState } from "./actions";

export function FlagForm({
  id,
  field,
  value,
  label,
  variant = "outline",
}: {
  id: string;
  field: "is_featured" | "is_active";
  value: boolean;
  label: string;
  variant?: "outline" | "ghost" | "danger";
}) {
  const [state, action, pending] = useActionState<FlagState, FormData>(setOfferingFlag, undefined);
  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(value)} />
      <Button type="submit" size="sm" variant={variant} disabled={pending}>
        {pending ? "…" : label}
      </Button>
      {state?.error && <span role="alert" className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
