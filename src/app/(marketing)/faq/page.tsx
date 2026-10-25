import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/marketing/Reveal";
import { FaqList } from "@/components/marketing/FaqList";
import { FAQ_GROUPS } from "@/lib/marketing/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about credits, booking, cancellations, safety and payments on SkillSwap.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-background to-brand-orange-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-16 text-center sm:px-6 lg:px-10">
          <div className="animate-fade-up mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-fg">FAQ</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Frequently asked questions</h1>
            <p className="mt-4 text-lg text-gray-600">
              Can&apos;t find what you need?{" "}
              <Link href="/contact" className="font-medium text-brand-fg hover:underline">Contact us</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="FAQ sections" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              {FAQ_GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="inline-block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            {FAQ_GROUPS.map((g) => (
              <Reveal key={g.id} as="section" className="scroll-mt-24">
                <h2 id={g.id} className="text-xl font-bold text-gray-900">{g.title}</h2>
                <div className="mt-4">
                  <FaqList items={g.items} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
