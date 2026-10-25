import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Coins,
  CreditCard,
  Flag,
  GraduationCap,
  Lock,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CREDIT_PACKS, bonusCredits, formatPrice } from "@/lib/credit-packs";
import { CATEGORIES, FAQS } from "./content";

function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-fg">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg text-muted">{children}</p>}
    </Reveal>
  );
}

const section = "scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24";

/* ---------------- How it works ---------------- */

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: PlusCircle,
    title: "Offer a skill",
    body: "List something you can teach. Pick the session length and its credit cost. The guide is 1 credit = 1 hour.",
  },
  {
    icon: GraduationCap,
    title: "Teach & earn credits",
    body: "Run the session. When it's marked complete, the learner's credits move to you.",
  },
  {
    icon: Coins,
    title: "Spend credits to learn",
    body: "Browse the marketplace and book someone who teaches what you want. You start with 3 free credits.",
  },
  {
    icon: MessageSquare,
    title: "Chat & book",
    body: "Message each other, agree the details and share a Zoom or Meet link, or a place to meet.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" id="how-it-works" className={section}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="how-heading" eyebrow="How it works" title="Your time is the currency">
          Everyone teaches. Everyone learns. Credits keep it fair.
        </SectionHeading>
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i} className="glass lift relative rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <span className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-soft">
                  {i + 1}
                </span>
                <s.icon className="h-6 w-6 text-link" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Categories ---------------- */

