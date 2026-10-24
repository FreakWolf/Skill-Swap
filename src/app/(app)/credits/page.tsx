import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import { CREDIT_PACKS, formatPrice } from "@/lib/credit-packs";
import { getMyPurchases } from "@/lib/credit-purchases";
import { razorpayConfigured } from "@/lib/razorpay";
import { getTimeZone, formatInTz } from "@/lib/time";
import { BuyCredits } from "./BuyCredits";

export default async function CreditsPage() {
  const { user } = await requireUser();
  const [balance, purchases, tz] = await Promise.all([
    getBalance(user.id),
    getMyPurchases(),
    getTimeZone(),
  ]);
  const enabled = razorpayConfigured();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Credits</h1>
          <p className="mt-1 text-gray-600">
            1 credit = 1 hour of learning. Earn them by teaching, or top up here.
          </p>
        </div>
        <CreditPill balance={balance} />
      </div>

      <section aria-labelledby="buy-heading" className="space-y-3">
        <h2 id="buy-heading" className="text-lg font-semibold text-gray-900">
          Buy credits
        </h2>
        {!enabled && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Buying credits isn&apos;t available yet. In the meantime, you can earn
            credits by{" "}
            <Link href="/offer" className="font-medium underline">
              offering a skill
            </Link>
            .
          </p>
        )}
        <BuyCredits packs={CREDIT_PACKS} enabled={enabled} />
        <p className="flex items-start gap-2 text-xs text-gray-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Secure payment by Razorpay (UPI, cards, netbanking, wallets). SkillSwap
            never sees your card or bank details. Prices include taxes. Credits
            can only be used on SkillSwap; they can&apos;t be withdrawn or
            exchanged for money. See our{" "}
            <Link href="/terms" className="underline">Terms</Link>.
          </span>
        </p>
      </section>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-3 font-semibold text-gray-900">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-gray-500">You haven&apos;t bought any credits yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {purchases.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <span className="font-medium text-gray-900">
                  +{p.credits} credit{p.credits === 1 ? "" : "s"}
                </span>
                <span className="text-gray-600">{formatPrice(p.amount_paise)}</span>
                <span className="ml-auto text-gray-500">
                  {formatInTz(p.paid_at, tz, { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {p.provider_payment_id && (
                  <span className="w-full font-mono text-xs text-gray-500">
                    Payment ID: {p.provider_payment_id}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export const metadata = { title: "Credits" };
