"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PRICE_IDS = {
  template_toolkit_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOOLKIT_MONTHLY || "price_toolkit_monthly",
  template_toolkit_annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOOLKIT_ANNUAL || "price_toolkit_annual",
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_starter",
  professional_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  professional_annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_pro_annual",
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "price_enterprise",
};

interface PricingTier {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  priceNote: string;
  annualPriceNote: string;
  popular: boolean;
  features: string[];
  ctaLabel: string;
  plan: string;
  monthlyPriceId: string;
  annualPriceId: string;
}

const tiers: PricingTier[] = [
  {
    name: "Template Toolkit",
    monthlyPrice: "€19",
    annualPrice: "€15",
    priceNote: "/mo",
    annualPriceNote: "/mo, billed annually",
    popular: false,
    features: [
      "Access to all 41 advertising templates",
      "Smart search and filtering",
      "PDF export for every template",
      "Email support within 24 hours",
      "Regular template updates",
    ],
    ctaLabel: "Get Started",
    plan: "template_toolkit",
    monthlyPriceId: PRICE_IDS.template_toolkit_monthly,
    annualPriceId: PRICE_IDS.template_toolkit_annual,
  },
  {
    name: "Starter Strategy",
    monthlyPrice: "€149",
    annualPrice: "€149",
    priceNote: " one-time",
    annualPriceNote: " one-time",
    popular: false,
    features: [
      "AI-powered strategy builder",
      "Complete 15-section strategy deck",
      "90-day action roadmap",
      "One strategy generation",
      "PDF and editable export",
      "Email support",
    ],
    ctaLabel: "Buy Now",
    plan: "starter",
    monthlyPriceId: PRICE_IDS.starter,
    annualPriceId: PRICE_IDS.starter,
  },
  {
    name: "Professional",
    monthlyPrice: "€49",
    annualPrice: "€39",
    priceNote: "/mo",
    annualPriceNote: "/mo, billed annually",
    popular: true,
    features: [
      "Everything in Starter Strategy",
      "Unlimited template access",
      "Unlimited strategy generations",
      "30-Day Strategy Challenge",
      "Private community access",
      "Unlimited AI refinements",
      "Priority email support",
    ],
    ctaLabel: "Start Free Trial",
    plan: "professional",
    monthlyPriceId: PRICE_IDS.professional_monthly,
    annualPriceId: PRICE_IDS.professional_annual,
  },
  {
    name: "Enterprise",
    monthlyPrice: "€2,999",
    annualPrice: "€2,999",
    priceNote: "/yr",
    annualPriceNote: "/yr",
    popular: false,
    features: [
      "Everything in Professional",
      "Up to 10 team seats",
      "Quarterly strategy sessions",
      "Custom-branded templates",
      "API access and integrations",
      "Dedicated account manager",
      "SSO and advanced security",
    ],
    ctaLabel: "Contact Sales",
    plan: "enterprise",
    monthlyPriceId: PRICE_IDS.enterprise,
    annualPriceId: PRICE_IDS.enterprise,
  },
];

export default function PricingPageClient() {
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = useCallback(
    async (tier: PricingTier) => {
      setLoadingTier(tier.plan);

      try {
        // Check if user is authenticated
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Redirect unauthenticated users to signup with the selected plan
          router.push(`/signup?plan=${tier.plan}`);
          return;
        }

        const priceId = annual ? tier.annualPriceId : tier.monthlyPriceId;

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, plan: tier.plan }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create checkout session");
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Checkout error:", error);
        // Could add toast notification here in the future
      } finally {
        setLoadingTier(null);
      }
    },
    [annual, router]
  );

  return (
    <section className="-mt-8 px-4 pb-16">
      {/* Billing Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${
            !annual ? "text-[var(--navy)]" : "text-gray-400"
          }`}
        >
          Monthly
        </span>
        <button
          type="button"
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            annual ? "bg-[var(--coral)]" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={annual}
          aria-label="Toggle annual billing"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            annual ? "text-[var(--navy)]" : "text-gray-400"
          }`}
        >
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Save 20%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const isLoading = loadingTier === tier.plan;

          return (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                tier.popular
                  ? "border-[var(--coral)] ring-2 ring-[var(--coral)]/20"
                  : "border-gray-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--coral)] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-[var(--navy)] font-[family-name:var(--font-oswald)]">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl font-bold text-[var(--navy)] font-[family-name:var(--font-oswald)]">
                    {annual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    {annual ? tier.annualPriceNote : tier.priceNote}
                  </span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--coral)]" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleCheckout(tier)}
                disabled={isLoading || loadingTier !== null}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                  tier.popular
                    ? "bg-[var(--coral)] text-white"
                    : "border border-gray-300 bg-white text-[var(--navy)] hover:bg-gray-50"
                }`}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Redirecting..." : tier.ctaLabel}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
