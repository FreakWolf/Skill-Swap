import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CreditPill } from "@/components/CreditPill";
import { requireUser, getBalance } from "@/lib/auth";
import { CREDIT_PACKS, formatPrice } from "@/lib/credit-packs";
import { getMyPurchases } from "@/lib/credit-purchases";
import { getLedger, LEDGER_REASONS, LEDGER_REASON_LABEL } from "@/lib/credits";
import { razorpayConfigured } from "@/lib/razorpay";
import { getTimeZone, formatInTz } from "@/lib/time";
import type { LedgerReason } from "@/lib/types";
import { cn } from "@/lib/cn";
import { BuyCredits } from "./BuyCredits";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { user } = await requireUser();
  const { reason } = await searchParams;
  const activeReason = (LEDGER_REASONS as string[]).includes(reason ?? "")
    ? (reason as LedgerReason)
    : undefined;

  const [balance, purchases, ledger, tz] = await Promise.all([
    getBalance(user.id),
    getMyPurchases(),
    getLedger(user.id, { reason: activeReason }),
    getTimeZone(),
  ]);
  const enabled = razorpayConfigured();

  const earned = ledger.filter((e) => e.amount > 0 && e.reason !== "purchase" && e.reason !== "signup_grant").reduce((s, e) => s + e.amount, 0);
  const spent = ledger.filter((e) => e.amount < 0).reduce((s, e) => s - e.amount, 0);

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

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
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

      <section aria-labelledby="history-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="history-heading" className="text-lg font-semibold text-gray-900">Credit history</h2>
            <p className="text-sm text-gray-500">
              Every credit that ever moved on your account.
              {!activeReason && ledger.length > 0 && ` Earned ${earned} by teaching · spent ${spent} on sessions.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/credits"
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                !activeReason ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
            >
              All
            </Link>
            {LEDGER_REASONS.map((r) => (
              <Link
                key={r}
                href={`/credits?reason=${r}`}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  activeReason === r ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                {LEDGER_REASON_LABEL[r]}
              </Link>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {ledger.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">When</th>
                    <th scope="col" className="px-4 py-3 font-medium">What</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Credits</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {ledger.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {formatInTz(e.created_at, tz, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{LEDGER_REASON_LABEL[e.reason] ?? e.reason}</span>
                        {e.offeringTitle && (
                          <span className="block text-xs text-gray-500">
                            {e.booking_id ? (
                              <Link href={`/sessions/${e.booking_id}`} className="hover:underline">{e.offeringTitle}</Link>
                            ) : (
                              e.offeringTitle
                            )}
                          </span>
                        )}
                      </td>
                      <td className={cn("px-4 py-3 text-right font-semibold", e.amount > 0 ? "text-green-700" : "text-gray-900")}>
                        {e.amount > 0 ? `+${e.amount}` : e.amount}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{e.runningBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

export const metadata = { title: "Credits" };
