import { AuthShell, AuthTabs } from "@/components/site/AuthShell";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <AuthShell subtitle="Join the community. Get 3 starter credits free.">
      <h1 className="sr-only">Create your SkillSwap account</h1>
      <AuthTabs active="signup" />
      <SignupForm />
    </AuthShell>
  );
}

export const metadata = {
  title: "Sign up",
  description: "Join SkillSwap free and get 3 starter credits. Teach what you know, learn what you don't.",
  alternates: { canonical: "/signup" },
};
