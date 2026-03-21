"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
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

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup all timers
  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    progressRef.current = null;
    timeoutRef.current = null;
  }, []);

  // Cycle through status messages
  useEffect(() => {
    if (error || isComplete) return;
    intervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [error, isComplete]);

  // Animate progress bar (simulated, caps at 90% until completion)
  useEffect(() => {
    if (error || isComplete) return;
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 3 + 1;
      });
    }, 800);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [error, isComplete]);

  const generateStrategy = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    setError(null);
    setIsTimedOut(false);
    setIsComplete(false);
    setProgress(0);
    setStatusIndex(0);

    // Set up abort controller for timeout
    const abortController = new AbortController();
    abortRef.current = abortController;

    // 5-minute timeout
    timeoutRef.current = setTimeout(() => {
      setIsTimedOut(true);
      setError("Generation is taking longer than expected. Please try again.");
      abortController.abort();
      clearAllTimers();
    }, TIMEOUT_MS);

    try {
      const storedResponses = localStorage.getItem(
        `strategy_questionnaire_${strategyId}`
      );
      const questionnaireResponses = storedResponses
        ? JSON.parse(storedResponses)
        : undefined;

      // Generate in 5 batches of 3 sections each to fit within Vercel 60s timeout
      const TOTAL_BATCHES = 5;
      const allSections: Array<{ id: string; title: string; content: string; status: string; qualityScore: number }> = [];

      for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
        setStatusIndex(batch * 3); // Update status message to match current batch
        setProgress(Math.min(batch * 18 + 5, 88)); // 5%, 23%, 41%, 59%, 77%

        const response = await fetch("/api/ai/generate-strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy_project_id: strategyId,
            questionnaire_responses: questionnaireResponses,
            batch,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Batch ${batch + 1} generation failed`);
        }

        const data = await response.json();
        const batchSections = data.sections || [];
        allSections.push(...batchSections);
      }

      const generated = allSections;

      // Store results in localStorage as cache
      localStorage.setItem(
        `strategy_result_${strategyId}`,
        JSON.stringify(generated)
      );

      // Save all sections to database
      setStatusIndex(14); // "Creating action plan..." — final message
      try {
        await fetch("/api/ai/save-strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy_project_id: strategyId,
            sections: generated,
          }),
        });
      } catch (saveErr) {
        console.error("Failed to save strategy to DB:", saveErr);
        // Continue anyway — localStorage has the data
      }

      // Clear timeout timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Complete progress
      setProgress(100);
      setIsComplete(true);

      // Show "Strategy Complete!" for 2 seconds then redirect
      setTimeout(() => {
        router.push(`/strategy/${strategyId}/result`);
      }, 2000);
    } catch (err) {
      if (abortController.signal.aborted) return; // Already handled by timeout
      console.error("Strategy generation error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      clearAllTimers();
    }
  }, [strategyId, hasStarted, router, clearAllTimers]);

  // Start generation on mount
  useEffect(() => {
    generateStrategy();
    return () => {
      clearAllTimers();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [generateStrategy, clearAllTimers]);

  const handleRetry = () => {
    clearAllTimers();
    if (abortRef.current) abortRef.current.abort();
    setError(null);
    setIsTimedOut(false);
    setIsComplete(false);
    setHasStarted(false);
    setProgress(0);
    setStatusIndex(0);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md px-6 text-center">
        {/* Animated spinner / status icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          {error ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : isComplete ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
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
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal,#2AB9B0)] px-6 py-3 font-[family-name:var(--font-oswald)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--teal,#2AB9B0)]/90"
              >
                <RefreshCw className="h-4 w-4" />
                {isTimedOut ? "Try Again" : "Retry Generation"}
              </button>
              <Link
                href={`/strategy/${strategyId}/review`}
                className="inline-flex items-center gap-2 text-sm text-[var(--navy,#1A1A2E)]/50 transition-colors hover:text-[var(--navy,#1A1A2E)]/80"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Review
              </Link>
            </div>
          </>
        ) : isComplete ? (
          <>
            <p className="font-[family-name:var(--font-oswald)] text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">
              Complete
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
              Strategy Complete!
            </h1>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-emerald-500" />
            <p className="mt-5 font-[family-name:var(--font-oswald)] text-sm font-medium uppercase tracking-wider text-[var(--navy,#1A1A2E)]/50">
              Redirecting to your strategy...
            </p>

            {/* Progress bar at 100% */}
            <div className="mt-8">
              <div className="h-[3px] overflow-hidden rounded-full bg-[var(--navy,#1A1A2E)]/5">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-[var(--navy,#1A1A2E)]/30">
                  All 15 sections generated
                </p>
                <p className="font-[family-name:var(--font-oswald)] text-[10px] font-bold tracking-wider text-emerald-500">
                  100%
                </p>
              </div>
            </div>
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
