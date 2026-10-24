import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, HeartHandshake, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why SkillSwap exists, how the credit economy works, and how we keep the community safe.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Clock,
    title: "Time is the only currency",
    body: "An hour of your time is worth an hour of anyone else's. One credit always equals one hour, whatever the skill.",
  },
  {
    icon: Scale,
    title: "Fair by design",
    body: "Credits are held when you book and only move when a session is completed. Cancel early and they come straight back.",
  },
  {
    icon: HeartHandshake,
    title: "Everyone has something to teach",
    body: "You do not need a certificate. If you can explain something clearly and patiently, someone wants to learn it.",
  },
  {
    icon: ShieldCheck,
    title: "Safety over growth",
    body: "Blocking, reporting and moderation are built in from day one, and we would rather lose a member than keep a bad one.",
  },
];

const ledger = [
  { event: "You sign up", change: "+3", note: "Starter credits" },
  { event: "You book a 1-hour guitar lesson", change: "−1", note: "Held until the session completes" },
  { event: "You teach a 1-hour Python session", change: "+1", note: "Paid when the learner marks it complete" },
  { event: "A learner cancels before start", change: "+1", note: "Refunded to the learner, not you" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-orange-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">About SkillSwap</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              A marketplace where the price of learning is teaching
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Most people have a skill someone else would pay to learn, and a skill they
              cannot afford to be taught. SkillSwap closes that loop. You teach an hour,
              you earn an hour, you spend it on whatever you want to learn next.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="flex h-full gap-5 rounded-2xl border border-[var(--border)] bg-white p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <v.icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{v.title}</h2>
                  <p className="mt-2 text-gray-600">{v.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-gray-50">
        <div className="mx-auto grid w-full max-w-screen-2xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How the credit economy works</h2>
            <p className="mt-4 text-gray-600">
              Your balance is never a number we edit by hand. It is the sum of a ledger
              that records every credit that ever moved: starter grants, holds, refunds,
              earnings and purchases. Every move happens inside one database transaction,
              so a credit can never be spent twice or disappear.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700">
              <li className="flex gap-3"><span className="font-semibold text-brand-700">Book</span> The cost is held from your balance immediately.</li>
              <li className="flex gap-3"><span className="font-semibold text-brand-700">Complete</span> The held credits move to the teacher.</li>
              <li className="flex gap-3"><span className="font-semibold text-brand-700">Cancel</span> Before the start time, the hold is refunded in full.</li>
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border)] px-5 py-3 text-sm font-semibold text-gray-900">Example ledger</div>
              <ul className="divide-y divide-[var(--border)]">
                {ledger.map((row) => (
                  <li key={row.event} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.event}</p>
                      <p className="text-xs text-gray-500">{row.note}</p>
                    </div>
                    <span className={row.change.startsWith("+") ? "font-semibold text-green-700" : "font-semibold text-gray-900"}>
                      {row.change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Keeping the community safe</h2>
          <p className="mt-4 text-gray-600">
            Every member can block anyone in a click, and blocked members cannot message
            or book each other. Every profile, conversation and session has a Report
            button. Reports go to a moderation queue where the team can review, contact
            the people involved and suspend accounts when needed. Payments are handled by
            Razorpay, and card details never touch our servers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button variant="brand" size="lg" className="w-full sm:w-auto">
                Join the community <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Read the FAQ</Button>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
