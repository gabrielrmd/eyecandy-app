"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BusinessStage, Industry, Goal } from "@/lib/strategy/constants";
import { INDUSTRIES } from "@/lib/strategy/constants";

// --- Types ---

export interface StrategyDraftState {
  businessName: string;
  industry: Industry | "";
  customIndustry: string;
  businessStage: BusinessStage | "";
  mainChallenge: string;
  goal: Goal | "";
}

const EMPTY_DRAFT: StrategyDraftState = {
  businessName: "",
  industry: "",
  customIndustry: "",
  businessStage: "",
  mainChallenge: "",
  goal: "",
};

const LOCAL_STORAGE_KEY = "strategy-draft";
const DEBOUNCE_MS = 1500;

// --- Helpers ---

function readLocalDraft(): StrategyDraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.businessName === "string") {
      return { ...EMPTY_DRAFT, ...parsed };
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocalDraft(state: StrategyDraftState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

function clearLocalDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/** Convert a snake_case DB row into our camelCase form state */
function rowToFormState(row: Record<string, unknown>): StrategyDraftState {
  const industry = (row.industry as string) || "";
  const validIndustry = INDUSTRIES.includes(industry as Industry)
    ? (industry as Industry)
    : industry
      ? "Other"
      : "";

  return {
    businessName: (row.business_name as string) || (row.title as string) || "",
    industry: validIndustry as Industry | "",
    customIndustry:
      validIndustry === "Other"
        ? (row.custom_industry as string) || industry
        : (row.custom_industry as string) || "",
    businessStage: (row.business_stage as BusinessStage) || "",
    mainChallenge: (row.main_challenge as string) || "",
    goal: (row.primary_goal as Goal) || "",
  };
}

/** Convert our camelCase form state to snake_case for the API */
function formStateToPayload(state: StrategyDraftState) {
  return {
    business_name: state.businessName.trim(),
    industry: state.industry,
    custom_industry: state.industry === "Other" ? state.customIndustry.trim() : "",
    business_stage: state.businessStage || undefined,
    main_challenge: state.mainChallenge,
    primary_goal: state.goal,
  };
}

// --- Hook ---

export function useStrategyDraft() {
  const [formState, setFormState] = useState<StrategyDraftState>(EMPTY_DRAFT);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [draftSource, setDraftSource] = useState<
    "server" | "local" | null
  >(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // --- Load draft on mount ---

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/strategy/draft");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.draft) {
            setFormState(rowToFormState(data.draft));
            setDraftId(data.draft.id);
            setIsDraftLoaded(true);
            setDraftSource("server");
            initialLoadDone.current = true;
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Server unavailable — fall through to localStorage
      }

      // Fallback to localStorage
      if (!cancelled) {
        const local = readLocalDraft();
        if (local && hasContent(local)) {
          setFormState(local);
          setIsDraftLoaded(true);
          setDraftSource("local");
        }
        initialLoadDone.current = true;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Debounced localStorage save ---

  useEffect(() => {
    if (!initialLoadDone.current || isLoading) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (hasContent(formState)) {
        writeLocalDraft(formState);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [formState, isLoading]);

  // --- Field setters ---

  const setField = useCallback(
    <K extends keyof StrategyDraftState>(
      field: K,
      value: StrategyDraftState[K]
    ) => {
      setFormState((prev) => {
        const next = { ...prev, [field]: value };
        // Clear custom industry when switching away from "Other"
        if (field === "industry" && value !== "Other") {
          next.customIndustry = "";
        }
        return next;
      });
      setError(null);
    },
    []
  );

  const setBusinessName = useCallback(
    (v: string) => setField("businessName", v),
    [setField]
  );
  const setIndustry = useCallback(
    (v: Industry | "") => setField("industry", v),
    [setField]
  );
  const setCustomIndustry = useCallback(
    (v: string) => setField("customIndustry", v),
    [setField]
  );
  const setBusinessStage = useCallback(
    (v: BusinessStage | "") => setField("businessStage", v),
    [setField]
  );
  const setMainChallenge = useCallback(
    (v: string) => setField("mainChallenge", v),
    [setField]
  );
  const setGoal = useCallback(
    (v: Goal | "") => setField("goal", v),
    [setField]
  );

  // --- Save draft to server ---

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/strategy/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formStateToPayload(formState)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save draft");
      }

      const data = await res.json();
      if (data.draft?.id) {
        setDraftId(data.draft.id);
      }
      clearLocalDraft();
      setLastSaved(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [formState]);

  // --- Start strategy ---

  const startStrategy = useCallback(async (): Promise<string | null> => {
    setIsSaving(true);
    setError(null);

    try {
      // If we have a draft ID, save it first then start
      if (draftId) {
        // Save latest form data to the draft
        const saveRes = await fetch("/api/strategy/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formStateToPayload(formState)),
        });

        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save draft before starting");
        }

        // Transition draft to in_progress
        const res = await fetch("/api/strategy/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_id: draftId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to start strategy");
        }

        const data = await res.json();
        clearLocalDraft();
        return data.strategy_id ?? null;
      }

      // No draft ID — direct create flow
      const res = await fetch("/api/strategy/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formStateToPayload(formState)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start strategy");
      }

      const data = await res.json();
      clearLocalDraft();
      return data.strategy_id ?? null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start strategy";
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [formState, draftId]);

  return {
    formState,
    draftId,
    isLoading,
    isSaving,
    isDraftLoaded,
    draftSource,
    lastSaved,
    error,

    setField,
    setBusinessName,
    setIndustry,
    setCustomIndustry,
    setBusinessStage,
    setMainChallenge,
    setGoal,

    saveDraft,
    startStrategy,
  };
}

// --- Utility ---

function hasContent(state: StrategyDraftState): boolean {
  return !!(
    state.businessName.trim() ||
    state.industry ||
    state.businessStage ||
    state.mainChallenge.trim() ||
    state.goal
  );
}
