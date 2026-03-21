"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Target,
  BarChart3,
  Layers,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";

const INDUSTRIES = [
  "Technology / SaaS",
  "E-commerce / Retail",
  "Healthcare / Wellness",
  "Finance / Fintech",
  "Education / EdTech",
  "Real Estate",
  "Food & Beverage",
  "Professional Services",
  "Manufacturing",
  "Travel & Hospitality",
  "Media & Entertainment",
  "Nonprofit / NGO",
  "Fashion & Beauty",
  "Automotive",
  "Other",
];

const BENEFITS = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our AI analyzes your answers to craft a bespoke strategy",
  },
  {
    icon: Target,
    title: "15 Strategic Sections",
    description:
      "From brand positioning to growth tactics, every area is covered",
  },
  {
    icon: Clock,
    title: "Ready in ~24 Hours",
    description:
      "What normally takes weeks of consulting, generated in a day",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Backed by analysis of thousands of successful strategies",
  },
  {
    icon: Layers,
    title: "Fully Editable",
    description: "Refine, regenerate, and export any section at any time",
  },
  {
    icon: Zap,
    title: "Actionable Next Steps",
    description:
      "Each section includes concrete action items you can start today",
  },
];

export default function NewStrategyPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");

  const isValid = businessName.trim().length > 0 && industry.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-medium text-coral">
              <Sparkles className="h-3.5 w-3.5" />
              AI Strategy Builder
            </div>

            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-navy sm:text-4xl">
              Create Your Strategy
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Answer 39 strategic questions across 7 sections, and our AI will
              generate a comprehensive 15-section strategy deck tailored to your
              business. What normally takes weeks of consulting work, distilled
              into a guided questionnaire.
            </p>

            {/* Process steps */}
            <div className="mt-8 flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">
                  1
                </div>
                <div className="mt-1 h-12 w-px bg-border" />
              </div>
              <div className="pb-6">
                <p className="font-medium text-foreground">
                  Answer the questionnaire
                </p>
                <p className="text-sm text-muted-foreground">
                  39 questions across 7 sections about your business, audience,
                  and goals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">
                  2
                </div>
                <div className="mt-1 h-12 w-px bg-border" />
              </div>
              <div className="pb-6">
                <p className="font-medium text-foreground">
                  Review your answers
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure everything is accurate before generation begins
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  3
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Receive your AI strategy
                </p>
                <p className="text-sm text-muted-foreground">
                  A complete 15-section strategy deck you can refine and export
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="mt-10 max-w-md rounded-xl border border-border bg-card p-6">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-navy">
                Let&apos;s get started
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us about your business to begin.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="business-name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Business Name
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    placeholder="e.g., Acme Corp"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  href={isValid ? `/strategy/draft/questionnaire` : "#"}
                  onClick={(e) => {
                    if (!isValid) e.preventDefault();
                  }}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                    isValid
                      ? "bg-coral text-white hover:bg-coral/90"
                      : "cursor-not-allowed bg-coral/40 text-white/70"
                  }`}
                >
                  Start Strategy Builder
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar benefits */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-navy">
                What you get
              </h3>

              <div className="mt-4 space-y-5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                      <benefit.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {benefit.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-navy/5 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    4,200+ strategies generated
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    92% user satisfaction rate
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    Avg. 3.2 hours to complete
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
