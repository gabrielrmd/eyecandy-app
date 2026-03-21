"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const STATUS_MESSAGES = [
  "Crafting your brand story...",
  "Analyzing market landscape...",
  "Profiling target audience...",
  "Defining brand positioning...",
  "Mapping competitive landscape...",
  "Discovering brand archetype...",
  "Defining values & mission...",
  "Analyzing jobs-to-be-done...",
  "Mapping customer journey...",
  "Establishing tone of voice...",
  "Directing visual identity...",
  "Curating mood board...",
  "Building communication strategy...",
  "Planning growth roadmap...",
  "Creating action plan...",
];

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle through status messages
  useEffect(() => {
    if (error) return;
    intervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [error]);

  // Animate progress bar (simulated, caps at 90% until completion)
  useEffect(() => {
    if (error) return;
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 3 + 1;
      });
    }, 800);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [error]);

  const generateStrategy = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    setError(null);
    setProgress(0);
    setStatusIndex(0);

    try {
      const storedResponses = localStorage.getItem(
        `strategy_questionnaire_${strategyId}`
      );
      const questionnaireResponses = storedResponses
        ? JSON.parse(storedResponses)
        : undefined;

      const response = await fetch("/api/ai/generate-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_project_id: strategyId,
          questionnaire_responses: questionnaireResponses,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Strategy generation failed");
      }

      const data = await response.json();
      const generated = data.sections || [];

      // Store results in localStorage
      localStorage.setItem(
        `strategy_result_${strategyId}`,
        JSON.stringify(generated)
      );

      // Complete progress
      setProgress(100);

      // Brief pause then redirect
      setTimeout(() => {
        router.push(`/strategy/${strategyId}/result`);
      }, 1500);
    } catch (err) {
      console.error("Strategy generation error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    }
  }, [strategyId, hasStarted, router]);

  // Start generation on mount
  useEffect(() => {
    generateStrategy();
  }, [generateStrategy]);

  const handleRetry = () => {
    setError(null);
    setHasStarted(false);
    setProgress(0);
    setStatusIndex(0);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md px-6 text-center">
        {/* Animated spinner */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          {error ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--teal,#2AB9B0)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-[family-name:var(--font-oswald)] text-[10px] font-bold text-[var(--navy,#1A1A2E)]/50">
                  {String(statusIndex + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status message */}
        {error ? (
          <>
            <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
              Generation Failed
            </h1>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-red-400" />
            <p className="mt-4 text-sm text-[var(--navy,#1A1A2E)]/60">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--teal,#2AB9B0)] px-6 py-3 font-[family-name:var(--font-oswald)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--teal,#2AB9B0)]/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Generation
            </button>
          </>
        ) : (
          <>
            <p className="font-[family-name:var(--font-oswald)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--teal,#2AB9B0)]">
              Generating
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
              Brand Strategy Deck
            </h1>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-[var(--teal,#2AB9B0)]" />
            <p className="mt-5 h-6 font-[family-name:var(--font-oswald)] text-sm font-medium uppercase tracking-wider text-[var(--navy,#1A1A2E)]/50 transition-opacity">
              {STATUS_MESSAGES[statusIndex]}
            </p>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="h-[3px] overflow-hidden rounded-full bg-[var(--navy,#1A1A2E)]/5">
                <div
                  className="h-full rounded-full bg-[var(--teal,#2AB9B0)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-[var(--navy,#1A1A2E)]/30">
                  Chapter {String(statusIndex + 1).padStart(2, "0")} of 15
                </p>
                <p className="font-[family-name:var(--font-oswald)] text-[10px] font-bold tracking-wider text-[var(--navy,#1A1A2E)]/40">
                  {Math.round(Math.min(progress, 100))}%
                </p>
              </div>
            </div>

            <p className="mt-8 text-[12px] text-[var(--navy,#1A1A2E)]/30">
              This typically takes 2-3 minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
