/**
 * Product & Pricing Configuration
 *
 * Option B: Good-Better-Best (3 core tiers + add-ons)
 *
 * Core Tiers:
 *   Essentials (Templates)        → €29/mo | €249/yr
 *   Professional (T+S+C)          → €79/mo | €699/yr  (5 credits, Circle)
 *   Agency (White Label)           → €249/mo | €2,499/yr (unlimited, team seats)
 *
 * Add-ons:
 *   Strategy Builder Standalone    → €199 one-time (5 credits)
 *   Strategy Credit 5-pack         → €99
 *   1:1 With Gabriel               → €300/hr
 */

// ─── Types ───────────────────────────────────────────────────────

export type EntitlementType =
  | "templates"
  | "strategy_builder"
  | "circle"
  | "agency"
  | "consulting";

export type ProductId =
  | "essentials_monthly"
  | "essentials_yearly"
  | "professional_monthly"
  | "professional_yearly"
  | "agency_monthly"
  | "agency_yearly"
  | "strategy_standalone"
  | "credit_pack_5"
  | "consulting_session"
  | "templates_strategy_yearly";

export type TierId = "essentials" | "professional" | "agency";

export interface ProductDef {
  id: ProductId;
  tier: TierId | "addon";
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: "month" | "year" | null;
  grantsEntitlements: EntitlementType[];
  grantsCredits: number;
  unlimitedCredits: boolean;
  stripePriceId: string; // from env
}

export interface TierDef {
  id: TierId;
  name: string;
  tagline: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  monthlyProductId: ProductId;
  yearlyProductId: ProductId;
  features: string[];
  entitlements: EntitlementType[];
  strategyCredits: number;
  unlimitedCredits: boolean;
  popular?: boolean;
  teamSeats?: number;
}

// ─── Stripe Price ID Env Mapping ─────────────────────────────────

const env = (key: string, fallback: string) =>
  (typeof process !== "undefined" ? process.env?.[key] : undefined) ?? fallback;

export const STRIPE_PRICES: Record<ProductId, string> = {
  essentials_monthly: env("NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS", "price_1TDpGJEznoweIYHcJAxbVvrQ"),
  essentials_yearly: env("NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS", "price_1TDpGJEznoweIYHcJAxbVvrQ"),
  professional_monthly: env("NEXT_PUBLIC_STRIPE_PRICE_PRO", "price_1TDpJOEznoweIYHcX6cGwga0"),
  professional_yearly: env("NEXT_PUBLIC_STRIPE_PRICE_PRO", "price_1TDpJOEznoweIYHcX6cGwga0"),
  agency_monthly: env("NEXT_PUBLIC_STRIPE_PRICE_AGENCY", "price_1TDpNgEznoweIYHcz9KWeoxk"),
  agency_yearly: env("NEXT_PUBLIC_STRIPE_PRICE_AGENCY", "price_1TDpNgEznoweIYHcz9KWeoxk"),
  strategy_standalone: env("NEXT_PUBLIC_STRIPE_PRICE_STRATEGY", "price_strategy_standalone"),
  credit_pack_5: env("NEXT_PUBLIC_STRIPE_PRICE_CREDITS_5", "price_credits_5"),
  consulting_session: env("NEXT_PUBLIC_STRIPE_PRICE_CONSULTING", "price_consulting"),
  templates_strategy_yearly: env("NEXT_PUBLIC_STRIPE_PRICE_TS_YEARLY", "price_ts_yearly"),
};

// ─── Tier Definitions ────────────────────────────────────────────

