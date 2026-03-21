"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewSection {
  id: string;
  title: string;
  section_number: number;
  answers: { question: string; answer: string; question_id: string }[];
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.id as string;
  const supabase = useRef(createClient());

  const [sections, setSections] = useState<ReviewSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    async function fetchResponses() {
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

        // Fetch sections
        const { data: sectionsData, error: sectionsError } =
          await supabase.current
            .from("questionnaire_sections")
            .select("id, section_name, section_number")
            .order("section_number", { ascending: true });

        if (sectionsError) throw sectionsError;

        // Fetch all questions
        const { data: questionsData, error: questionsError } =
          await supabase.current
            .from("questionnaire_questions")
            .select("id, section_id, question_text, question_number")
            .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // Fetch the questionnaire_responses row for this strategy project
        const { data: responseRow, error: responsesError } =
          await supabase.current
            .from("questionnaire_responses")
            .select("*")
            .eq("strategy_project_id", strategyId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (responsesError) throw responsesError;

        // Build a flat map of question_id -> answer from section_N_responses columns
        const answersMap: Record<string, string> = {};
        if (responseRow) {
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
                if (answer && answer.trim()) {
                  answersMap[questionId] = answer;
                }
              });
            }
          }
        }

        // Assemble sections with their questions and answers
        const assembled: ReviewSection[] = (sectionsData ?? []).map((sec) => {
          const sectionQuestions = (questionsData ?? []).filter(
            (q) => q.section_id === sec.id
          );
          return {
            id: sec.id,
            title: sec.section_name,
            section_number: sec.section_number,
            answers: sectionQuestions
              .filter((q) => answersMap[q.id]?.trim())
              .map((q) => ({
                question: q.question_text,
                answer: answersMap[q.id],
                question_id: q.id,
              })),
          };
        });

        // Filter out sections with no answers
        const withAnswers = assembled.filter((s) => s.answers.length > 0);
        setSections(withAnswers);
        setExpandedSections(new Set(withAnswers.map((s) => s.id)));

        // Store formatted responses in localStorage for the generating page
        const formattedResponses: Record<
          string,
          { question: string; answer: string }[]
        > = {};
        withAnswers.forEach((sec) => {
          formattedResponses[sec.title] = sec.answers.map((a) => ({
            question: a.question,
            answer: a.answer,
          }));
        });
        localStorage.setItem(
          `strategy_questionnaire_${strategyId}`,
          JSON.stringify(formattedResponses)
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load questionnaire responses";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, [strategyId, router]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalAnswers = sections.reduce(
    (sum, s) => sum + s.answers.length,
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your answers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-[#2AB9B0]" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[#1A1A2E]">
            Could Not Load Responses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            href={`/strategy/${strategyId}/questionnaire`}
            className="mt-4 inline-block rounded-lg bg-[#2AB9B0] px-4 py-2 text-sm font-medium text-white hover:bg-[#2AB9B0]/90"
          >
            Back to Questionnaire
          </Link>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-[#2AB9B0]" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[#1A1A2E]">
            No Answers Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It looks like the questionnaire hasn&apos;t been completed yet.
            Please fill out the questionnaire first.
          </p>
          <Link
            href={`/strategy/${strategyId}/questionnaire`}
            className="mt-4 inline-block rounded-lg bg-[#2AB9B0] px-4 py-2 text-sm font-medium text-white hover:bg-[#2AB9B0]/90"
          >
            Go to Questionnaire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={`/strategy/${strategyId}/questionnaire`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questionnaire
          </Link>
          <h1 className="font-[family-name:var(--font-oswald)] text-[36px] font-bold text-[#1A1A2E]">
            Review Your Answers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Everything looks good? Let&apos;s generate your strategy.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section cards */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2AB9B0]/10 text-[#2AB9B0]">
                      <span className="text-sm font-semibold">
                        {section.section_number}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {section.answers.length} questions answered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <Link
                      href={`/strategy/${strategyId}/questionnaire?section=${section.section_number}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Edit section"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded answers */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="space-y-4">
                      {section.answers.map((qa, idx) => (
                        <div key={idx}>
                          <p className="text-xs font-medium text-muted-foreground">
                            {qa.question}
                          </p>
                          <p className="mt-0.5 text-sm text-foreground">
                            {qa.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generate CTA */}
        <div className="mt-10 rounded-xl border border-[#2AB9B0]/20 bg-[#2AB9B0]/5 p-6 text-center sm:p-8">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#2AB9B0]" />
          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[#1A1A2E]">
            Ready to generate your strategy?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Our AI will analyze your {totalAnswers} answers and craft a
            comprehensive 15-section strategy deck tailored to your business.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            This typically takes 2-3 minutes
          </div>

          <Link
            href={`/strategy/${strategyId}/generating`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2AB9B0] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#2AB9B0]/90"
          >
            Generate My Strategy Deck
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
