"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { submitContact, type ContactState } from "./actions";

export function ContactForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, undefined);

  if (state?.ok) {
    return (
      <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-teal-800">
        <p className="font-semibold">Message sent</p>
        <p className="mt-1 text-sm">Thanks for getting in touch. We usually reply within two working days.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" defaultValue={defaultName} required maxLength={80} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultEmail} required maxLength={200} autoComplete="email" />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required maxLength={140} placeholder="e.g. Question about credits" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={2000} className="min-h-40" />
      </div>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" variant="brand" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