export const TIERS: TierDef[] = [
  {
    id: "essentials",
    name: "Essentials",
    tagline: "Templates for every marketing function",
    monthlyPriceCents: 7900,
    yearlyPriceCents: 7900,
    monthlyProductId: "essentials_yearly",
    yearlyProductId: "essentials_yearly",
    features: [
      "Access to all 41 marketing templates",
      "7 categories: Strategy, Brand, Content, Digital, Growth, Analytics, PR",
      "Interactive dashboards with guided workflows",
      "Export to PDF & XLSX",
      "Templates updated monthly",
      "Email support",
    ],
    entitlements: ["templates"],
    strategyCredits: 0,
    unlimitedCredits: false,
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Strategy + Templates + Community + Challenge",
    monthlyPriceCents: 14900,
    yearlyPriceCents: 14900,
    monthlyProductId: "professional_yearly",
    yearlyProductId: "professional_yearly",
    features: [
      "Everything in Essentials, plus:",
      "AI Strategy Builder (5 credits included)",
      "15-section strategy deck with PDF export",
      "90-Day Growth Challenge",
      "Unplugged Circle membership",
      "Live group coaching (2x weekly)",
    ],
    entitlements: ["templates", "strategy_builder", "circle"],
    strategyCredits: 5,
    unlimitedCredits: false,
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    tagline: "White-label the platform for your clients",
    monthlyPriceCents: 24900,
    yearlyPriceCents: 24900,
    monthlyProductId: "agency_yearly",
    yearlyProductId: "agency_yearly",
    features: [
      "Everything in Professional, plus:",
      "White-label strategy builder",
      "Unlimited strategy generations",
      "Custom templates for your verticals",
      "Dedicated onboarding with our founder",
    ],
    entitlements: ["templates", "strategy_builder", "circle", "agency"],
    strategyCredits: 0,
    unlimitedCredits: true,
    teamSeats: 20,
  },
];

// ─── Add-on Definitions ──────────────────────────────────────────

export interface AddOnDef {
  id: ProductId;
  name: string;
  description: string;
  priceCents: number;
  priceLabel: string;
  features: string[];
  grantsEntitlements: EntitlementType[];
  grantsCredits: number;
  ctaLabel: string;
  ctaAction: "checkout" | "contact"; // checkout = Stripe, contact = manual
}

export const ADDONS: AddOnDef[] = [
  {
    id: "strategy_standalone",
    name: "Strategy Builder",
    description: "One-time access to the AI Strategy Builder",
    priceCents: 19900,
    priceLabel: "€199 one-time",
    features: [
      "AI Strategy Builder access",
      "5 strategy credits included",
      "15-section strategy deck",
      "90-day roadmap",
      "PDF export",
    ],
    grantsEntitlements: ["strategy_builder"],
    grantsCredits: 5,
    ctaLabel: "Buy Strategy Builder",
    ctaAction: "checkout",
  },
  {
    id: "credit_pack_5",
    name: "Strategy Credits",
    description: "5 additional strategy generations",
    priceCents: 9900,
    priceLabel: "€99 for 5 credits",
    features: [
      "5 strategy generation credits",
      "Stack with existing credits",
      "No expiry",
    ],
    grantsEntitlements: [],
    grantsCredits: 5,
    ctaLabel: "Buy Credits",
    ctaAction: "checkout",
  },
  {
    id: "consulting_session",
    name: "1:1 Consulting",
    description: "Direct consulting session with our founder",
    priceCents: 30000,
    priceLabel: "€300/hour",
    features: [
      "Brand strategy & positioning",
      "Product launch planning",
      "Marketing & growth strategy",
      "Sustainability & CSR strategy",
      "Business development advisory",
    ],
    grantsEntitlements: ["consulting"],
    grantsCredits: 0,
    ctaLabel: "Book a Call",
    ctaAction: "contact",
  },
];

// ─── Product lookup by Stripe product ID ─────────────────────────

export const STRIPE_PRODUCT_TO_PRODUCT_ID: Record<string, ProductId> = {};
// This gets populated after Stripe products are created.
// For now, the webhook uses metadata.product_id passed during checkout.

// ─── Helpers ─────────────────────────────────────────────────────

export function getTier(id: TierId): TierDef | undefined {
  return TIERS.find((t) => t.id === id);
}

export function getAddon(id: ProductId): AddOnDef | undefined {
  return ADDONS.find((a) => a.id === id);
}

export function formatPrice(cents: number, interval?: string | null): string {
  const euros = (cents / 100).toFixed(0);
  const suffix = interval === "month" ? "/mo" : interval === "year" ? "/yr" : "";
  return `€${euros}${suffix}`;
}

export function getYearlySavingsPercent(tier: TierDef): number {
  const monthlyTotal = tier.monthlyPriceCents * 12;
  const yearlyTotal = tier.yearlyPriceCents;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}
