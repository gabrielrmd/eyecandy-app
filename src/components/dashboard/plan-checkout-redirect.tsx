"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { STRIPE_PRICES, type ProductId } from "@/lib/products";
import { Loader2 } from "lucide-react";

export default function PlanCheckoutRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") as ProductId | null;
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!plan || !STRIPE_PRICES[plan]) return;

    let cancelled = false;

    async function startCheckout() {
      setRedirecting(true);
      setError(null);

      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: plan }),
        });

        if (cancelled) return;

        if (res.status === 401) {
          window.location.href = `/signup?plan=${plan}`;
          return;
        }

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Failed to start checkout. Please try again.");
          setRedirecting(false);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong. Please try again or visit the pricing page.");
          setRedirecting(false);
        }
      }
    }

    startCheckout();

    return () => {
      cancelled = true;
    };
  }, [plan, router]);

  if (!plan || !STRIPE_PRICES[plan]) return null;

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">{error}</p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              setError(null);
              setRedirecting(true);
              fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: plan }),
              })
                .then((r) => r.json())
                .then((data) => {
                  if (data.url) window.location.href = data.url;
                  else {
                    setError(data.error || "Failed to start checkout.");
                    setRedirecting(false);
                  }
                })
                .catch(() => {
                  setError("Something went wrong. Please try again.");
                  setRedirecting(false);
                });
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.replace("/dashboard")}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--teal)]/30 bg-[rgba(42,185,176,0.05)] p-4">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--teal)]" />
        <p className="text-sm font-medium text-[var(--charcoal)]">
          Redirecting you to checkout...
        </p>
      </div>
    );
  }

  return null;
}
