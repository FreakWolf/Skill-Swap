"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    logIn,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="-my-1 mb-0.5 inline-block py-1 text-sm font-medium text-link hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>

      {state?.error && (
        <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>

      <div className="flex items-center gap-3 py-1 text-xs text-subtle">
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span>or continue with</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" disabled title="Coming soon">Google</Button>
        <Button type="button" variant="outline" disabled title="Coming soon">Apple</Button>
      </div>

      <p className="text-center text-sm text-muted">
        New to SwapSkills?{" "}
        <Link href="/signup" className="font-medium text-link hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
