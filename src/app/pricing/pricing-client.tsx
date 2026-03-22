"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Shield, ArrowRight, Loader2, Users, Star } from "lucide-react";
import { TIERS, ADDONS, type ProductId } from "@/lib/products";

export default function PricingPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (productId: ProductId) => {
    setLoading(productId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        window.location.href = `/signup?plan=${productId}`;
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = `/signup?plan=${productId}`;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Core tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 max-w-[1100px] mx-auto lg:items-stretch">
        {TIERS.map((tier) => {
          const productId = tier.yearlyProductId;
          const price = tier.yearlyPriceCents;
          const isLoading = loading === productId;
          const isAgency = tier.id === "agency";

          return (
            <div
              key={tier.id}
              className={`relative bg-white border-2 rounded-2xl p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${
                tier.popular
                  ? "border-[var(--teal)] shadow-[0_8px_40px_rgba(42,185,176,0.1)] lg:scale-[1.03]"
                  : "border-[#e8eaed]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] text-[var(--navy)] px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shadow-[0_4px_12px_rgba(42,185,176,0.35)]">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                {tier.id === "essentials" && <Zap className="w-5 h-5 text-[var(--teal)]" />}
                {tier.id === "professional" && <Star className="w-5 h-5 text-[var(--teal)]" />}
                {tier.id === "agency" && <Users className="w-5 h-5 text-[var(--teal)]" />}
                <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--charcoal)] uppercase">{tier.name}</h3>
              </div>
              <p className="text-[12px] text-[var(--mid-gray)] mb-4">{tier.tagline}</p>

              <div className="mb-6">
                <div className="font-[family-name:var(--font-oswald)] text-[42px] font-bold text-[var(--charcoal)] leading-none">
                  €{Math.round(price / 100)}
                  {isAgency && <span className="text-[14px] font-normal text-[var(--mid-gray)] font-sans">/month</span>}
                </div>
                <p className="text-[12px] text-[var(--mid-gray)] mt-1">
                  {isAgency ? "Billed monthly" : "one-time · 1 year access"}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--charcoal)]">
                    <Check className="w-4 h-4 text-[var(--teal)] shrink-0 mt-0.5" />
                    {f.startsWith("Everything") ? <strong>{f}</strong> : f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => tier.id === "agency" ? router.push("#consulting") : handleCheckout(productId)}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                  tier.popular
                    ? "bg-[var(--teal)] text-[var(--navy)] shadow-[0_4px_16px_rgba(42,185,176,0.35)] hover:shadow-[0_8px_24px_rgba(42,185,176,0.35)] hover:-translate-y-0.5"
                    : tier.id === "agency"
                    ? "bg-[var(--navy)] text-white hover:bg-[var(--navy)]/90"
                    : "bg-white text-[var(--charcoal)] border-2 border-[#e8eaed] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {tier.id === "agency" ? "Contact Sales" : tier.popular ? "Get Started" : "Choose Plan"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

            </div>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="mt-20 max-w-[1100px] mx-auto">
        <h3 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] text-center uppercase mb-2">
          Add-ons &amp; Standalone Products
        </h3>
        <p className="text-center text-[var(--mid-gray)] text-sm mb-8">
          Available separately or alongside any plan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ADDONS.map((addon) => {
            const isLoading = loading === addon.id;
            return (
              <div key={addon.id} className="bg-white border border-[#e8eaed] rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                <h4 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--charcoal)] uppercase mb-1">
                  {addon.name}
                </h4>
                <p className="text-[12px] text-[var(--mid-gray)] mb-3">{addon.description}</p>
                <div className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--charcoal)] mb-4">
                  {addon.priceLabel}
                </div>
                <ul className="space-y-2 mb-5">
                  {addon.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-[var(--charcoal)]">
                      <Check className="w-3.5 h-3.5 text-[var(--teal)] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addon.ctaAction === "contact" ? router.push("#consulting") : handleCheckout(addon.id)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-[13px] font-bold border-2 border-[#e8eaed] text-[var(--charcoal)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {addon.ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guarantee */}
      <div className="mt-12 text-center max-w-[1100px] mx-auto">
        <div className="inline-flex items-center gap-3 bg-white border border-[#e8eaed] rounded-2xl py-5 px-7 text-[13px] text-[var(--mid-gray)]">
          <Shield className="w-6 h-6 text-[var(--teal)]" />
          All paid plans include a <strong>14-day money-back guarantee</strong>. No questions asked. Secure payments via Stripe.
        </div>
      </div>
    </div>
  );
}
