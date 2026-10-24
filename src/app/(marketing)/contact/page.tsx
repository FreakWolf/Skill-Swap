import Link from "next/link";
import type { Metadata } from "next";
import { LifeBuoy, Mail, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { getSessionUser } from "@/lib/auth";
import { LEGAL } from "@/lib/legal-config";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SkillSwap team about your account, payments or safety.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const session = await getSessionUser();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-brand-orange-50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-16 text-center sm:px-6 lg:px-10">
          <div className="animate-fade-up mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Contact</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">We&apos;d love to hear from you</h1>
            <p className="mt-4 text-lg text-gray-600">
              Questions, feedback or a problem with a session: send us a message and we&apos;ll get back to you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-6">
            <Reveal>
              <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-5">
                <Mail className="h-6 w-6 shrink-0 text-brand-700" aria-hidden />
                <div>
                  <h2 className="font-semibold text-gray-900">Email</h2>
                  <a href={`mailto:${LEGAL.contactEmail}`} className="mt-1 block text-sm text-brand-700 hover:underline">
                    {LEGAL.contactEmail}
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-5">
                <LifeBuoy className="h-6 w-6 shrink-0 text-brand-700" aria-hidden />
                <div>
                  <h2 className="font-semibold text-gray-900">Common questions</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Credits, bookings and refunds are covered in the{" "}
                    <Link href="/faq" className="font-medium text-brand-700 hover:underline">FAQ</Link>.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-5">
                <ShieldAlert className="h-6 w-6 shrink-0 text-brand-orange-700" aria-hidden />
                <div>
                  <h2 className="font-semibold text-gray-900">Safety concern?</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Use the Report button on the member&apos;s profile, conversation or session so the
                    details reach our moderation queue directly.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
              <ContactForm
                defaultName={session?.profile?.full_name ?? ""}
                defaultEmail={session?.user.email ?? ""}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
