"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessGate } from "@/components/access-gate";
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
  Save,
  RotateCcw,
} from "lucide-react";
import { INDUSTRIES, GOALS, BUSINESS_STAGES } from "@/lib/strategy/constants";
import type { BusinessStage, Industry, Goal } from "@/lib/strategy/constants";
import { useStrategyDraft } from "@/lib/hooks/use-strategy-draft";
import {
  useFormValidation,
  type ValidationSchema,
} from "@/lib/hooks/use-form-validation";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIMITS = {
  businessName: { min: 2, max: 100 },
  customIndustry: { min: 2, max: 100 },
  mainChallenge: { min: 10, recommendedMax: 500 },
} as const;

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

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const validationSchema: ValidationSchema = {
  businessName: [
    { type: "required", message: "Business name is required." },
    {
      type: "minLength",
      value: LIMITS.businessName.min,
      message: `Business name must be at least ${LIMITS.businessName.min} characters.`,
    },
    {
      type: "maxLength",
      value: LIMITS.businessName.max,
      message: `Business name must be ${LIMITS.businessName.max} characters or fewer.`,
    },
  ],
  industry: [
    { type: "required", message: "Please select an industry." },
  ],
  customIndustry: [
    {
      type: "custom",
      validate: (v: string) => v.trim().length >= LIMITS.customIndustry.min,
      message: `Please specify your industry (at least ${LIMITS.customIndustry.min} characters).`,
    },
  ],
  businessStage: [
    { type: "required", message: "Please select a business stage." },
  ],
  mainChallenge: [
    { type: "required", message: "Main challenge is required." },
    {
      type: "minLength",
      value: LIMITS.mainChallenge.min,
      message: `Please write at least ${LIMITS.mainChallenge.min} characters.`,
    },
  ],
  goal: [{ type: "required", message: "Please select a goal." }],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewStrategyPage() {
  const router = useRouter();

  // Draft persistence hook
  const draft = useStrategyDraft();

  // Validation hook
  const validation = useFormValidation(validationSchema);

  // Track which fields the user has touched (for blur validation)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Submission state
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form values from the draft hook
  const { formState } = draft;

  // Build values map for validateAll
  const valuesMap = useMemo(
    () => ({
      businessName: formState.businessName,
      industry: formState.industry,
      customIndustry: formState.customIndustry,
      businessStage: formState.businessStage,
      mainChallenge: formState.mainChallenge,
      goal: formState.goal,
    }),
    [formState]
  );

  // Check if the form is currently valid (for button styling)
  const isFormValid =
    formState.businessName.trim().length >= LIMITS.businessName.min &&
    formState.industry !== "" &&
    (formState.industry !== "Other" ||
      formState.customIndustry.trim().length >= LIMITS.customIndustry.min) &&
    formState.businessStage !== "" &&
    formState.mainChallenge.trim().length >= LIMITS.mainChallenge.min &&
    formState.goal !== "";

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleBlur(fieldName: string) {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const value = valuesMap[fieldName as keyof typeof valuesMap] ?? "";

    // Skip customIndustry validation when industry is not "Other"
    if (fieldName === "customIndustry" && formState.industry !== "Other") return;

    validation.validateField(fieldName, value);
  }

  function showError(fieldName: string): string | undefined {
    if (!submitAttempted && !touched[fieldName]) return undefined;

    // Skip customIndustry error when industry is not "Other"
    if (fieldName === "customIndustry" && formState.industry !== "Other")
      return undefined;

    return validation.errors[fieldName];
  }

  async function handleStartStrategy() {
    setSubmitAttempted(true);

    // Build validation values, excluding customIndustry if not needed
    const toValidate = { ...valuesMap };
    if (formState.industry !== "Other") {
      toValidate.customIndustry = "skip"; // pass a value that satisfies the custom validator
    }

    const isValid = validation.validateAll(toValidate);
    if (!isValid || isCreating) return;

    setIsCreating(true);
    setSubmitError(null);

    try {
      const strategyId = await draft.startStrategy();
      if (strategyId) {
        router.push(`/strategy/${strategyId}/questionnaire`);
      } else if (draft.error) {
        setSubmitError(draft.error);
        setIsCreating(false);
      } else {
        setSubmitError("Failed to start strategy. Please try again.");
        setIsCreating(false);
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsCreating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const inputBaseClass =
    "w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20";

  function inputBorderClass(fieldName: string): string {
    return showError(fieldName) ? "border-red-400" : "border-border";
  }

  function FieldError({ name }: { name: string }) {
    const msg = showError(name);
    if (!msg) return null;
    return (
      <p className="mt-1 text-xs text-red-500" role="alert">
        {msg}
      </p>
    );
  }

  // Draft indicator
  const draftIndicator = draft.isDraftLoaded ? (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        draft.draftSource === "server"
          ? "bg-teal/10 text-teal"
          : "bg-emerald-50 text-emerald-600"
      }`}
    >
      {draft.draftSource === "server" ? (
        <RotateCcw className="h-3 w-3" />
      ) : (
        <Save className="h-3 w-3" />
      )}
      {draft.draftSource === "server"
        ? "Resuming saved draft"
        : "Resumed from local draft"}
    </div>
  ) : draft.lastSaved ? (
    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
      <Save className="h-3 w-3" />
      Draft saved
    </div>
  ) : null;

  // Loading state
  if (draft.isLoading) {
    return (
      <AccessGate requires="strategy_builder">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
        </div>
      </AccessGate>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AccessGate requires="strategy_builder">
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
                generate a comprehensive 15-section strategy deck tailored to
                your business. What normally takes weeks of consulting work,
                distilled into a guided questionnaire.
              </p>

              {/* Form card */}
              <div className="mt-10 max-w-md rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
                      Let&apos;s get started
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tell us about your business to begin.
                    </p>
                  </div>
                  {draftIndicator}
                </div>

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
                      maxLength={LIMITS.businessName.max}
                      value={formState.businessName}
                      onChange={(e) => draft.setBusinessName(e.target.value)}
                      onBlur={() => handleBlur("businessName")}
                      className={`${inputBaseClass} ${inputBorderClass("businessName")}`}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <FieldError name="businessName" />
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formState.businessName.trim().length}/
                        {LIMITS.businessName.max}
                      </span>
                    </div>
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
                      value={formState.industry}
                      onChange={(e) =>
                        draft.setIndustry(e.target.value as Industry | "")
                      }
                      onBlur={() => handleBlur("industry")}
                      className={`${inputBaseClass} appearance-none ${inputBorderClass("industry")}`}
                    >
                      <option value="">Select your industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                    <FieldError name="industry" />
                    {formState.industry === "Other" && (
                      <>
                        <input
                          type="text"
                          placeholder="Please specify your industry..."
                          value={formState.customIndustry}
                          onChange={(e) =>
                            draft.setCustomIndustry(e.target.value)
                          }
                          onBlur={() => handleBlur("customIndustry")}
                          className={`mt-2 ${inputBaseClass} border-dashed ${inputBorderClass("customIndustry")}`}
                          autoFocus
                        />
                        <FieldError name="customIndustry" />
                      </>
                    )}
                  </div>

                  {/* Business Stage */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Business Stage
                    </label>
                    <div className="flex flex-col gap-2">
                      {BUSINESS_STAGES.map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                            formState.businessStage === option.value
                              ? "border-coral bg-coral/5 text-foreground"
                              : showError("businessStage")
                                ? "border-red-300 bg-background text-foreground hover:bg-muted"
                                : "border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          <input
                            type="radio"
                            name="business-stage"
                            value={option.value}
                            checked={formState.businessStage === option.value}
                            onChange={(e) =>
                              draft.setBusinessStage(
                                e.target.value as BusinessStage
                              )
                            }
                            onBlur={() => handleBlur("businessStage")}
                            className="h-4 w-4 accent-coral"
                          />
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <FieldError name="businessStage" />
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
                      value={formState.mainChallenge}
                      onChange={(e) => draft.setMainChallenge(e.target.value)}
                      onBlur={() => handleBlur("mainChallenge")}
                      className={`${inputBaseClass} ${inputBorderClass("mainChallenge")}`}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <FieldError name="mainChallenge" />
                      <span
                        className={`ml-auto text-xs ${
                          formState.mainChallenge.trim().length >
                          LIMITS.mainChallenge.recommendedMax
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formState.mainChallenge.trim().length}/
                        {LIMITS.mainChallenge.recommendedMax}
                      </span>
                    </div>
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
                      value={formState.goal}
                      onChange={(e) =>
                        draft.setGoal(e.target.value as Goal | "")
                      }
                      onBlur={() => handleBlur("goal")}
                      className={`${inputBaseClass} appearance-none ${inputBorderClass("goal")}`}
                    >
                      <option value="">Select your primary goal</option>
                      {GOALS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <FieldError name="goal" />
                  </div>

                  {(submitError || draft.error) && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submitError || draft.error}
                    </div>
                  )}

                  <button
                    onClick={handleStartStrategy}
                    disabled={isCreating || draft.isSaving}
                    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                      isFormValid && !isCreating
                        ? "bg-coral text-white hover:bg-coral/90"
                        : "cursor-not-allowed bg-coral/40 text-white/70"
                    }`}
                  >
                    {isCreating || draft.isSaving ? (
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
    </AccessGate>
  );
}
