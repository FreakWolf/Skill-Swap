import type { Metadata } from "next";
import { Coins } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroVisual } from "@/components/landing/HeroVisual";
import {
  Audience,
  Categories,
  Faq,
  FeatureBento,
  FinalCta,
  HowItWorks,
  PricingTeaser,
  Safety,
} from "@/components/landing/Sections";
import { FAQS } from "@/components/landing/content";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
};

// Structured data for search engines. The FAQPage uses the same FAQS array
// as the visible FAQ, so they can never drift apart.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: SITE.alternateNames,
      url: SITE.url,
      logo: `${SITE.url}/brand/logo.png`,
    },
    {
      // Google's site name (shown above the result instead of "DigitalPlat
      // Domain"). alternateName gives it fallbacks, most preferred first; the
      // lowercase host is Google's documented last-resort option.
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      alternateName: [...SITE.alternateNames, new URL(SITE.url).host],
      url: `${SITE.url}/`,
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-elevated px-4 py-2 text-sm font-semibold text-link shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <SiteHeader anchors />

      <main id="main" className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section aria-labelledby="hero-heading" className="px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24">
          <div className="glass mx-auto grid max-w-6xl items-center gap-12 rounded-[2rem] px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card-solid px-3.5 py-1.5 text-sm font-semibold text-link shadow-soft">
                <span aria-hidden className="h-2 w-2 rounded-full bg-brand-orange-500" />
                {SITE.tagline}
              </span>
              <h1
                id="hero-heading"
                className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl"
              >
                Learn anything by <span className="text-gradient">teaching what you know</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted lg:mx-0">
                SkillSwap is a community where you earn credits by teaching your skills, then spend
                them to learn from others. Everyone teaches. Everyone learns.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <ButtonLink href="/signup" size="lg">
                  Get started free
                </ButtonLink>
                <ButtonLink href="#how-it-works" variant="outline" size="lg">
                  See how it works
                </ButtonLink>
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-fg">
                <Coins className="h-4 w-4" aria-hidden />3 free credits when you sign up
              </p>
            </div>
            <div className="animate-fade-up">
              <HeroVisual />
            </div>
          </div>
        </section>

        <HowItWorks />
        <Categories />
        <FeatureBento />
        <Audience />
        <PricingTeaser />
        <Safety />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter onLanding />
    </div>
  );
}
