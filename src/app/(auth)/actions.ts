"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Must match minimumAge in app/(legal)/legal-config.ts.
const MIN_AGE = 18;

// True if someone born on `isoDate` (YYYY-MM-DD) is at least `years` old today.
function isAtLeast(isoDate: string, years: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  const hadBirthday =
    now.getUTCMonth() + 1 > m ||
    (now.getUTCMonth() + 1 === m && now.getUTCDate() >= d);
  if (!hadBirthday) age -= 1;
  return age >= years && age < 120;
}

const signupSchema = z
  .object({
    fullName: z.string().min(1, "Please enter your name").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
    birthdate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter your birthdate")
      .refine((d) => isAtLeast(d, MIN_AGE), {
        message: `You must be at least ${MIN_AGE} to join SkillSwap`,
      }),
    terms: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })
  .refine((d) => d.terms === "on", {
    message: "You must accept the Terms of Service",
    path: ["terms"],
  });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type AuthState = { error?: string; message?: string } | undefined;

// Absolute origin of the current request (e.g. https://swapskills-rust.vercel.app
// or http://localhost:3000), used to build links that go out in auth emails.
async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fullName, email, password, birthdate } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The confirmation email links here; the callback signs the user in and
      // sends them on to onboarding.
      emailRedirectTo: `${await getOrigin()}/auth/callback?next=/onboarding/profile`,
      data: {
        full_name: fullName,
        birthdate,
      },
    },
  });

  if (error) return { error: error.message };

  // With email confirmation ON there's no session yet — tell the user to check
  // their inbox instead of bouncing them to the login page.
  if (!data.session) {
    return {
      message: `We sent a confirmation link to ${email}. Open it to finish creating your account.`,
    };
  }

  // The DB trigger creates the profile + starter credits. Head to onboarding.
  redirect("/onboarding/profile");
}

const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

// Step 1 of password reset: email the user a secure reset link.
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getOrigin()}/auth/callback?next=/reset-password`,
  });

  // Rate limiting is the one error worth showing. Otherwise always give the
  // same response, so this form can't be used to discover who has an account.
  if (error && error.status === 429) {
    return { error: "Too many requests. Please wait a few minutes and try again." };
  }
  return {
    message:
      "If an account exists for that email, we've sent a link to reset your password. Check your inbox (and spam folder).",
  };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

// Step 2 of password reset: the user arrived via the emailed link (so they
// have a session) and sets a new password.
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
