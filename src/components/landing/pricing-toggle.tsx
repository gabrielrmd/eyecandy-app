"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const plans = [
  { name: "Essentials", productId: "essentials_yearly", desc: "Templates for every marketing function", price: 79, unit: "one-time · 1 year access", features: ["Access to all 41 marketing templates", "7 categories: Strategy, Brand, Content, Digital, Growth, Analytics, PR", "Export to PDF & XLSX", "Templates updated monthly", "Email support"], cta: "Choose Plan", fill: false, featured: false, contactOnly: false },
  { name: "Professional", productId: "professional_yearly", desc: "Strategy + Templates + Community + Challenge", price: 149, unit: "one-time · 1 year access", features: ["Everything in Essentials, plus:", "AI Strategy Builder (5 credits included)", "15-section strategy deck with PDF export", "90-Day Growth Challenge", "Unplugged Circle membership", "Live group coaching (2x weekly)"], cta: "Get Started", fill: true, featured: true, contactOnly: false },
  { name: "Agency", productId: "agency_yearly", desc: "White-label the platform for your clients", price: 249, unit: "/month", features: ["Everything in Professional, plus:", "White-label strategy builder", "Unlimited strategy generations", "Custom templates for your verticals", "Dedicated onboarding with our founder"], cta: "Contact Sales", fill: false, featured: false, contactOnly: true },
];

export function PricingToggle() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    setLoading(productId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        // Not logged in — send to signup with plan preselected
        window.location.href = `/signup?plan=${productId}`;
        return;
      }

      const data = await res.json();
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Fallback — send to pricing page
        window.location.href = `/pricing`;
      }
    } catch {
      window.location.href = `/signup?plan=${productId}`;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-stretch mt-10">
      {plans.map((plan) => {
        const isLoading = loading === plan.productId;
        return (
          <div
            key={plan.name}
            className={`bg-white border-2 rounded-2xl p-8 text-left transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative flex flex-col ${
              plan.featured
                ? "border-[var(--teal)] bg-[linear-gradient(to_bottom,rgba(42,185,176,0.03),white)] shadow-[0_8px_40px_rgba(42,185,176,0.1)]"
                : "border-[#e8eaed]"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-[linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30)] text-[var(--navy)] px-[18px] py-[5px] rounded-full text-[11px] font-bold uppercase tracking-[1px] whitespace-nowrap shadow-[0_4px_12px_rgba(42,185,176,0.35)]">
                Most Popular
              </div>
            )}

            <div className={`font-[family-name:var(--font-oswald)] text-[18px] font-bold text-[var(--charcoal)] uppercase ${plan.featured ? "mt-2" : ""}`}>
              {plan.name}
            </div>

            <div className="text-[12px] text-[var(--mid-gray)] mb-5 lg:min-h-[36px]">
              {plan.desc}
            </div>

            <div className="mb-5">
              <div className="font-[family-name:var(--font-oswald)] text-[40px] font-bold text-[var(--charcoal)] leading-[1.1]">
                €{plan.price}
                {plan.unit.startsWith("/") && <span className="text-[14px] font-normal text-[var(--mid-gray)] font-sans">{plan.unit}</span>}
              </div>
              <p className="text-[12px] text-[var(--mid-gray)] mt-1">
                {plan.unit.startsWith("/") ? "" : plan.unit}
              </p>
            </div>

            <ul className="list-none p-0 mb-6 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="py-1.5 text-[13px] text-[var(--charcoal)] flex items-start gap-[7px]">
                  <span className="text-[var(--teal)] font-bold shrink-0 mt-[1px]">✓</span>
                  {f.startsWith("Everything") ? <strong>{f}</strong> : f}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <button
                onClick={() => plan.contactOnly ? router.push("#consulting") : handleCheckout(plan.productId)}
                disabled={isLoading}
                className={`block w-full py-3.5 rounded-[10px] text-[14px] font-bold text-center transition-all cursor-pointer ${
                  plan.fill
                    ? "bg-[var(--teal)] text-[var(--navy)] shadow-[0_4px_16px_rgba(42,185,176,0.35)] hover:shadow-[0_8px_24px_rgba(42,185,176,0.35)] hover:-translate-y-px"
                    : "bg-white text-[var(--charcoal)] border-2 border-[#e8eaed] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                } disabled:opacity-50`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                {plan.cta}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
