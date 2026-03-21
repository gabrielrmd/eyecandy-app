import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import PricingPageClient from "./pricing-client";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-[var(--navy)] px-4 pb-16 pt-24 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl font-[family-name:var(--font-space-grotesk)]">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Choose the plan that fits your advertising ambitions. No hidden fees,
            no surprises — just the tools you need to build winning strategies.
          </p>
        </section>

        {/* Client-side pricing cards with toggle */}
        <PricingPageClient />

        {/* FAQ Section */}
        <section className="mx-auto max-w-3xl px-4 pb-20 pt-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FaqItem
              question="Can I switch plans at any time?"
              answer="Absolutely. You can upgrade or downgrade your plan at any time from your account settings. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate takes effect at the start of your next billing cycle."
            />
            <FaqItem
              question="Is the Starter Strategy a subscription?"
              answer="No, the Starter Strategy is a one-time purchase of €149. You get lifetime access to the AI strategy builder, a complete 15-section strategy deck, and a 90-day action roadmap with no recurring charges."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards (Visa, Mastercard, American Express) as well as SEPA direct debit for European customers. All payments are securely processed through Stripe."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="Yes. We offer a 14-day money-back guarantee on all subscription plans. If you're not satisfied, contact our support team within 14 days of your purchase for a full refund. One-time purchases are eligible for a refund within 7 days if unused."
            />
            <FaqItem
              question="What's included in the Enterprise quarterly sessions?"
              answer="Enterprise quarterly sessions are 60-minute live strategy consultations with our senior advertising strategists. They'll review your campaigns, provide tailored recommendations, and help you refine your approach for the upcoming quarter."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left text-base font-semibold text-[var(--navy)] marker:[font-size:0] [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="ml-4 h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-sm leading-relaxed text-gray-600">
        {answer}
      </div>
    </details>
  );
}
