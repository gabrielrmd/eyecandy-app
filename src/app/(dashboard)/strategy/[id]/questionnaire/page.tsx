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
              question_type: q.question_type as "text" | "textarea" | "select",
              placeholder: q.placeholder ?? "",
              options: q.options,
              required: q.required ?? false,
              help_text: q.help_text,
              question_number: q.question_number,
            })),
        }));

        setSections(assembled);

        // Load existing responses for this strategy project
        // The questionnaire_responses table stores one row per project,
        // with section_1_responses through section_7_responses JSONB columns.
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

  // Save responses to Supabase (upsert pattern: check existing, then insert or update)
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
          // Update existing row
          const { error: updateError } = await supabase.current
            .from("questionnaire_responses")
            .update({
              ...sectionPayload,
              ...completionMeta,
            })
            .eq("id", responseRowId);

          if (updateError) throw updateError;
        } else {
          // Insert new row
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
                {currentSection.questions.map((question, qIdx) => (
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

                    {question.question_type === "textarea" ? (
                      <textarea
                        id={question.id}
                        rows={3}
                        placeholder={question.placeholder}
                        value={answers[question.id] ?? ""}
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                      />
                    ) : question.question_type === "select" || question.question_type === "multiselect" ? (
                      <select
                        id={question.id}
                        value={answers[question.id] ?? ""}
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                      >
                        <option value="">{question.placeholder || "Select an option..."}</option>
                        {question.options?.map((opt) => {
                          const label = typeof opt === "object" && opt !== null ? (opt as {label: string}).label : String(opt);
                          const value = typeof opt === "object" && opt !== null ? (opt as {value: string}).value : String(opt);
                          return (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
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
                      <input
                        id={question.id}
                        type="text"
                        placeholder={question.placeholder}
                        value={answers[question.id] ?? ""}
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
                      />
                    )}
                  </div>
                ))}
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
