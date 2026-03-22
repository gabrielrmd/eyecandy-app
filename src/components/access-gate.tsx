"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

interface AccessGateProps {
  /** Which entitlement is required */
  requires: "templates" | "strategy_builder" | "circle" | "agency";
  /** What to show if access is granted */
  children: React.ReactNode;
}

interface AccessData {
  hasTemplates: boolean;
  hasStrategyBuilder: boolean;
  hasCircle: boolean;
  hasAgency: boolean;
}

export function AccessGate({ requires, children }: AccessGateProps) {
  const [access, setAccess] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/access")
      .then((r) => r.json())
      .then((data) => {
        setAccess(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--teal)] border-t-transparent" />
      </div>
    );
  }

  const hasAccess = access
    ? requires === "templates" ? access.hasTemplates
    : requires === "strategy_builder" ? access.hasStrategyBuilder
    : requires === "circle" ? access.hasCircle
    : requires === "agency" ? access.hasAgency
    : false
    : false;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Map entitlement to plan name and product
  const planMap: Record<string, { name: string; productId: string }> = {
    templates: { name: "Essentials", productId: "essentials_yearly" },
    strategy_builder: { name: "Professional", productId: "professional_yearly" },
    circle: { name: "Professional", productId: "professional_yearly" },
    agency: { name: "Agency", productId: "agency_yearly" },
  };

  const plan = planMap[requires] || planMap.templates;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(42,185,176,0.1)]">
          <Lock className="h-8 w-8 text-[var(--teal)]" />
        </div>
        <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] uppercase">
          {plan.name} Plan Required
        </h2>
        <p className="mt-3 text-sm text-[var(--mid-gray)] leading-relaxed">
          This feature requires an active {plan.name} subscription.
          Upgrade your plan to unlock full access.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="rounded-xl bg-[var(--teal)] px-6 py-3 text-sm font-bold text-[var(--navy)] shadow-[0_4px_16px_rgba(42,185,176,0.35)] hover:-translate-y-0.5 transition-all"
          >
            View Plans & Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border-2 border-[#e8eaed] px-6 py-3 text-sm font-semibold text-[var(--charcoal)] hover:border-[var(--teal)] transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
