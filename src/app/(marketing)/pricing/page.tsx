import Link from "next/link";
import type { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/marketing/Reveal";
import { FaqList } from "@/components/marketing/FaqList";
import { CREDIT_PACKS, formatPrice, savingsPercent } from "@/lib/credit-packs";
import { FAQ_GROUPS } from "@/lib/marketing/faq";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SkillSwap is free to join with 3 starter credits. Earn more by teaching, or buy a credit pack when you want to learn faster.",
  alternates: { canonical: "/pricing" },
};

const included = [
  "3 starter credits on signup",
  "Unlimited offerings and time slots",
  "Marketplace, calendar and messaging",
  "Reviews, blocking and reporting",
  "Credits never expire",
];

export default async function PricingPage() {
  const session = await getSessionUser();
  const buyHref = session ? "/credits" : "/signup";
  const creditsFaq = FAQ_GROUPS.find((g) => g.id === "credits");

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-orange-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-20 text-center sm:px-6 lg:px-10">
          <div className="animate-fade-up mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Pricing</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Free to join. Pay with your time.
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              There is no subscription. You earn credits by teaching and spend them
              to learn. If you want to learn faster than you teach, buy a pack.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
          <Reveal>
            <div className="h-full rounded-2xl border-2 border-brand-600 bg-white p-8">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Membership
              </span>
              <p className="mt-5 text-5xl font-bold text-gray-900">₹0</p>
              <p className="mt-1 text-gray-600">forever, for every member</p>
              <ul className="mt-6 space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={session ? "/dashboard" : "/signup"} className="mt-8 block">
                <Button variant="brand" size="lg" className="w-full">
                  {session ? "Go to dashboard" : "Create free account"}
                </Button>
              </Link>
            </div>
          </Reveal>

          <div>
            <Reveal delay={100}>
              <h2 className="text-2xl font-bold text-gray-900">Credit packs</h2>
              <p className="mt-2 text-gray-600">
                Optional. One credit books one hour. Larger packs cost less per credit.
              </p>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {CREDIT_PACKS.map((pack, i) => {
                const saving = savingsPercent(pack);
                const popular = pack.tag === "Popular";
                return (
                  <Reveal key={pack.id} delay={150 + i * 100}>
                    <div
                      className={
                        "relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg " +
                        (popular ? "border-brand-400 ring-2 ring-brand-200" : "border-[var(--border)]")
                      }
                    >
                      {pack.tag && (
                        <span className="absolute -top-3 left-4 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          {pack.tag}
                        </span>
                      )}
                      <p className="text-sm font-medium text-gray-500">
                        {pack.credits} {pack.credits === 1 ? "credit" : "credits"}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{formatPrice(pack.pricePaise)}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatPrice(Math.round(pack.pricePaise / pack.credits))} per credit
                        {saving > 0 && <span className="ml-2 font-semibold text-green-700">Save {saving}%</span>}
                      </p>
                      <p className="mt-4 flex-1 text-sm text-gray-600">
                        {pack.credits === 1
                          ? "Top up for a single session."
                          : `Enough for ${pack.credits} hours of learning.`}
                      </p>
                      <Link href={buyHref} className="mt-6 block">
                        <Button variant={popular ? "brand" : "outline"} className="w-full">
                          {session ? "Buy now" : "Sign up to buy"}
                        </Button>
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Prices in INR and include taxes. Payments are processed by Razorpay. Credits are not refundable or transferable once added.
            </p>
          </div>
        </div>
      </section>

      {creditsFaq && (
        <section className="border-t border-[var(--border)] bg-gray-50">
          <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
            <Reveal>
              <h2 className="text-2xl font-bold text-gray-900">Questions about credits</h2>
            </Reveal>
            <div className="mt-6">
              <FaqList items={creditsFaq.items} />
            </div>
            <Link href="/faq" className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline">
              See all questions
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
