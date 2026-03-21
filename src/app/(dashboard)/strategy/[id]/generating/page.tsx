"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Megaphone,
  PenTool,
  Globe,
  Mail,
  Search,
  DollarSign,
  LineChart,
  Lightbulb,
  Route,
  Shield,
  Rocket,
  AlertCircle,
} from "lucide-react";

interface StrategySection {
  id: string;
  title: string;
  icon: typeof Target;
  status: "pending" | "generating" | "complete" | "error";
  qualityScore: number | null;
}

interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  status: "complete" | "error";
  qualityScore: number;
}

const INITIAL_SECTIONS: StrategySection[] = [
  { id: "exec-summary", title: "Executive Summary", icon: Sparkles, status: "pending", qualityScore: null },
  { id: "market-analysis", title: "Market Analysis", icon: BarChart3, status: "pending", qualityScore: null },
  { id: "brand-positioning", title: "Brand Positioning", icon: PenTool, status: "pending", qualityScore: null },
];

const FUTURE_SECTIONS: StrategySection[] = [
  { id: "target-audience", title: "Target Audience Profiles", icon: Users, status: "pending", qualityScore: null },
  { id: "competitive-position", title: "Competitive Positioning", icon: Target, status: "pending", qualityScore: null },
  { id: "value-prop", title: "Value Proposition Framework", icon: Lightbulb, status: "pending", qualityScore: null },
  { id: "content-strategy", title: "Content Strategy", icon: Megaphone, status: "pending", qualityScore: null },
  { id: "channel-strategy", title: "Channel Strategy", icon: Globe, status: "pending", qualityScore: null },
  { id: "email-strategy", title: "Email Marketing Plan", icon: Mail, status: "pending", qualityScore: null },
  { id: "seo-strategy", title: "SEO & Search Strategy", icon: Search, status: "pending", qualityScore: null },
  { id: "budget-allocation", title: "Budget Allocation", icon: DollarSign, status: "pending", qualityScore: null },
  { id: "kpi-framework", title: "KPI Framework", icon: LineChart, status: "pending", qualityScore: null },
  { id: "growth-roadmap", title: "Growth Roadmap", icon: Route, status: "pending", qualityScore: null },
  { id: "risk-mitigation", title: "Risk Mitigation", icon: Shield, status: "pending", qualityScore: null },
  { id: "action-plan", title: "90-Day Action Plan", icon: Rocket, status: "pending", qualityScore: null },
];

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<StrategySection[]>([
    ...INITIAL_SECTIONS,
    ...FUTURE_SECTIONS,
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const completedCount = sections.filter(
    (s) => s.status === "complete" || s.status === "error"
  ).length;
  const totalActive = INITIAL_SECTIONS.length;
  const progress = Math.round((completedCount / sections.length) * 100);

  const generateStrategy = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);

    // Mark the active sections as generating
    setSections((prev) =>
      prev.map((s) => {
        const isActive = INITIAL_SECTIONS.some((init) => init.id === s.id);
        return isActive ? { ...s, status: "generating" } : s;
      })
    );

    try {
      const response = await fetch("/api/ai/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_project_id: strategyId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Strategy generation failed");
      }

      const data = await response.json();
      const generated: GeneratedSection[] = data.sections || [];

      // Update sections with results
      setSections((prev) =>
        prev.map((s) => {
          const result = generated.find((g) => g.id === s.id);
          if (result) {
            return {
              ...s,
              status: result.status === "complete" ? "complete" : "error",
              qualityScore: result.qualityScore,
            };
          }
          return s;
        })
      );

      setIsComplete(true);
    } catch (err) {
      console.error("Strategy generation error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);

      // Mark generating sections as errored
      setSections((prev) =>
        prev.map((s) =>
          s.status === "generating" ? { ...s, status: "error" } : s
        )
      );
    }
  }, [strategyId, hasStarted]);

  // Start generation on mount
  useEffect(() => {
    generateStrategy();
  }, [generateStrategy]);

  // Auto-redirect when done
  useEffect(() => {
    if (!isComplete) return;
    const timer = setTimeout(() => {
      router.push(`/strategy/${strategyId}/result`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isComplete, router, strategyId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10">
            {isComplete ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : error ? (
              <AlertCircle className="h-8 w-8 text-red-500" />
            ) : (
              <Sparkles className="h-8 w-8 animate-pulse text-coral" />
            )}
          </div>
          <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy sm:text-3xl">
            {isComplete
              ? "Your Strategy is Ready!"
              : error
                ? "Generation Error"
                : "Crafting Your Strategy..."}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isComplete
              ? "Redirecting you to your strategy deck in a moment..."
              : error
                ? error
                : `Generating ${totalActive} key sections via AI. This may take a minute.`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {completedCount} of {sections.length} sections
            </span>
            <span className="font-medium text-coral">{progress}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral to-teal transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {!isComplete && !error && (
            <p className="mt-2 text-xs text-muted-foreground">
              Remaining sections will be available in future updates.
            </p>
          )}
        </div>

        {/* Section list */}
        <div className="mt-8 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  section.status === "generating"
                    ? "border border-coral/20 bg-coral/5"
                    : section.status === "complete"
                      ? "bg-card"
                      : section.status === "error"
                        ? "border border-red-200 bg-red-50"
                        : "bg-card opacity-50"
                }`}
              >
                {/* Status icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {section.status === "complete" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : section.status === "generating" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-coral" />
                  ) : section.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                </div>

                {/* Section icon + title */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      section.status === "generating"
                        ? "text-coral"
                        : section.status === "complete"
                          ? "text-foreground"
                          : section.status === "error"
                            ? "text-red-500"
                            : "text-muted-foreground/50"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      section.status === "generating"
                        ? "font-medium text-coral"
                        : section.status === "complete"
                          ? "text-foreground"
                          : section.status === "error"
                            ? "text-red-600"
                            : "text-muted-foreground"
                    }`}
                  >
                    {section.title}
                  </span>
                  {section.status === "generating" && (
                    <span className="ml-1 text-xs text-coral/70">
                      Generating...
                    </span>
                  )}
                  {section.status === "error" && (
                    <span className="ml-1 text-xs text-red-500">
                      Failed
                    </span>
                  )}
                </div>

                {/* Quality score */}
                {section.qualityScore !== null && section.qualityScore > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      section.qualityScore >= 95
                        ? "bg-emerald-100 text-emerald-700"
                        : section.qualityScore >= 90
                          ? "bg-teal/10 text-teal"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {section.qualityScore}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Complete state */}
        {isComplete && (
          <div className="mt-8 text-center">
            <a
              href={`/strategy/${strategyId}/result`}
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral/90"
            >
              View Your Strategy
              <Rocket className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Error retry */}
        {error && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setError(null);
                setHasStarted(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral/90"
            >
              Retry Generation
              <Rocket className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
