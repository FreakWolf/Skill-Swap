import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

const steps = [
  { title: "Teach what you know", body: "Share a skill you're good at and earn credits for every session." },
  { title: "Earn credits", body: "1 credit = 1 hour. No cash — your time is the currency." },
  { title: "Learn anything", body: "Spend credits to book sessions with people who teach what you want to learn." },
];

export default function Home() {
  return (
    <main className="flex-1 bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo className="text-2xl" />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="brand">Sign up</Button>
          </Link>
        </nav>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center sm:pt-24">
          <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-blue-600">
            Trade skills, not cash
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Learn anything by teaching what you know
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            SkillSwap is a community where you earn credits by teaching your
            skills, then spend them to learn from others. Everyone teaches.
            Everyone learns.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button variant="brand" size="lg">Get started free</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">I have an account</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 text-left sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-[var(--border)] bg-white p-6 transition-shadow hover:shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-semibold text-blue-600">
                {i + 1}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
