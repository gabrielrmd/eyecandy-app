"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  question_type: "text" | "textarea" | "select";
  placeholder: string;
  options: string[] | null;
  required: boolean;
  help_text: string | null;
  question_number: number;
}

interface Section {
  id: string;
  title: string;
  description: string;
  section_number: number;
  questions: Question[];
}

export default function QuestionnairePage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useRef(createClient());

  // Fetch sections, questions, and existing responses on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch sections ordered by section_number
        const { data: sectionsData, error: sectionsError } = await supabase.current
          .from("questionnaire_sections")
          .select("id, title, description, section_number")
          .order("section_number", { ascending: true });

        if (sectionsError) throw sectionsError;
        if (!sectionsData || sectionsData.length === 0) {
          setError("No questionnaire sections found.");
          setLoading(false);
          return;
        }

        // Fetch all questions ordered by question_number
        const { data: questionsData, error: questionsError } = await supabase.current
          .from("questionnaire_questions")
          .select(
            "id, section_id, question_text, question_type, placeholder, options, required, help_text, question_number"
          )
          .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // Group questions into sections
        const assembled: Section[] = sectionsData.map((sec) => ({
          id: sec.id,
          title: sec.title,
          description: sec.description ?? "",
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

        // Load existing responses for this strategy
        const { data: responsesData } = await supabase.current
          .from("questionnaire_responses")
          .select("question_id, answer")
          .eq("strategy_id", strategyId);

        if (responsesData && responsesData.length > 0) {
          const loaded: Record<string, string> = {};
          responsesData.forEach((r) => {
            if (r.answer) loaded[r.question_id] = r.answer;
          });
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
  }, [strategyId]);

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

  // Save a single response to Supabase
  const saveResponse = useCallback(
    async (questionId: string, answer: string) => {
      const {
        data: { user },
      } = await supabase.current.auth.getUser();
      if (!user) return;

      await supabase.current.from("questionnaire_responses").upsert(
        {
          user_id: user.id,
          strategy_id: strategyId,
          question_id: questionId,
          answer,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,strategy_id,question_id",
        }
      );
    },
    [strategyId]
  );

  // Debounced auto-save
  const pendingSaves = useRef<Map<string, string>>(new Map());

  const flushSaves = useCallback(async () => {
    const toSave = new Map(pendingSaves.current);
    pendingSaves.current.clear();

    if (toSave.size === 0) return;

    setSaveStatus("saving");
    try {
      const promises = Array.from(toSave.entries()).map(([qId, ans]) =>
        saveResponse(qId, ans)
      );
      await Promise.all(promises);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("idle");
    }
  }, [saveResponse]);

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    pendingSaves.current.set(questionId, value);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      flushSaves();
    }, 1500);
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
          <AlertCircle className="mx-auto h-10 w-10 text-coral" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
            Questionnaire Unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "No questionnaire sections have been configured yet."}
          </p>
          <Link
            href={`/strategy/${strategyId}`}
            className="mt-4 inline-block rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
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
              <h1 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-navy sm:text-lg">
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
                      ? "bg-coral"
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
                      ? "bg-coral/10 font-medium text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                          ? "bg-coral/20 text-coral"
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
                    <p className="truncate">{section.title}</p>
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
                <h2 className="font-[family-name:var(--font-oswald)] text-xl font-semibold text-navy">
                  {currentSection.title}
                </h2>
                {currentSection.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentSection.description}
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
                        <span className="text-coral">*</span>
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
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      />
                    ) : question.question_type === "select" ? (
                      <select
                        id={question.id}
                        value={answers[question.id] ?? ""}
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        className="w-full appearance-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
                      >
                        <option value="">{question.placeholder}</option>
                        {question.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={question.id}
                        type="text"
                        placeholder={question.placeholder}
                        value={answers[question.id] ?? ""}
                        onChange={(e) =>
                          updateAnswer(question.id, e.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
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
                    className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
                  >
                    Next Section
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`/strategy/${strategyId}/review`}
                    className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90"
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
