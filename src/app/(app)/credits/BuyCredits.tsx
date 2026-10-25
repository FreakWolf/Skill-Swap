"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { bonusCredits, formatPrice, savingsPercent, type CreditPack } from "@/lib/credit-packs";
import { confirmCreditPayment, createCreditOrder } from "./actions";

// Minimal typing for Razorpay's Checkout (https://checkout.razorpay.com/v1/checkout.js).
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", cb: (r: { error: { description?: string } }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;
function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  scriptPromise ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export function BuyCredits({
  packs,
  enabled,
  selectedId,
}: {
  packs: CreditPack[];
  enabled: boolean;
  // Pack chosen in the mobile app (?pack=…): highlighted and scrolled into view.
  selectedId?: string;
}) {
  const router = useRouter();
  const selectedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  async function buy(pack: CreditPack) {
    setError(null);
    setSuccess(null);
    setBusy(pack.id);

    const [order, loaded] = await Promise.all([createCreditOrder(pack.id), loadCheckout()]);
    if ("error" in order) {
      setError(order.error);
      setBusy(null);
      return;
    }
    if (!loaded || !window.Razorpay) {
      setError("Couldn't load the payment window. Check your connection and try again.");
      setBusy(null);
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "SkillSwap",
      description: `${order.credits} credit${order.credits === 1 ? "" : "s"}`,
      prefill: { name: order.name, email: order.email },
      theme: { color: "#7c33ff" },
      modal: { ondismiss: () => setBusy(null) },
      handler: async (resp: RazorpayResponse) => {
        const result = await confirmCreditPayment({
          orderId: resp.razorpay_order_id,
          paymentId: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
        });
        setBusy(null);
        if ("error" in result) {
          setError(result.error);
        } else {
          setSuccess(result.credits);
          router.refresh(); // updates balance + history
        }
      },
    });
    rzp.on("payment.failed", (r) => {
      setError(r.error?.description || "The payment failed. You haven't been charged.");
    });
    rzp.open();
  }

  return (
    <div className="space-y-4">
      {success !== null && (
        <p role="status" className="animate-fade-up flex items-center gap-2 rounded-2xl border border-success-fg/25 bg-success-soft px-4 py-3 text-sm text-success-fg">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
          {success} credit{success === 1 ? "" : "s"} added to your balance. Happy learning!
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {packs.map((pack) => {
          const save = savingsPercent(pack);
          const bonus = bonusCredits(pack);
          const selected = pack.id === selectedId;
          const highlight = selectedId ? selected : pack.tag === "Popular";
          return (
            <div key={pack.id} ref={selected ? selectedRef : undefined}>
            <Card
              className={cn(
                "relative flex h-full flex-col p-5 pt-6",
                highlight && "ring-2 ring-link",
              )}
            >
              {(selected || pack.tag) && (
                <span
                  className={cn(
                    "absolute -top-3 left-5 rounded-full px-3 py-1 text-xs font-bold",
                    !selected && pack.tag === "Best value" ? "bg-gradient-accent text-ink" : "bg-gradient-primary text-white",
                  )}
                >
                  {selected ? "Your pick" : pack.tag}
                </span>
              )}
              <div className="flex items-center gap-2 text-accent-fg">
                <Coins className="h-6 w-6" aria-hidden />
                <span className="text-4xl font-extrabold tracking-tight text-foreground">{pack.credits}</span>
                <span className="text-sm text-muted">credit{pack.credits === 1 ? "" : "s"}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{formatPrice(pack.pricePaise)}</p>
              <p className="text-xs text-muted">
                {formatPrice(Math.round(pack.pricePaise / pack.credits))} per credit
                {save > 0 && <span className="font-semibold text-success-fg"> · Save {save}%</span>}
              </p>
              {bonus > 0 && (
                <p className="mt-2 inline-flex w-fit rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-fg">Includes {bonus} bonus credits</p>
              )}
              <Button
                type="button"
                variant={highlight ? "brand" : "secondary"}
                className="mt-4 w-full"
                disabled={!enabled || busy !== null}
                onClick={() => buy(pack)}
                aria-label={`Buy ${pack.credits} credit${pack.credits === 1 ? "" : "s"} for ${formatPrice(pack.pricePaise)}`}
              >
                {busy === pack.id ? "Opening payment…" : "Buy"}
              </Button>
            </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
