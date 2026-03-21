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

interface QuestionAnswer {
  question_id: string;
  question_text: string;
  answer: string;
  section_title: string;
  section_id: string;
}

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

  // Fetch actual questionnaire responses from Supabase
  useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      setError(null);

      try {
        // Fetch sections
        const { data: sectionsData, error: sectionsError } =
          await supabase.current
            .from("questionnaire_sections")
            .select("id, title, section_number")
            .order("section_number", { ascending: true });

        if (sectionsError) throw sectionsError;

        // Fetch all questions
        const { data: questionsData, error: questionsError } =
          await supabase.current
            .from("questionnaire_questions")
            .select(
              "id, section_id, question_text, question_number"
            )
            .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // Fetch responses for this strategy
        const { data: responsesData, error: responsesError } =
          await supabase.current
            .from("questionnaire_responses")
            .select("question_id, answer")
            .eq("strategy_id", strategyId);

        if (responsesError) throw responsesError;

        // Build a map of question_id -> answer
        const answersMap: Record<string, string> = {};
        (responsesData ?? []).forEach((r) => {
          if (r.answer) answersMap[r.question_id] = r.answer;
        });

        // Assemble sections with their questions and answers
        const assembled: ReviewSection[] = (sectionsData ?? []).map((sec) => {
          const sectionQuestions = (questionsData ?? []).filter(
            (q) => q.section_id === sec.id
          );
          return {
            id: sec.id,
            title: sec.title,
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

        // Also store the questionnaire responses in localStorage for the generating page
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
  }, [strategyId]);

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
          <AlertCircle className="mx-auto h-10 w-10 text-coral" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
            Could Not Load Responses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link
            href={`/strategy/${strategyId}/questionnaire`}
            className="mt-4 inline-block rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
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
          <AlertCircle className="mx-auto h-10 w-10 text-coral" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-navy">
            No Answers Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It looks like the questionnaire hasn&apos;t been completed yet.
            Please fill out the questionnaire first.
          </p>
          <Link
            href={`/strategy/${strategyId}/questionnaire`}
            className="mt-4 inline-block rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
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
          <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy sm:text-3xl">
            Review Your Answers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review all {totalAnswers} answers across {sections.length} sections
            before generating your strategy. Make sure everything is accurate.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section summaries */}
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal">
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
                      href={`/strategy/${strategyId}/questionnaire`}
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
        <div className="mt-10 rounded-xl border border-coral/20 bg-coral/5 p-6 text-center sm:p-8">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-coral" />
          <h2 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-navy">
            Ready to generate your strategy?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Our AI will analyze your {totalAnswers} answers and craft a
            comprehensive 15-section strategy deck tailored to your business.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Estimated generation time: under 1 minute
          </div>

          <Link
            href={`/strategy/${strategyId}/generating`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-coral px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-coral/90"
          >
            Generate My Strategy
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
