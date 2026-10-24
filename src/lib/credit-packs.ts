// Credit packs for sale. The SERVER uses these to set the price of an order;
// the browser only ever sends a pack id, so it can't change what it pays.
//
// Prices are in paise (₹1 = 100 paise) and include taxes.
// TODO(owner): confirm these prices before going live.
export const CREDIT_CURRENCY = "INR";

export interface CreditPack {
  id: string;
  credits: number;
  pricePaise: number;
  tag?: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack_1", credits: 1, pricePaise: 9900 },
  { id: "pack_5", credits: 5, pricePaise: 44900, tag: "Popular" },
  { id: "pack_10", credits: 10, pricePaise: 79900, tag: "Best value" },
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

// Saving vs. buying single credits, e.g. 9 for "Save 9%".
export function savingsPercent(pack: CreditPack): number {
  const single = CREDIT_PACKS.find((p) => p.credits === 1);
  if (!single || pack.credits === 1) return 0;
  const full = single.pricePaise * pack.credits;
  return Math.round(((full - pack.pricePaise) / full) * 100);
}
