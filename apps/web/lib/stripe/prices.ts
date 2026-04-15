export const PRICES = {
  entry: process.env.STRIPE_PRICE_ENTRY ?? "",
  coreMonthly: process.env.STRIPE_PRICE_CORE_MONTHLY ?? "",
  premiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
} as const;

export const PRICE_AMOUNTS = {
  entry: 4900,         // $49
  coreMonthly: 49900,  // $499
  premiumMonthly: 149900, // $1,499
} as const;

export type PriceTier = "entry" | "core" | "premium";
