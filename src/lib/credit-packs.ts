// Credit packs for sale. The SERVER uses these to set the price of an order;
// the browser only ever sends a pack id, so it can't change what it pays.
//
// Prices are in paise (₹1 = 100 paise) and include taxes.
// Owner-set prices (Oct 2026): about ₹1 per credit, 1 credit = 1 hour, kept
// cheap on purpose. Bigger packs give a better rate. Packs above 1000 credits
// need migration 0011 (it raises the credit_purchases.credits limit).
// Pack ids are new; old purchase rows keep their old ids (only used at order time).
export const CREDIT_CURRENCY = "INR";

export interface CreditPack {
  id: string;
  credits: number;
  pricePaise: number;
  tag?: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack_100", credits: 100, pricePaise: 9900 },
  { id: "pack_525", credits: 525, pricePaise: 49900, tag: "Popular" },
  { id: "pack_1100", credits: 1100, pricePaise: 99900, tag: "Best value" },
];

export function getPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CREDIT_CURRENCY,
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

// Per-credit saving vs. the priciest pack (the smallest one), e.g. 8 for
// "Save 8%". 0 for the base pack itself.
export function savingsPercent(pack: CreditPack): number {
  const perCredit = (p: CreditPack) => p.pricePaise / p.credits;
  const base = Math.max(...CREDIT_PACKS.map(perCredit));
  const saving = Math.round((1 - perCredit(pack) / base) * 100);
  return saving > 0 ? saving : 0;
}

// Extra credits vs. the base pack's rate, e.g. 91 for "+91 bonus credits".
export function bonusCredits(pack: CreditPack): number {
  const base = CREDIT_PACKS.reduce((a, b) => (a.pricePaise / a.credits >= b.pricePaise / b.credits ? a : b));
  const atBaseRate = Math.floor((pack.pricePaise * base.credits) / base.pricePaise);
  return Math.max(0, pack.credits - atBaseRate);
}
