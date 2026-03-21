"use client";

import { useState } from "react";
import { CreditCard, ExternalLink, Check, AlertCircle } from "lucide-react";

const currentPlan = {
  name: "Free",
  price: "€0",
  period: "forever",
  features: ["3 free templates", "Strategy builder preview", "Community access"],
};

const plans = [
  {
    id: "template_toolkit",
    name: "Template Toolkit",
    price: "€19",
    period: "/month",
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "€49",
    period: "/month",
    current: false,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "€2,999",
    period: "/year",
    current: false,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    // Will integrate with Stripe Customer Portal
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[var(--navy)]">
          Billing & Subscription
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--coral)]" />
              <h2 className="text-lg font-semibold">Current Plan</h2>
            </div>
            <div className="mt-3">
              <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[var(--navy)]">
                {currentPlan.name}
              </span>
              <span className="ml-2 text-muted-foreground">
                {currentPlan.price}/{currentPlan.period}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" />
            Manage Billing
          </button>
        </div>
      </div>

      {/* Upgrade Options */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Upgrade Your Plan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 transition-shadow hover:shadow-md ${
                plan.popular
                  ? "border-[var(--coral)] ring-1 ring-[var(--coral)]"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--coral)] px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-2">
                <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <button
                className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-[var(--coral)] text-white hover:bg-[var(--coral)]/90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                Upgrade
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment History</h2>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span className="text-sm">No payments yet. Subscribe to a plan to get started.</span>
        </div>
      </div>
    </div>
  );
}
