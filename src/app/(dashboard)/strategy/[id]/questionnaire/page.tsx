"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  Loader2,
  HelpCircle,
  AlertCircle,
  Sparkles,
  SkipForward,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  placeholder: string;
  options: (string | { label: string; value: string })[] | null;
  required: boolean;
  help_text: string | null;
  question_number: number;
}

interface Section {
  id: string;
  section_name: string;
  section_description: string;
  section_number: number;
  questions: Question[];
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AiSuggestion {
  loading: boolean;
  suggestions: string[];
  visible: boolean;
}

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [responseRowId, setResponseRowId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<
    Record<string, AiSuggestion>
  >({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useRef(createClient());

  // Fetch sections, questions, and existing responses on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Check that the user is authenticated
        const {
          data: { user },
        } = await supabase.current.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Check that the strategy project exists and belongs to this user
        const { data: project, error: projectError } = await supabase.current
          .from("strategy_projects")
          .select("id")
          .eq("id", strategyId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (projectError) throw projectError;
        if (!project) {
          router.push("/strategy/new");
          return;
        }

        // Fetch sections ordered by section_number
        const { data: sectionsData, error: sectionsError } =
          await supabase.current
            .from("questionnaire_sections")
            .select("id, section_name, section_description, section_number")
            .order("section_number", { ascending: true });

        if (sectionsError) throw sectionsError;
        if (!sectionsData || sectionsData.length === 0) {
          setError("No questionnaire sections found.");
          setLoading(false);
          return;
        }

        // Fetch all questions ordered by question_number
        const { data: questionsData, error: questionsError } =
          await supabase.current
            .from("questionnaire_questions")
            .select(
              "id, section_id, question_text, question_type, placeholder, options, required, help_text, question_number"
            )
            .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // Group questions into sections
        const assembled: Section[] = sectionsData.map((sec) => ({
          id: sec.id,
          section_name: sec.section_name,
          section_description: sec.section_description ?? "",
          section_number: sec.section_number,
          questions: (questionsData ?? [])
            .filter((q) => q.section_id === sec.id)
            .map((q) => ({
              id: q.id,
              question_text: q.question_text,
              question_type: q.question_type as
                | "text"
                | "textarea"
                | "select",
              placeholder: q.placeholder ?? "",
              options: q.options,
              required: q.required ?? false,
              help_text: q.help_text,
              question_number: q.question_number,
            })),
        }));

        setSections(assembled);

        // Load existing responses for this strategy project
        const { data: responseRow } = await supabase.current
          .from("questionnaire_responses")
          .select("*")
          .eq("strategy_project_id", strategyId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (responseRow) {
          setResponseRowId(responseRow.id);
          // Reconstruct answers from section_N_responses columns
          const loaded: Record<string, string> = {};
          for (let i = 1; i <= 7; i++) {
            const sectionResponses =
              responseRow[
                `section_${i}_responses` as keyof typeof responseRow
              ];
            if (
              sectionResponses &&
              typeof sectionResponses === "object" &&
              !Array.isArray(sectionResponses)
            ) {
              const responses = sectionResponses as Record<string, string>;
              Object.entries(responses).forEach(([questionId, answer]) => {
                if (answer) loaded[questionId] = answer;
              });
            }
          }
          setAnswers(loaded);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load questionnaire";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [strategyId, router]);

  const currentSection = sections[currentSectionIdx];

  // Calculate completion per section
  const sectionCompletion = sections.map((section) => {
    const answered = section.questions.filter(
      (q) => answers[q.id]?.trim()
    ).length;
    return { total: section.questions.length, answered };
  });

  const totalQuestions = sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );
  const totalAnswered = Object.values(answers).filter(
    (v) => v.trim()
  ).length;
  const overallProgress =
    totalQuestions > 0
      ? Math.round((totalAnswered / totalQuestions) * 100)
      : 0;

  // Build the section_N_responses payload from current answers
  const buildSectionPayload = useCallback(
    (currentAnswers: Record<string, string>) => {
      const payload: Record<string, Record<string, string>> = {};
      sections.forEach((section) => {
        const sectionKey = `section_${section.section_number}_responses`;
        const sectionResponses: Record<string, string> = {};
        section.questions.forEach((q) => {
          if (currentAnswers[q.id] !== undefined) {
            sectionResponses[q.id] = currentAnswers[q.id];
          }
        });
        payload[sectionKey] = sectionResponses;
      });
      return payload;
    },
    [sections]
  );

  // Compute completed_sections array and all_sections_completed flag
  const computeCompletionMeta = useCallback(
    (currentAnswers: Record<string, string>) => {
      const completedSections: number[] = [];
      sections.forEach((section) => {
        const allAnswered = section.questions.every(
          (q) => !q.required || currentAnswers[q.id]?.trim()
        );
        if (allAnswered && section.questions.length > 0) {
          completedSections.push(section.section_number);
        }
      });
      return {
        completed_sections: completedSections,
        all_sections_completed: completedSections.length === sections.length,
      };
    },
    [sections]
  );

  // Save responses to Supabase
  const saveResponses = useCallback(
    async (currentAnswers: Record<string, string>) => {
      const {
        data: { user },
      } = await supabase.current.auth.getUser();
      if (!user) return;

      setSaveStatus("saving");

      try {
        const sectionPayload = buildSectionPayload(currentAnswers);
        const completionMeta = computeCompletionMeta(currentAnswers);

        if (responseRowId) {
          const { error: updateError } = await supabase.current
            .from("questionnaire_responses")
            .update({
              ...sectionPayload,
              ...completionMeta,
            })
            .eq("id", responseRowId);

          if (updateError) throw updateError;
        } else {
          const { data: newRow, error: insertError } = await supabase.current
            .from("questionnaire_responses")
            .insert({
              strategy_project_id: strategyId,
              user_id: user.id,
              ...sectionPayload,
              ...completionMeta,
            })
            .select("id")
            .single();

          if (insertError) throw insertError;
          if (newRow) setResponseRowId(newRow.id);
        }

        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [strategyId, responseRowId, buildSectionPayload, computeCompletionMeta]
  );

  // Debounced auto-save
  const latestAnswers = useRef(answers);
  latestAnswers.current = answers;

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveResponses(latestAnswers.current);
    }, 1500);
  }, [saveResponses]);

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaveStatus("idle");
    scheduleSave();
  };

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // AI suggestion handler
  const handleAiHelp = async (question: Question) => {
    const questionId = question.id;

    setAiSuggestions((prev) => ({
      ...prev,
      [questionId]: { loading: true, suggestions: [], visible: true },
    }));

    try {
      // Gather context from answers
      const businessName =
        Object.values(answers).find((v) => v.trim())?.trim() ?? "";
      const currentAnswer = answers[questionId] ?? "";

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question.question_text,
          current_answer: currentAnswer,
          context: {
            business_name: businessName,
            section: currentSection?.section_name ?? "",
            existing_answers: answers,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to get suggestions");

      const data = await res.json();
      // API returns { suggestions: [{ text, explanation, relevance_score }] }
      const rawSuggestions = data.suggestions ?? [];
      const suggestions: string[] = rawSuggestions.map((s: string | { text: string }) =>
        typeof s === "string" ? s : s.text
      );

      setAiSuggestions((prev) => ({
        ...prev,
        [questionId]: { loading: false, suggestions, visible: true },
      }));
    } catch {
      setAiSuggestions((prev) => ({
        ...prev,
        [questionId]: {
          loading: false,
          suggestions: ["Sorry, AI suggestions are unavailable right now."],
          visible: true,
        },
      }));
    }
  };

  const dismissAiSuggestions = (questionId: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], visible: false },
    }));
  };

  const selectAiSuggestion = (questionId: string, suggestion: string) => {
    updateAnswer(questionId, suggestion);
    dismissAiSuggestions(questionId);
  };

  // Check if a question is about competitors
  const isCompetitorQuestion = (q: Question) =>
    q.question_text.toLowerCase().includes("competitor");

  // Render the "I don't know" + optional "Skip" + "AI help" controls below text/textarea fields
  const renderFieldExtras = (question: Question) => {
    const isTextType =
      question.question_type === "text" ||
      question.question_type === "textarea";

    if (!isTextType) return null;

    const currentVal = answers[question.id] ?? "";
    const isIDontKnow = currentVal === "I don't know yet";
    const isSkipped = currentVal === "Skipped";
    const aiState = aiSuggestions[question.id];

    return (
      <>
        {/* Action links row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {/* I don't know button */}
          <button
            type="button"
            onClick={() => updateAnswer(question.id, "I don't know yet")}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isIDontKnow
                ? "font-medium text-[var(--teal)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3 w-3" />
            I don&apos;t know
          </button>

          {/* Skip this question (only for non-required) */}
          {!question.required && (
            <button
              type="button"
              onClick={() => {
                updateAnswer(question.id, "Skipped");
              }}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isSkipped
                  ? "font-medium text-[var(--teal)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SkipForward className="h-3 w-3" />
              Skip this question
            </button>
          )}

          {/* AI help button */}
          <button
            type="button"
            onClick={() => handleAiHelp(question)}
            disabled={aiState?.loading}
            className="flex items-center gap-1 text-xs text-[var(--teal)] transition-colors hover:text-[var(--teal)]/80 disabled:opacity-50"
          >
            {aiState?.loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {aiState?.loading ? "Thinking..." : "Let AI help"}
          </button>
        </div>

        {/* AI suggestions panel */}
        {aiState?.visible && !aiState.loading && aiState.suggestions.length > 0 && (
          <div className="mt-2 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--teal)]">
                <Sparkles className="h-3 w-3" />
                AI Suggestions
              </span>
              <button
                type="button"
                onClick={() => dismissAiSuggestions(question.id)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {aiState.suggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() =>
                    selectAiSuggestion(question.id, suggestion)
                  }
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-[var(--teal)] hover:bg-[var(--teal)]/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading questionnaire...</span>
        </div>
      </div>
    );
  }

  if (error || sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-[var(--coral)]" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
            Questionnaire Unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "No questionnaire sections have been configured yet."}
          </p>
          <Link
            href={`/strategy/${strategyId}`}
            className="mt-4 inline-block rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--coral)]/90"
          >
            Back to Strategy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top progress bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/strategy/${strategyId}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-[var(--navy)] sm:text-lg">
                Strategy Questionnaire
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" /> Saved
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="h-3 w-3" /> Save failed
                  </span>
                )}
                {saveStatus === "idle" && (
                  <span className="flex items-center gap-1">
                    <Save className="h-3 w-3" /> Auto-save on
                  </span>
                )}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Section {currentSectionIdx + 1} of {sections.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < currentSectionIdx
                    ? "bg-emerald-400"
                    : i === currentSectionIdx
                      ? "bg-[var(--coral)]"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {overallProgress}% complete ({totalAnswered}/{totalQuestions}{" "}
            questions)
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-32 space-y-1">
            {sections.map((section, idx) => {
              const { answered, total } = sectionCompletion[idx];
              const isActive = idx === currentSectionIdx;
              const isComplete = answered === total && total > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIdx(idx)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--coral)]/10 font-medium text-[var(--coral)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                          ? "bg-[var(--coral)]/20 text-[var(--coral)]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{section.section_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {answered}/{total} answered
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {currentSection && (
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-[family-name:var(--font-oswald)] text-xl font-semibold text-[var(--navy)]">
                  {currentSection.section_name}
                </h2>
                {currentSection.section_description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentSection.section_description}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {currentSection.questions.map((question, qIdx) => {
                  const currentVal = answers[question.id] ?? "";
                  const isSpecialValue =
                    currentVal === "I don't know yet" ||
                    currentVal === "Skipped";

                  return (
                    <div key={question.id}>
                      <label
                        htmlFor={question.id}
                        className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-foreground"
                      >
                        <span className="text-xs text-muted-foreground">
                          Q{qIdx + 1}.
                        </span>
                        {question.question_text}
                        {question.required && (
                          <span className="text-[var(--coral)]">*</span>
                        )}
                      </label>

                      {question.help_text && (
                        <p className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <HelpCircle className="h-3 w-3" />
                          {question.help_text}
                        </p>
                      )}

                      {/* Competitor-specific help text */}
                      {isCompetitorQuestion(question) &&
                        (question.question_type === "textarea" ||
                          question.question_type === "text") && (
                          <p className="mb-1.5 flex items-center gap-1 text-xs text-[var(--teal)]">
                            <HelpCircle className="h-3 w-3" />
                            Include website URLs and social media links for each
                            competitor so our AI can research them.
                          </p>
                        )}

                      {question.question_type === "textarea" ? (
                        <>
                          <textarea
                            id={question.id}
                            rows={3}
                            placeholder={
                              isCompetitorQuestion(question)
                                ? "e.g. Competitor 1 - https://example.com - @instagram\nCompetitor 2 - https://example2.com - linkedin.com/company/..."
                                : question.placeholder
                            }
                            value={currentVal}
                            onChange={(e) =>
                              updateAnswer(question.id, e.target.value)
                            }
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 ${
                              isSpecialValue
                                ? "border-[var(--teal)]/30 bg-[var(--teal)]/5 italic text-muted-foreground"
                                : "border-border bg-background"
                            }`}
                          />
                          {renderFieldExtras(question)}
                        </>
                      ) : question.question_type === "multiselect" ? (
                        <div className="space-y-2">
                          <div className="grid gap-2 sm:grid-cols-2">
                            {question.options?.map((opt) => {
                              const label =
                                typeof opt === "object" && opt !== null
                                  ? (opt as { label: string }).label
                                  : String(opt);
                              const value =
                                typeof opt === "object" && opt !== null
                                  ? (opt as { value: string }).value
                                  : String(opt);
                              const selected = (answers[question.id] ?? "")
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const isChecked = selected.includes(value);
                              return (
                                <label
                                  key={value}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                                    isChecked
                                      ? "border-[var(--coral)] bg-[var(--coral)]/5 text-foreground"
                                      : "border-border bg-background text-foreground hover:bg-muted"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      let updated: string[];
                                      if (isChecked) {
                                        updated = selected.filter(
                                          (s) => s !== value
                                        );
                                      } else {
                                        updated = [...selected, value];
                                      }
                                      updateAnswer(
                                        question.id,
                                        updated.join(", ")
                                      );
                                    }}
                                    className="h-4 w-4 rounded border-border accent-[var(--coral)]"
                                  />
                                  {label}
                                </label>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            placeholder="Other (type your own)..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const val = input.value.trim();
                                if (val) {
                                  const selected = (
                                    answers[question.id] ?? ""
                                  )
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  if (!selected.includes(val)) {
                                    updateAnswer(
                                      question.id,
                                      [...selected, val].join(", ")
                                    );
                                  }
                                  input.value = "";
                                }
                              }
                            }}
                            className="w-full rounded-lg border border-dashed border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                          />
                        </div>
                      ) : question.question_type === "select" ? (
                        <div className="space-y-2">
                          <select
                            id={question.id}
                            value={
                              question.options?.some((opt) => {
                                const v =
                                  typeof opt === "object" && opt !== null
                                    ? (opt as { value: string }).value
                                    : String(opt);
                                return v === answers[question.id];
                              })
                                ? answers[question.id]
                                : answers[question.id]
                                  ? "__other__"
                                  : ""
                            }
                            onChange={(e) => {
                              if (e.target.value === "__other__") {
                                updateAnswer(question.id, "__other__");
                              } else {
                                updateAnswer(question.id, e.target.value);
                              }
                            }}
                            className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                          >
                            <option value="">
                              {question.placeholder || "Select an option..."}
                            </option>
                            {question.options?.map((opt) => {
                              const label =
                                typeof opt === "object" && opt !== null
                                  ? (opt as { label: string }).label
                                  : String(opt);
                              const value =
                                typeof opt === "object" && opt !== null
                                  ? (opt as { value: string }).value
                                  : String(opt);
                              if (label.toLowerCase() === "other") return null;
                              return (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              );
                            })}
                            <option value="__other__">
                              Other (type your own)
                            </option>
                          </select>
                          {(() => {
                            const selectVal = answers[question.id] ?? "";
                            const isOtherSelected = selectVal === "__other__";
                            const isCustomValue =
                              selectVal !== "" &&
                              selectVal !== "__other__" &&
                              !question.options?.some((opt) => {
                                const v =
                                  typeof opt === "object" && opt !== null
                                    ? (opt as { value: string }).value
                                    : String(opt);
                                return v === selectVal;
                              });
                            if (!isOtherSelected && !isCustomValue) return null;
                            return (
                              <input
                                type="text"
                                placeholder="Type your answer..."
                                value={isOtherSelected ? "" : selectVal}
                                onChange={(e) =>
                                  updateAnswer(question.id, e.target.value || "__other__")
                                }
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                                autoFocus
                              />
                            );
                          })()}
                        </div>
                      ) : question.question_type === "scale" ? (
                        <div className="flex items-center gap-3">
                          <input
                            id={question.id}
                            type="range"
                            min={1}
                            max={10}
                            value={answers[question.id] ?? "5"}
                            onChange={(e) =>
                              updateAnswer(question.id, e.target.value)
                            }
                            className="flex-1 accent-[var(--coral)]"
                          />
                          <span className="w-8 text-center text-sm font-semibold text-[var(--navy)]">
                            {answers[question.id] ?? "5"}/10
                          </span>
                        </div>
                      ) : (
                        <>
                          <input
                            id={question.id}
                            type="text"
                            placeholder={question.placeholder}
                            value={currentVal}
                            onChange={(e) =>
                              updateAnswer(question.id, e.target.value)
                            }
                            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20 ${
                              isSpecialValue
                                ? "border-[var(--teal)]/30 bg-[var(--teal)]/5 italic text-muted-foreground"
                                : "border-border bg-background"
                            }`}
                          />
                          {renderFieldExtras(question)}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <button
                  onClick={() =>
                    setCurrentSectionIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentSectionIdx === 0}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentSectionIdx < sections.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentSectionIdx((prev) =>
                        Math.min(sections.length - 1, prev + 1)
                      )
                    }
                    className="flex items-center gap-2 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--coral)]/90"
                  >
                    Next Section
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`/strategy/${strategyId}/review`}
                    className="flex items-center gap-2 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--coral)]/90"
                  >
                    Review Answers
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
