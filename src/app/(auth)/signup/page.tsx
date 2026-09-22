import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo className="text-3xl" />
          </Link>
          <p className="mt-3 text-slate-600">
            Join the community. Get 3 starter credits free.
          </p>
        </div>
        <Card className="p-6 shadow-lg sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-neutral-200 p-1 text-sm font-medium">
            <Link href="/login" className="rounded-full py-2 text-center text-slate-600 hover:text-black">
              Log in
            </Link>
            <span className="rounded-full bg-white py-2 text-center text-black shadow-sm">
              Sign up
            </span>
          </div>
          <SignupForm />
        </Card>
      </div>
    </div>
  );
}
