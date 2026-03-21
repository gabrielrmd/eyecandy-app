"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ---------- Types ---------- */

interface Question {
  id: string;
  section_id: string;
  question_text: string;
  question_type: "text" | "textarea" | "select" | "multiselect" | "scale" | "radio";
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
  text: string;
  visible: boolean;
}

/* ---------- Helpers ---------- */

function getOptionLabel(opt: string | { label: string; value: string }): string {
  return typeof opt === "object" && opt !== null ? opt.label : String(opt);
}

function getOptionValue(opt: string | { label: string; value: string }): string {
  return typeof opt === "object" && opt !== null ? opt.value : String(opt);
}

/* ---------- Component ---------- */

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;

  // Core state
  const [sections, setSections] = useState<Section[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [responseRowId, setResponseRowId] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<Record<string, AiSuggestion>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useRef(createClient());

  /* ---------- Fetch data on mount ---------- */

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.current.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Verify project ownership
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

        // Fetch sections
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

        // Fetch all questions
        const { data: questionsData, error: questionsError } =
          await supabase.current
            .from("questionnaire_questions")
            .select(
              "id, section_id, question_text, question_type, placeholder, options, required, help_text, question_number"
            )
            .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // Assemble sections with their questions
        const assembled: Section[] = sectionsData.map((sec) => ({
          id: sec.id,
          section_name: sec.section_name,
          section_description: sec.section_description ?? "",
          section_number: sec.section_number,
          questions: (questionsData ?? [])
            .filter((q) => q.section_id === sec.id)
            .map((q) => ({
              id: q.id,
              section_id: q.section_id,
              question_text: q.question_text,
              question_type: q.question_type as Question["question_type"],
              placeholder: q.placeholder ?? "",
              options: q.options,
              required: q.required ?? false,
              help_text: q.help_text,
              question_number: q.question_number,
            })),
        }));

        setSections(assembled);

        // Build flat ordered question list
        const flat = assembled.flatMap((s) => s.questions);
        setAllQuestions(flat);

        // Load existing responses
        const { data: responseRow } = await supabase.current
          .from("questionnaire_responses")
          .select("*")
          .eq("strategy_project_id", strategyId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (responseRow) {
          setResponseRowId(responseRow.id);
          const loaded: Record<string, string> = {};
          for (let i = 1; i <= 7; i++) {
            const sectionResponses =
              responseRow[`section_${i}_responses` as keyof typeof responseRow];
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

          // Resume from last unanswered question
          const firstUnanswered = flat.findIndex((q) => !loaded[q.id]?.trim());
          if (firstUnanswered > 0) {
            setCurrentQuestionIdx(firstUnanswered);
          }
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

  /* ---------- Derived values ---------- */

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIdx] ?? null;

  // Find which section this question belongs to
  const currentSection = currentQuestion
    ? sections.find((s) => s.id === currentQuestion.section_id) ?? null
    : null;

  const isFirstQuestion = currentQuestionIdx === 0;
  const isLastQuestion = currentQuestionIdx === totalQuestions - 1;
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100)
      : 0;

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? "" : "";
  const isAnswered = currentAnswer.trim().length > 0;
  const isRequired = currentQuestion?.required ?? false;
  const canProceed = !isRequired || isAnswered;

  /* ---------- Save logic ---------- */

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

  // Debounced auto-save (1.5s)
  const latestAnswers = useRef(answers);
  latestAnswers.current = answers;

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveResponses(latestAnswers.current);
    }, 1500);
  }, [saveResponses]);

  const updateAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      setSaveStatus("idle");
      scheduleSave();
    },
    [scheduleSave]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  /* ---------- AI Suggest ---------- */

  const handleAiSuggest = async (question: Question) => {
    const questionId = question.id;

    setAiSuggestion((prev) => ({
      ...prev,
      [questionId]: { loading: true, text: "", visible: true },
    }));

    try {
      const currentAns = answers[questionId] ?? "";

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: question.question_text,
          current_answer: currentAns,
          context: {
            section: currentSection?.section_name ?? "",
            existing_answers: answers,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to get suggestion");

      const data = await res.json();
      const rawSuggestions = data.suggestions ?? [];
      const firstSuggestion =
        rawSuggestions.length > 0
          ? typeof rawSuggestions[0] === "string"
            ? rawSuggestions[0]
            : rawSuggestions[0].text
          : "No suggestion available.";

      setAiSuggestion((prev) => ({
        ...prev,
        [questionId]: { loading: false, text: firstSuggestion, visible: true },
      }));
    } catch {
      setAiSuggestion((prev) => ({
        ...prev,
        [questionId]: {
          loading: false,
          text: "Sorry, AI suggestions are unavailable right now.",
          visible: true,
        },
      }));
    }
  };

  const applySuggestion = (questionId: string, text: string) => {
    updateAnswer(questionId, text);
    setAiSuggestion((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], visible: false },
    }));
  };

  const dismissSuggestion = (questionId: string) => {
    setAiSuggestion((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], visible: false },
    }));
  };

  /* ---------- Navigation ---------- */

  const goNext = () => {
    if (isLastQuestion) {
      // Flush save before navigating
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveResponses(latestAnswers.current);
      router.push(`/strategy/${strategyId}/review`);
    } else {
      setCurrentQuestionIdx((prev) => Math.min(totalQuestions - 1, prev + 1));
    }
  };

  const goPrev = () => {
    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
  };

  const goSkip = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIdx((prev) => Math.min(totalQuestions - 1, prev + 1));
    }
  };

  /* ---------- Input Renderers ---------- */

  function renderInput(question: Question) {
    const value = answers[question.id] ?? "";
    const aiState = aiSuggestion[question.id];

    switch (question.question_type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
            autoFocus
          />
        );

      case "textarea": {
        const charCount = value.length;
        return (
          <div>
            <textarea
              rows={5}
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
              autoFocus
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {charCount} characters
            </div>
          </div>
        );
      }

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
          >
            <option value="">{question.placeholder || "Select an option..."}</option>
            {question.options?.map((opt) => (
              <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
                {getOptionLabel(opt)}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => {
              const optLabel = getOptionLabel(opt);
              const optValue = getOptionValue(opt);
              const isSelected = value === optValue;
              return (
                <label
                  key={optValue}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    isSelected
                      ? "border-[var(--coral)] bg-[var(--coral)]/5 font-medium text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name={`radio-${question.id}`}
                    value={optValue}
                    checked={isSelected}
                    onChange={() => updateAnswer(question.id, optValue)}
                    className="h-4 w-4 accent-[var(--coral)]"
                  />
                  {optLabel}
                </label>
              );
            })}
          </div>
        );

      case "multiselect": {
        const selected = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const otherVal = otherText[question.id] ?? "";

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {question.options?.map((opt) => {
                const optLabel = getOptionLabel(opt);
                const optValue = getOptionValue(opt);
                const isChecked = selected.includes(optValue);
                return (
                  <label
                    key={optValue}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                      isChecked
                        ? "border-[var(--coral)] bg-[var(--coral)]/5 font-medium text-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const updated = isChecked
                          ? selected.filter((s) => s !== optValue)
                          : [...selected, optValue];
                        updateAnswer(question.id, updated.join(", "));
                      }}
                      className="h-4 w-4 rounded border-border accent-[var(--coral)]"
                    />
                    {optLabel}
                  </label>
                );
              })}
            </div>
            {/* Other text input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Other (type and press Enter)..."
                value={otherVal}
                onChange={(e) =>
                  setOtherText((prev) => ({
                    ...prev,
                    [question.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = otherVal.trim();
                    if (val && !selected.includes(val)) {
                      updateAnswer(question.id, [...selected, val].join(", "));
                      setOtherText((prev) => ({ ...prev, [question.id]: "" }));
                    }
                  }
                }}
                className="flex-1 rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
              />
            </div>
          </div>
        );
      }

      case "scale": {
        const scaleValue = value ? parseInt(value, 10) : 5;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">1</span>
              <input
                type="range"
                min={1}
                max={10}
                value={scaleValue}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                className="flex-1 accent-[var(--coral)]"
              />
              <span className="text-xs text-muted-foreground">10</span>
            </div>
            <div className="text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--coral)]/10 text-lg font-bold text-[var(--coral)]">
                {scaleValue}
              </span>
            </div>
          </div>
        );
      }

      default:
        return (
          <input
            type="text"
            placeholder={question.placeholder}
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
          />
        );
    }
  }

  /* ---------- Loading / Error states ---------- */

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

  if (error || allQuestions.length === 0) {
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

  if (!currentQuestion || !currentSection) return null;

  const aiState = aiSuggestion[currentQuestion.id];

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-background">
      {/* Top progress bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto max-w-[600px] px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/strategy/${strategyId}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <span className="text-sm font-medium text-foreground">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </span>

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
                  <AlertCircle className="h-3 w-3" /> Error
                </span>
              )}
              {saveStatus === "idle" && (
                <span className="flex items-center gap-1">
                  <Save className="h-3 w-3" /> Auto-save
                </span>
              )}
            </span>
          </div>

          {/* Progress fill bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--coral)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Section name */}
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            {currentSection.section_name}
          </p>
        </div>
      </div>

      {/* Centered question card */}
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-[600px]">
          <div className="rounded-xl bg-card p-8 shadow-lg sm:p-10">
            {/* Card header */}
            <div className="mb-6 flex items-start justify-between">
              {/* Section badge */}
              <span className="inline-block rounded-full bg-[var(--coral)]/10 px-3 py-1 text-xs font-bold text-[var(--coral)]">
                {currentSection.section_name}
              </span>
              {/* Question number */}
              <span className="text-sm text-muted-foreground">
                {currentQuestionIdx + 1} of {totalQuestions}
              </span>
            </div>

            {/* Question title + AI Suggest button */}
            <div className="mb-2 flex items-start gap-3">
              <h2 className="flex-1 font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                {currentQuestion.question_text}
                {currentQuestion.required && (
                  <span className="ml-1 text-[var(--coral)]">*</span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => handleAiSuggest(currentQuestion)}
                disabled={aiState?.loading}
                className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--teal)]/10 px-3 py-1.5 text-xs font-medium text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/20 disabled:opacity-50"
                title="AI Suggest"
              >
                {aiState?.loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {aiState?.loading ? "Thinking..." : "AI Suggest"}
              </button>
            </div>

            {/* Help text */}
            {currentQuestion.help_text && (
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {currentQuestion.help_text}
              </p>
            )}

            {/* Input area */}
            <div className="mb-6">{renderInput(currentQuestion)}</div>

            {/* AI Suggestion card */}
            {aiState?.visible && !aiState.loading && aiState.text && (
              <div className="mb-6 rounded-lg border border-[var(--teal)]/30 bg-[var(--teal)]/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--teal)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Suggestion
                  </span>
                  <button
                    type="button"
                    onClick={() => dismissSuggestion(currentQuestion.id)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm text-foreground">{aiState.text}</p>
                <button
                  type="button"
                  onClick={() =>
                    applySuggestion(currentQuestion.id, aiState.text)
                  }
                  className="mt-3 rounded-lg bg-[var(--teal)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--teal)]/90"
                >
                  Apply Suggestion
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              {/* Previous */}
              <button
                onClick={goPrev}
                disabled={isFirstQuestion}
                className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {/* Skip (only for non-required) */}
                {!isRequired && !isLastQuestion && (
                  <button
                    onClick={goSkip}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Skip
                  </button>
                )}

                {/* Next / Review Answers */}
                <button
                  onClick={goNext}
                  disabled={!canProceed}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                    canProceed
                      ? "bg-[var(--coral)] text-white hover:bg-[var(--coral)]/90"
                      : "cursor-not-allowed bg-[var(--coral)]/40 text-white/70"
                  }`}
                >
                  {isLastQuestion ? (
                    <>
                      Review Answers
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
