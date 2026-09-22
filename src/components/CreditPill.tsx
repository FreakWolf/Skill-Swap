import { Coins } from "lucide-react";
import { cn } from "@/lib/cn";

export function CreditPill({
  balance,
  className,
}: {
  balance: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700",
        className,
      )}
      title="1 credit = 1 hour"
    >
      <Coins className="h-4 w-4" />
      {balance} {balance === 1 ? "credit" : "credits"}
    </span>
  );
}
