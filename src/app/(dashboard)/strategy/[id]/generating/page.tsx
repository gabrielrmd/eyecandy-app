"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const STATUS_MESSAGES = [
  "Analyzing your responses...",
  "Crafting brand identity...",
  "Building market analysis...",
  "Creating channel strategy...",
  "Finalizing your deck...",
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md px-6 text-center">
        {/* Animated spinner */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          {error ? (
            <AlertCircle className="h-12 w-12 text-red-500" />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-[#2AB9B0]" />
          )}
        </div>

        {/* Status message */}
        {error ? (
          <>
            <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[#1A1A2E]">
              Generation Failed
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2AB9B0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2AB9B0]/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Generation
            </button>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[#1A1A2E]">
              Crafting Your Strategy...
            </h1>
            <p className="mt-3 h-6 text-sm font-medium text-[#2AB9B0] transition-opacity">
              {STATUS_MESSAGES[statusIndex]}
            </p>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2AB9B0] to-[#1A1A2E] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.round(Math.min(progress, 100))}%
              </p>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              This typically takes 2-3 minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
