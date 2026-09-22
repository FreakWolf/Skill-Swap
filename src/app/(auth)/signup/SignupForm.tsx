"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

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
        <Input id="birthdate" name="birthdate" type="date" />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 rounded border-slate-300" />
        <span>
          I agree to the{" "}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </span>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
