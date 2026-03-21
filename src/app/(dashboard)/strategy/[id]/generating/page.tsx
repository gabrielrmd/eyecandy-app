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

// Section titles — used for status messages and to derive batch count
const SECTION_TITLES = [
  "Brand Story & Origin",
  "Market Analysis",
  "Target Audience Profile",
  "Brand Positioning Statement",
  "Competitive Analysis Matrix",
  "Brand Archetype & Personality",
  "Brand Values & Mission",
  "Jobs-To-Be-Done Framework",
  "Customer Journey Map",
  "Tone of Voice Guidelines",
  "Visual Identity Direction",
  "Mood Board & Visual References",
  "Communication Strategy",
  "Growth Roadmap",
  "Action Plan & Implementation",
];

const TOTAL_SECTIONS = SECTION_TITLES.length;
const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

type GenerationState =
  | { phase: "idle" }
  | { phase: "generating"; currentBatch: number; completedBatches: number }
  | { phase: "saving" }
  | { phase: "complete" }
  | { phase: "error"; message: string; failedBatch: number | null };

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [state, setState] = useState<GenerationState>({ phase: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);

  const progress =
    state.phase === "generating"
      ? Math.round((state.completedBatches / TOTAL_SECTIONS) * 90)
      : state.phase === "saving"
        ? 95
        : state.phase === "complete"
          ? 100
          : 0;

  const statusText =
    state.phase === "generating"
      ? SECTION_TITLES[state.currentBatch] ?? "Generating..."
      : state.phase === "saving"
        ? "Saving your strategy..."
        : state.phase === "complete"
          ? "Strategy Complete!"
          : "";

  const chapterDisplay =
    state.phase === "generating"
      ? `Chapter ${String(state.currentBatch + 1).padStart(2, "0")} of ${String(TOTAL_SECTIONS).padStart(2, "0")}`
      : state.phase === "saving"
        ? `Saving ${TOTAL_SECTIONS} sections`
        : state.phase === "complete"
          ? `All ${TOTAL_SECTIONS} sections generated`
          : "";

  const runGeneration = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const abortController = new AbortController();
    abortRef.current = abortController;

    // Set a hard timeout
    timeoutRef.current = setTimeout(() => {
      abortController.abort();
      setState({
        phase: "error",
        message:
          "Generation timed out after 5 minutes. This usually means the AI service is slow. Please try again.",
        failedBatch: null,
      });
    }, TIMEOUT_MS);

    // Load questionnaire responses from localStorage
    const storedResponses = localStorage.getItem(
      `strategy_questionnaire_${strategyId}`
    );
    const questionnaireResponses = storedResponses
      ? JSON.parse(storedResponses)
      : undefined;

    const allSections: Array<{
      id: string;
      title: string;
      content: string;
      status: string;
      qualityScore: number;
    }> = [];

    // Generate one section at a time
    for (let batch = 0; batch < TOTAL_SECTIONS; batch++) {
      // Check if aborted
      if (abortController.signal.aborted) return;

      setState({
        phase: "generating",
        currentBatch: batch,
        completedBatches: batch,
      });

      try {
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
          let errorMsg = `Section ${batch + 1} failed (HTTP ${response.status})`;
          try {
            const errData = await response.json();
            if (errData.error) errorMsg = errData.error;
          } catch {
            // ignore parse error
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const batchSections = data.sections || [];

        if (batchSections.length === 0) {
          throw new Error(
            `Section ${batch + 1} returned empty. The AI may have failed to generate content.`
          );
        }

        allSections.push(...batchSections);
      } catch (err) {
        if (abortController.signal.aborted) return;

        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error(`Batch ${batch} failed:`, message);

        setState({
          phase: "error",
          message: `Failed generating "${SECTION_TITLES[batch]}": ${message}`,
          failedBatch: batch,
        });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        return; // Stop — don't continue with partial results
      }
    }

    // All sections generated — save to DB
    if (abortController.signal.aborted) return;
    setState({ phase: "saving" });

    // Cache in localStorage
    localStorage.setItem(
      `strategy_result_${strategyId}`,
      JSON.stringify(allSections)
    );

    // Save to database
    try {
      const saveResponse = await fetch("/api/ai/save-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_project_id: strategyId,
          sections: allSections,
        }),
      });

      if (!saveResponse.ok) {
        console.error("DB save failed, but localStorage has the data");
      }
    } catch (saveErr) {
      console.error("DB save error:", saveErr);
      // Continue — localStorage has the data
    }

    // Clear timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Complete
    setState({ phase: "complete" });

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push(`/strategy/${strategyId}/result`);
    }, 2000);
  }, [strategyId, router]);

  // Start generation on mount (once)
  useEffect(() => {
    runGeneration();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [runGeneration]);

  const handleRetry = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortRef.current) abortRef.current.abort();
    startedRef.current = false;
    setState({ phase: "idle" });
    // Re-trigger by resetting the ref — the effect will fire again
    setTimeout(() => runGeneration(), 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md px-6 text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          {state.phase === "error" ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : state.phase === "complete" ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          ) : (
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--teal,#2AB9B0)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-[family-name:var(--font-oswald)] text-[10px] font-bold text-[var(--navy,#1A1A2E)]/50">
                  {state.phase === "generating"
                    ? String(state.currentBatch + 1).padStart(2, "0")
                    : "..."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {state.phase === "error" ? (
          <>
            <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
              Generation Failed
            </h1>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-red-400" />
            <p className="mt-4 text-sm text-[var(--navy,#1A1A2E)]/60">
              {state.message}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal,#2AB9B0)] px-6 py-3 font-[family-name:var(--font-oswald)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--teal,#2AB9B0)]/90"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Generation
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
        ) : state.phase === "complete" ? (
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
            <div className="mt-8">
              <div className="h-[3px] overflow-hidden rounded-full bg-[var(--navy,#1A1A2E)]/5">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
              <p className="mt-3 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-emerald-500">
                All {TOTAL_SECTIONS} sections generated — 100%
              </p>
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
            <p className="mt-5 h-6 font-[family-name:var(--font-oswald)] text-sm font-medium uppercase tracking-wider text-[var(--navy,#1A1A2E)]/50">
              {statusText}
            </p>

            <div className="mt-8">
              <div className="h-[3px] overflow-hidden rounded-full bg-[var(--navy,#1A1A2E)]/5">
                <div
                  className="h-full rounded-full bg-[var(--teal,#2AB9B0)] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-[var(--navy,#1A1A2E)]/30">
                  {chapterDisplay}
                </p>
                <p className="font-[family-name:var(--font-oswald)] text-[10px] font-bold tracking-wider text-[var(--navy,#1A1A2E)]/40">
                  {progress}%
                </p>
              </div>
            </div>

            <p className="mt-8 text-[12px] text-[var(--navy,#1A1A2E)]/30">
              This typically takes 3-5 minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
