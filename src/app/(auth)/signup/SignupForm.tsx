"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { TermsConsent } from "@/components/legal/TermsConsent";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required placeholder="Alex Rivera" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="8+ characters" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required placeholder="Re-enter" />
        </div>
      </div>
      <div>
        <Label htmlFor="birthdate">Birthdate</Label>
        <Input id="birthdate" name="birthdate" type="date" required />
        <p className="mt-1 text-xs text-subtle">You must be 18 or older to join.</p>
      </div>

      <TermsConsent />

      {state?.message && (
        <p className="rounded-2xl border border-info-fg/25 bg-info-soft px-4 py-3 text-sm text-info-fg">
          {state.message}
        </p>
      )}

      {state?.error && (
        <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-link hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
