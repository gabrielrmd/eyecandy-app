"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface PricingTier {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  priceNote: string;
  annualPriceNote: string;
  popular: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
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
    ctaHref: "/signup?plan=toolkit",
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
    ctaHref: "/signup?plan=starter",
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
    ctaHref: "/signup?plan=professional",
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
    ctaHref: "/contact?plan=enterprise",
  },
];

export default function PricingPageClient() {
  const [annual, setAnnual] = useState(false);

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
        {tiers.map((tier) => (
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
              <h3 className="text-lg font-semibold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
                {tier.name}
              </h3>
              <div className="mt-3 flex items-baseline">
                <span className="text-4xl font-bold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
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

            <Link
              href={tier.ctaHref}
              className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                tier.popular
                  ? "bg-[var(--coral)] text-white"
                  : "border border-gray-300 bg-white text-[var(--navy)] hover:bg-gray-50"
              }`}
            >
              {tier.ctaLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
