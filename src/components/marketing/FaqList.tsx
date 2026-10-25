import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/marketing/faq";

// Accessible accordion built on native <details>; no JS required.
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