export function Categories() {
  return (
    <section aria-labelledby="categories-heading" id="categories" className={section}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="categories-heading" eyebrow="Skills" title="Something for every curiosity">
          Start with the skills below, or add your own.
        </SectionHeading>
        <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i} className="glass lift rounded-3xl p-4 sm:p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-fg">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-bold tracking-tight text-foreground">{c.name}</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${c.name} skills`}>
                {c.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-border bg-card-solid px-2.5 py-0.5 text-xs font-medium text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-center text-muted">
          Don&apos;t see yours? Add any skill when you sign up.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Features (bento) ---------------- */

function Tile({
  icon: Icon,
  title,
  children,
  className,
  delay,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
  delay: number;
  badge?: string;
}) {
  return (
    <Reveal as="li" delay={delay} className={cn("glass lift flex flex-col rounded-3xl p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-fg">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        {badge && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-fg">{badge}</span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-muted">{children}</div>
    </Reveal>
  );
}

export function FeatureBento() {
  return (
    <section aria-labelledby="features-heading" id="features" className={section}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="features-heading" eyebrow="Features" title="Everything you need to swap skills">
          Simple tools that keep learning fair, friendly and safe.
        </SectionHeading>
        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          <Tile icon={Coins} title="A fair credit economy" delay={0} className="lg:col-span-2">
            <p>
              1 credit = 1 hour is the guide. Credits are held when you book and go to the teacher
              when the session is completed. If a booking is cancelled, they go back to the learner.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-hidden>
              <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-soft-fg">Book</span>
              <span className="text-subtle">→</span>
              <span className="rounded-full bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning-fg">Credits held</span>
              <span className="text-subtle">→</span>
              <span className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success-fg">Completed: teacher paid</span>
            </div>
          </Tile>
          <Tile icon={MessageSquare} title="Real-time chat" delay={1}>
            Message teachers and learners instantly to plan sessions and share links.
          </Tile>
          <Tile icon={CalendarDays} title="Scheduling made easy" delay={2}>
            Teachers publish availability slots. Learners pick a time, and everything lands in your calendar.
          </Tile>
          <Tile icon={Star} title="Ratings & reviews" delay={3}>
            After a session, leave a star rating and a short review to help others choose.
          </Tile>
          <Tile icon={ShieldCheck} title="Safety built in" delay={4}>
            Block or report anyone in a tap. 18+ members only, and your email and birthdate stay private.
          </Tile>
          <Tile
            icon={Smartphone}
            title="Works great on your phone"
            delay={5}
            badge="Mobile app coming soon"
            className="lg:col-span-3"
          >
            SwapSkills is built mobile-first and runs in any modern browser. Add it to your home
            screen for an app-like feel.
          </Tile>
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Audience ---------------- */

const AUDIENCE = [
  {
    title: "For learners",
    icon: Sparkles,
    tone: "bg-accent-soft text-accent-fg",
    items: [
      "Start with 3 free credits",
      "Find people who teach what you want to learn",
      "Book a time that suits you",
      "Rate your session afterwards",
    ],
  },
  {
    title: "For teachers",
    icon: BadgeCheck,
    tone: "bg-brand-soft text-brand-soft-fg",
    items: [
      "Earn credits for every completed session",
      "Set your own session length and credit cost",
      "Publish availability slots",
      "Build a profile with reviews",
    ],
  },
];

export function Audience() {
  return (
    <section aria-labelledby="audience-heading" className={section}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="audience-heading" eyebrow="Two sides, one community" title="Learn and teach, both at once" />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {AUDIENCE.map((a, i) => (
            <Reveal key={a.title} delay={i} className="glass lift rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", a.tone)}>
                  <a.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{a.title}</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {a.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-fg">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing teaser ---------------- */

export function PricingTeaser() {
  return (
    <section aria-labelledby="pricing-heading" id="pricing" className={section}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="pricing-heading" eyebrow="Credits" title="Teach for free. Top up if you like.">
          Teach to earn credits for free. Need more? Top up anytime.
        </SectionHeading>
        <ul className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
          {CREDIT_PACKS.map((p, i) => {
            const bonus = bonusCredits(p);
            const popular = p.tag === "Popular";
            return (
              <Reveal
                as="li"
                key={p.id}
                delay={i}
                className={cn(
                  "glass lift relative flex flex-col rounded-3xl p-6 text-center",
                  popular && "ring-2 ring-link",
                )}
              >
                {p.tag && (
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold",
                      popular ? "bg-gradient-primary text-white" : "bg-gradient-accent text-ink",
                    )}
                  >
                    {p.tag}
                  </span>
                )}
                <p className="flex items-center justify-center gap-2 text-4xl font-extrabold tracking-tight text-foreground">
                  <Coins className="h-7 w-7 text-accent-fg" aria-hidden />
                  {p.credits}
                </p>
                <p className="text-sm text-muted">credits</p>
                <p className="mt-4 text-2xl font-bold text-foreground">{formatPrice(p.pricePaise)}</p>
                <p className="mt-1 min-h-5 text-sm font-medium text-success-fg">
                  {bonus > 0 ? `+${bonus} bonus credits` : "\u00a0"}
                </p>
              </Reveal>
            );
          })}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          No cash changes hands between members. Prices include taxes. Credits can&apos;t be
          withdrawn or exchanged for money.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/signup" size="lg">
            Get 3 free credits
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Safety & trust ---------------- */

export function Safety() {
  const items: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
    { icon: UserCheck, title: "18+ community", body: "Every member confirms they're 18 or older when they sign up." },
    { icon: Flag, title: "Block & report", body: "Block someone to stop all contact, or report them to us from their profile or a chat." },
    {
      icon: Lock,
      title: "Your privacy",
      body: (
        <>
          Your email and birthdate are never shown on your profile. Read our{" "}
          <Link href="/privacy" className="font-semibold text-link underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </>
      ),
    },
    {
      icon: CreditCard,
      title: "Secure payments",
      body: "Credit packs are paid through Razorpay. We never see your card, UPI or bank details.",
    },
  ];
  return (
    <section aria-labelledby="safety-heading" className={section}>
      <div className="glass mx-auto max-w-6xl rounded-[2rem] p-6 sm:p-10">
        <SectionHeading id="safety-heading" eyebrow="Safety & trust" title="A friendly place to learn" />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success-fg">
                <it.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-bold tracking-tight text-foreground">{it.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{it.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" id="faq" className={section}>
      <div className="mx-auto max-w-3xl">
        <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="glass group rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <h3 className="text-base font-semibold text-foreground">{f.q}</h3>
                <ChevronDown
                  className="faq-chevron h-5 w-5 shrink-0 text-muted transition-transform duration-200"
                  aria-hidden
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="px-4 pb-20 sm:px-6">
      <Reveal className="bg-gradient-hero relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-lift sm:px-12 sm:py-16">
        <div aria-hidden className="blob -right-16 -top-16 h-64 w-64 bg-brand-orange-500/30" />
        <div aria-hidden className="blob -bottom-20 -left-10 h-56 w-56 bg-brand-400/40 [animation-delay:-7s]" />
        <h2 id="cta-heading" className="relative text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-5xl">
          Ready to swap your first skill?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-white">
          Join free, get 3 credits, and book your first session today.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup" variant="onBrandSolid" size="lg">
            Get started free
          </ButtonLink>
          <ButtonLink href="/login" variant="onBrandGhost" size="lg">
            Log in
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
