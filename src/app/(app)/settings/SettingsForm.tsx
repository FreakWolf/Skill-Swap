"use client";

import { useActionState } from "react";
import { updateProfile, type SettingsState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export function SettingsForm({
  defaultName,
  defaultBio,
  defaultLocation,
  defaultLanguages,
}: {
  defaultName: string;
  defaultBio: string;
  defaultLocation: string;
  defaultLanguages: string;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={defaultName} required />
      </div>
      <div>
        <Label htmlFor="bio">About me</Label>
        <Textarea id="bio" name="bio" defaultValue={defaultBio} />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={defaultLocation} />
      </div>
      <div>
        <Label htmlFor="languages">Languages</Label>
        <Input
          id="languages"
          name="languages"
          defaultValue={defaultLanguages}
          placeholder="English, Spanish (comma separated)"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
          Saved.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
