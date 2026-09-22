"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logIn, type AuthState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    logIn,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>

      <div className="relative py-2 text-center text-xs text-slate-400">
        <span className="bg-white px-2">or continue with</span>
        <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-[var(--border)]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" disabled title="Coming soon">Google</Button>
        <Button type="button" variant="outline" disabled title="Coming soon">Apple</Button>
      </div>

      <p className="text-center text-sm text-slate-600">
        New to SkillSwap?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
