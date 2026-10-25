import { Coins } from "lucide-react";
import { cn } from "@/lib/cn";
import { CountUp } from "@/components/motion/CountUp";

export function CreditPill({
  balance,
  className,
  animate = false,
}: {
  balance: number;
  className?: string;
  /** Count up from 0 on mount. */
  animate?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-accent-fg",
        className,
      )}
      title="1 credit = 1 hour"
    >
      <Coins className="h-4 w-4" aria-hidden />
      {animate ? <CountUp value={balance} /> : balance} {balance === 1 ? "credit" : "credits"}
    </span>
  );
}
