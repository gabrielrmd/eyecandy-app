"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

const GOALS = [
  "Increase brand awareness",
  "Generate more leads",
  "Boost online sales",
  "Launch a new product",
  "Enter a new market",
  "Improve customer retention",
  "Build a community",
  "Establish thought leadership",
  "Rebrand / reposition",
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
    title: "Ready in Minutes",
    description:
      "What normally takes weeks of consulting, generated in minutes",
  },
  {
    icon: BarChart3,
    title: "Data-Driven",
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

type BusinessStage = "idea" | "mvp" | "revenue";

export default function NewStrategyPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [businessStage, setBusinessStage] = useState<BusinessStage | "">("");
  const [mainChallenge, setMainChallenge] = useState("");
  const [goal, setGoal] = useState("");
  const [goalOther, setGoalOther] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedIndustry = industry === "Other" ? industryOther.trim() : industry;
  const resolvedGoal = goal === "Other" ? goalOther.trim() : goal;

  const isValid =
    businessName.trim().length > 0 &&
    resolvedIndustry.length > 0 &&
    businessStage.length > 0 &&
    mainChallenge.trim().length > 0 &&
    resolvedGoal.length > 0;

  async function handleStartStrategy() {
    if (!isValid || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to create a strategy.");
        setIsCreating(false);
        return;
      }

      const description = [
        `Industry: ${resolvedIndustry}`,
        `Stage: ${businessStage}`,
        `Challenge: ${mainChallenge.trim()}`,
        `Goal: ${resolvedGoal}`,
      ].join(" | ");

      const { data, error: insertError } = await supabase
        .from("strategy_projects")
        .insert({
          user_id: user.id,
          title: businessName.trim(),
          description,
          status: "in_progress",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating strategy project:", insertError);
        setError("Failed to create strategy project. Please try again.");
        setIsCreating(false);
        return;
      }

      router.push(`/strategy/${data.id}/questionnaire`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsCreating(false);
    }
  }

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

            <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-navy sm:text-4xl">
              Create Your Strategy
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Answer 39 strategic questions across 7 sections, and our AI will
              generate a comprehensive 15-section strategy deck tailored to your
              business. What normally takes weeks of consulting work, distilled
              into a guided questionnaire.
            </p>

            {/* Form */}
            <div className="mt-10 max-w-md rounded-xl border border-border bg-card p-6">
              <h2 className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
                Let&apos;s get started
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us about your business to begin.
              </p>

              <div className="mt-5 space-y-4">
                {/* Business Name */}
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

                {/* Industry */}
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
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (e.target.value !== "Other") setIndustryOther("");
                    }}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  {industry === "Other" && (
                    <input
                      type="text"
                      placeholder="Please specify your industry..."
                      value={industryOther}
                      onChange={(e) => setIndustryOther(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-dashed border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      autoFocus
                    />
                  )}
                </div>

                {/* Business Stage */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Business Stage
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "idea" as const, label: "Idea Stage", desc: "Still planning and validating" },
                      { value: "mvp" as const, label: "MVP / Early Stage", desc: "Product built, testing the market" },
                      { value: "revenue" as const, label: "Revenue Generating", desc: "Active customers and revenue" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                          businessStage === option.value
                            ? "border-coral bg-coral/5 text-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="business-stage"
                          value={option.value}
                          checked={businessStage === option.value}
                          onChange={(e) =>
                            setBusinessStage(e.target.value as BusinessStage)
                          }
                          className="h-4 w-4 accent-coral"
                        />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {option.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Main Challenge */}
                <div>
                  <label
                    htmlFor="main-challenge"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Main Challenge
                  </label>
                  <textarea
                    id="main-challenge"
                    rows={3}
                    placeholder="What is the biggest challenge your business is facing right now?"
                    value={mainChallenge}
                    onChange={(e) => setMainChallenge(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label
                    htmlFor="goal"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Goal
                  </label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => {
                      setGoal(e.target.value);
                      if (e.target.value !== "Other") setGoalOther("");
                    }}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                  >
                    <option value="">Select your primary goal</option>
                    {GOALS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {goal === "Other" && (
                    <input
                      type="text"
                      placeholder="Please specify your goal..."
                      value={goalOther}
                      onChange={(e) => setGoalOther(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-dashed border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      autoFocus
                    />
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStartStrategy}
                  disabled={!isValid || isCreating}
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                    isValid && !isCreating
                      ? "bg-coral text-white hover:bg-coral/90"
                      : "cursor-not-allowed bg-coral/40 text-white/70"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Start Strategy Builder
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar benefits */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-navy">
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
                    Built on 15+ years of strategy consulting experience
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    Powered by analysis of 1,000+ successful brand strategies
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-foreground">
                    Used by entrepreneurs across 30+ countries
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
