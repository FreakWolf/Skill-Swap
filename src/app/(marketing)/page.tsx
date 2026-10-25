import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  Coins,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/marketing/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  description: SITE.description,
  alternates: { canonical: "/" },
};

const steps = [
  {
    title: "Teach what you know",
    body: "Publish an offering for any skill you can teach, set your time slots and the credit cost.",
  },
  {
    title: "Earn credits",
    body: "Every completed session pays you the credits the learner held. You set the credit price of each session you teach.",
  },
  {
    title: "Learn anything",
    body: "Spend credits to book sessions with members who teach what you want to learn next.",
  },
];

const features = [
  {
    icon: Coins,
    title: "A fair credit economy",
    body: "Credits are held when you book and released when the session completes. Cancel before it starts and they come straight back.",
  },
  {
    icon: CalendarCheck,
    title: "Built-in scheduling",
    body: "Teachers publish open slots, learners pick one, and both see it on their calendar in their own time zone.",
  },
  {
    icon: MessageSquare,
    title: "Direct messaging",
    body: "Agree on the details, share a video link or ask a question before you book. Conversations update live.",
  },
  {
    icon: Star,
    title: "Reviews and reputation",
    body: "Rate each other after every session. Ratings show on profiles and in the marketplace so good teachers stand out.",
  },
  {
    icon: ShieldCheck,
    title: "Safety first",
    body: "Block anyone in one click, report problems from any page, and let moderators handle the rest.",
  },
  {
    icon: Sparkles,
    title: "Start with free credits",
    body: "Every new member gets 3 credits on signup. Book your first sessions before you ever teach one.",
  },
];

const skills = [
  "JavaScript", "Guitar", "Spanish", "Yoga", "Public speaking", "Figma", "Python",
  "Photography", "Chess", "Cooking", "French", "UI/UX design", "Piano", "SQL",
  "Digital marketing", "Singing", "Watercolour", "Interview prep", "React", "English conversation",
];

// Illustrative examples of how a swap can balance out; not member quotes.
const swaps = [
  { teach: "Guitar basics", teachSessions: 3, learn: "Conversational Spanish", learnSessions: 3 },
  { teach: "Python tutoring", teachSessions: 2, learn: "Figma feedback", learnSessions: 2 },
  { teach: "Morning yoga", teachSessions: 4, learn: "Interview prep", learnSessions: 4 },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-background to-brand-orange-50">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-blob absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-200/60 blur-3xl" />
          <div className="animate-blob delay-300 absolute -right-20 top-40 h-80 w-80 rounded-full bg-brand-orange-200/60 blur-3xl" />
          <div className="animate-blob delay-500 absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-brand-100/70 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-screen-2xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="text-center lg:text-left">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-card/80 px-3 py-1 text-sm font-medium text-brand-fg">
              <Sparkles className="h-4 w-4" aria-hidden />
              {SITE.tagline}
            </span>
            <h1 className="animate-fade-up delay-100 mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Learn anything by{" "}
              <span className="text-gradient-brand animate-shimmer">teaching</span>{" "}
              what you know
            </h1>
            <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-xl text-lg text-gray-600 lg:mx-0">
              SkillSwap is a community where you earn credits by teaching your
              skills, then spend them to learn from others. Everyone teaches.
              Everyone learns. No cash between members.
            </p>
            <div className="animate-fade-up delay-300 mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Button href="/signup" variant="brand" size="lg" className="w-full sm:w-auto">
                  Get started free
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              <Button href="/about" size="lg" variant="outline" className="w-full sm:w-auto">
                  How it works
                </Button>
            </div>
            <p className="animate-fade-up delay-500 mt-4 text-sm text-gray-500">
              3 free credits on signup. No card required.
            </p>
          </div>

          <div className="animate-fade-up delay-200 relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="animate-float">
              <Logo variant="illustration" height={300} decorative priority className="mx-auto max-w-full" />
            </div>
            <div className="absolute -left-2 top-6 hidden rounded-xl border border-[var(--border)] bg-card/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
              <p className="text-xs text-gray-500">Session completed</p>
              <p className="text-sm font-semibold text-gray-900">+1 credit earned</p>
            </div>
            <div className="absolute -right-2 bottom-4 hidden rounded-xl border border-[var(--border)] bg-card/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
              <p className="text-xs text-gray-500">Booked for Saturday</p>
              <p className="text-sm font-semibold text-gray-900">Guitar basics · 1 hour</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[var(--border)] bg-card">
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-10">
          {[
            { value: "3", label: "free credits to start" },
            { value: "8", label: "skill categories, from code to cooking" },
            { value: "1+", label: "credits per session, set by the teacher" },
            { value: "0", label: "cash between members" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <p className="text-3xl font-bold text-brand-fg sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-gray-600">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-screen-2xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How it works</h2>
          <p className="mt-4 text-gray-600">Three steps. No subscriptions, no payouts, just time traded for time.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <div className="group h-full rounded-2xl border border-[var(--border)] bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-fg transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  {i + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Skills marquee */}
      <section className="overflow-hidden border-y border-[var(--border)] bg-gray-50 py-8">
        <p className="mb-5 text-center text-sm font-medium uppercase tracking-wider text-gray-500">
          Skills people are swapping
        </p>
        <div className="flex w-max gap-3 px-3 animate-marquee">
          {[...skills, ...skills].map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="whitespace-nowrap rounded-full border border-[var(--border)] bg-card px-4 py-2 text-sm font-medium text-slate-700"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to swap skills</h2>
          <p className="mt-4 text-gray-600">From discovery to review, the whole exchange lives in one place.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="h-full rounded-2xl border border-[var(--border)] bg-card p-6 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange-50 text-brand-orange-700">
                  <f.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Example swaps */}
      <section className="bg-gradient-to-b from-background to-brand-50/60 py-20">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trade time, not money</h2>
            <p className="mt-4 text-gray-600">Three illustrative swaps, each priced at one credit per session.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {swaps.map((sw, i) => (
              <Reveal key={sw.teach} delay={i * 120}>
                <div className="h-full rounded-2xl border border-[var(--border)] bg-card p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Example swap</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 rounded-xl bg-brand-50 p-4">
                      <p className="text-xs text-brand-fg">Teach</p>
                      <p className="font-semibold text-gray-900">{sw.teach}</p>
                      <p className="text-sm text-gray-600">{sw.teachSessions} sessions · +{sw.teachSessions} credits</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                    <div className="flex-1 rounded-xl bg-brand-orange-50 p-4">
                      <p className="text-xs text-brand-orange-700">Learn</p>
                      <p className="font-semibold text-gray-900">{sw.learn}</p>
                      <p className="text-sm text-gray-600">{sw.learnSessions} sessions · −{sw.learnSessions} credits</p>
                    </div>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" aria-hidden /> Net cost: 0 credits, 0 rupees
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-6 py-14 text-center text-white sm:px-12">
            <div aria-hidden className="animate-blob absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-orange-400/40 blur-3xl" />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to make your first swap?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-brand-100">
              Create a profile, list one skill you can teach, and book your first session with your free credits.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/signup" variant="onBrandSolid" size="lg" className="w-full sm:w-auto">Create free account</Button>
              <Button href="/pricing" variant="onBrandGhost" size="lg" className="w-full sm:w-auto">See pricing</Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
