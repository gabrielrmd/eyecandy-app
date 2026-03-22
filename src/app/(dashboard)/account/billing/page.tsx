"use client";

import { useState, useEffect } from "react";
import { CreditCard, ExternalLink, Zap, Star, Users, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UserAccessData {
  tierName: string;
  hasTemplates: boolean;
  hasStrategyBuilder: boolean;
  hasCircle: boolean;
  hasAgency: boolean;
  canGenerateStrategy: boolean;
  credits: {
    credits_remaining: number;
    credits_used: number;
    credits_total: number;
    unlimited: boolean;
  };
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<UserAccessData | null>(null);

  useEffect(() => {
    fetch("/api/user/access")
      .then((r) => r.json())
      .then(setAccess)
      .catch(() => {});
  }, []);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const tierIcon = access?.hasAgency ? (
    <Users className="w-6 h-6 text-[var(--teal)]" />
  ) : access?.hasCircle ? (
    <Star className="w-6 h-6 text-[var(--teal)]" />
  ) : (
    <Zap className="w-6 h-6 text-[var(--teal)]" />
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] uppercase">
        Billing &amp; Subscription
      </h1>
      <p className="mt-1 text-sm text-[var(--mid-gray)]">
        Manage your plan, view credits, and access billing history.
      </p>

      {/* Current Plan */}
      <div className="mt-8 rounded-2xl border border-[#e8eaed] bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tierIcon}
            <div>
              <h2 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--charcoal)] uppercase">
                {access?.tierName || "Free"}
              </h2>
              <p className="text-xs text-[var(--mid-gray)]">Current plan</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-bold text-[var(--navy)] transition-all hover:-translate-y-0.5"
          >
            {access?.tierName === "Free" ? "Upgrade" : "Change Plan"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Entitlements */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Templates", active: access?.hasTemplates },
            { label: "Strategy Builder", active: access?.hasStrategyBuilder },
            { label: "Circle", active: access?.hasCircle },
            { label: "Agency", active: access?.hasAgency },
          ].map((e) => (
            <div
              key={e.label}
              className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold ${
                e.active
                  ? "border-[var(--teal)] bg-[rgba(42,185,176,0.05)] text-[var(--teal)]"
                  : "border-[#e8eaed] text-[var(--mid-gray)]"
              }`}
            >
              {e.active ? "✓ " : ""}
              {e.label}
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Credits */}
      <div className="mt-6 rounded-2xl border border-[#e8eaed] bg-white p-6">
        <h3 className="font-[family-name:var(--font-oswald)] text-base font-bold text-[var(--charcoal)] uppercase mb-4">
          Strategy Credits
        </h3>

        {access?.credits?.unlimited ? (
          <div className="text-center py-4">
            <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--teal)]">
              Unlimited
            </div>
            <p className="text-xs text-[var(--mid-gray)] mt-1">Agency plan — unlimited strategy generations</p>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--charcoal)]">
                {access?.credits?.credits_remaining ?? 0}
              </div>
              <p className="text-xs text-[var(--mid-gray)]">Credits remaining</p>
            </div>
            <div className="text-center">
              <div className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--mid-gray)]">
                {access?.credits?.credits_used ?? 0}
              </div>
              <p className="text-xs text-[var(--mid-gray)]">Used</p>
            </div>
            <div className="flex-1 text-right">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#e8eaed] px-4 py-2 text-sm font-bold text-[var(--charcoal)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all"
              >
                Buy More Credits
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Manage Billing */}
      <div className="mt-6 rounded-2xl border border-[#e8eaed] bg-white p-6">
        <h3 className="font-[family-name:var(--font-oswald)] text-base font-bold text-[var(--charcoal)] uppercase mb-2">
          Payment &amp; Invoices
        </h3>
        <p className="text-sm text-[var(--mid-gray)] mb-4">
          Manage your payment method, view invoices, or cancel your subscription through Stripe.
        </p>
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border-2 border-[#e8eaed] px-4 py-2.5 text-sm font-semibold text-[var(--charcoal)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Manage Billing
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
