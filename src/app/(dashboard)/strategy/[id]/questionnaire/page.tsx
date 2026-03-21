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
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ---------- Constants ---------- */

const QUESTION_PLACEHOLDERS: Record<number, string> = {
  1: "e.g., I noticed small restaurant owners were losing customers to delivery apps but couldn't afford their own online ordering system...",
  2: "e.g., Small businesses waste 10+ hours/week on manual social media posting. We automate their content calendar...",
  3: "e.g., Unlike competitors who offer generic templates, we customize every strategy based on real customer data...",
  4: "e.g., Transparency — we show our pricing publicly. Quality over quantity — we'd rather serve 50 clients exceptionally...",
  5: "e.g., They would lose a reliable source of expert-level strategy at an accessible price point...",
  6: "e.g., Tech-savvy small business owners aged 28-45, in service industries, frustrated with expensive agencies...",
  7: "e.g., They've tried 3-4 marketing tools that all promised results but delivered vanity metrics...",
  8: "e.g., High cost perception, information overload, difficulty distinguishing quality from marketing noise...",
  9: "e.g., Reviews, case studies, free trials, expert recommendations, comparison articles...",
  10: "e.g., Google search first, then LinkedIn peers, then industry blogs and podcasts...",
  11: "e.g., AI Strategy Builder (flagship), Template Library (41 tools), 90-Day Growth Challenge...",
  12: "e.g., Proprietary AI model trained on 1000+ successful strategies, combined with human review...",
  13: "e.g., Harvard Business School certification, Gold Effie winner, 15+ years consulting experience...",
  14: "e.g., Our training dataset and methodology are proprietary. The AI + human combo is hard to replicate...",
  15: "e.g., We should NEVER promise guaranteed results or specific revenue numbers...",
  16: "e.g., Canva (canva.com), Strategyzer (strategyzer.com), local agencies charging \u20AC5,000+...",
  17: "e.g., We combine AI speed (24h delivery) with human strategic depth (15 sections vs competitors' 3-5)...",
  18: "e.g., Canva has massive brand recognition and a free tier. Local agencies offer deep personal relationships...",
  19: "e.g., Canva is design-only, not strategy. Agencies are slow (6-8 weeks) and output depends on consultant...",
  20: "e.g., AI-generated content is commoditizing basic marketing. The shift is toward strategic differentiation...",
  21: "e.g., Confident but not arrogant. Direct and honest. Warm and approachable. Smart without being academic...",
  22: "e.g., Trust and empowerment — they should feel they have a strategic advantage others don't...",
  23: "e.g., Professional but conversational. Data-backed insights in plain language. Short sentences. No jargon...",
  26: "e.g., Confidence that they have a clear path forward. Relief that strategy isn't overwhelming...",
  27: "e.g., When I feel overwhelmed by marketing options, I want a clear framework so I can focus on what works...",
  28: "e.g., Problem awareness \u2192 Google search \u2192 Compare solutions \u2192 Read reviews \u2192 Free trial \u2192 Purchase...",
  29: "e.g., Between free trial and purchase — they see value but hesitate on price. Also onboarding drop-off...",
  30: "e.g., Seeing a completed strategy example, customer testimonials with real numbers, money-back guarantee...",
  31: "e.g., Educational content that demonstrates expertise without hard selling...",
  32: "e.g., When launching a new product, rebranding, entering a new market, or after a competitive threat...",
  33: "e.g., Market leader in AI-powered brand strategy in CEE, 10,000+ users, major accelerator partnerships...",
  34: "e.g., From a tool to a platform — adding team collaboration, templates marketplace, CRM integration...",
  35: "e.g., Hire a world-class design team, launch a major PR campaign, and acquire 2-3 complementary tools...",
  36: "e.g., 'It's like having a senior strategist in your pocket — affordable, fast, and genuinely useful'...",
  37: "e.g., Industry events, competitor launches, seasonal business planning, funding rounds...",
  38: "e.g., Monday mornings when planning the week, end of quarter when reviewing, after disappointing campaigns...",
  39: "e.g., Share anything else — company culture, specific challenges, upcoming events, industry context...",
};

const ARCHETYPES = [
  { name: "The Hero", desc: "Brave, determined, inspiring", example: "Nike, FedEx" },
  { name: "The Sage", desc: "Wise, knowledgeable, trusted advisor", example: "Google, BBC" },
  { name: "The Innocent", desc: "Optimistic, pure, honest", example: "Coca-Cola, Dove" },
  { name: "The Explorer", desc: "Adventurous, independent, pioneering", example: "Jeep, Patagonia" },
  { name: "The Outlaw", desc: "Rebellious, disruptive, revolutionary", example: "Harley-Davidson, Virgin" },
  { name: "The Magician", desc: "Visionary, transformative, innovative", example: "Apple, Disney" },
  { name: "The Everyman", desc: "Relatable, authentic, down-to-earth", example: "IKEA, Target" },
  { name: "The Lover", desc: "Passionate, intimate, sensual", example: "Chanel, Victoria's Secret" },
  { name: "The Jester", desc: "Playful, humorous, fun", example: "Old Spice, M&M's" },
  { name: "The Caregiver", desc: "Nurturing, generous, compassionate", example: "Johnson & Johnson, Volvo" },
  { name: "The Creator", desc: "Imaginative, artistic, inventive", example: "Adobe, Lego" },
  { name: "The Ruler", desc: "Authoritative, commanding, premium", example: "Mercedes-Benz, Rolex" },
];

const SECTION_INTROS: Record<string, string> = {
  "Brand Foundation": "These questions define the core of who you are and why your brand exists. Your answers here shape everything that follows.",
  "Consumer Insights": "Understanding your customers is the foundation of effective positioning. Be as specific as possible.",
  "Product & Credibility": "Detail what makes your product unique and credible. This feeds directly into your positioning.",
  "Competitive Landscape": "Knowing your competitors helps us position you uniquely. Be honest about their strengths.",
  "Brand Personality": "Your brand's personality determines how people feel about you. Think of your brand as a person \u2014 who are they?",
  "Customer Journey": "Map how customers discover, evaluate, and choose your brand. Every touchpoint matters.",
  "Vision & Growth": "Where are you going? Honest answers here mean realistic, actionable strategies.",
};

const ARCHETYPES = [
  { name: "The Hero", desc: "Brave, determined, inspiring", example: "Nike, FedEx" },
  { name: "The Sage", desc: "Wise, knowledgeable, trusted advisor", example: "Google, BBC" },
  { name: "The Innocent", desc: "Optimistic, pure, honest", example: "Coca-Cola, Dove" },
  { name: "The Explorer", desc: "Adventurous, independent, pioneering", example: "Jeep, Patagonia" },
  { name: "The Outlaw", desc: "Rebellious, disruptive, revolutionary", example: "Harley-Davidson, Virgin" },
  { name: "The Magician", desc: "Visionary, transformative, innovative", example: "Apple, Disney" },
  { name: "The Everyman", desc: "Relatable, authentic, down-to-earth", example: "IKEA, Target" },
  { name: "The Lover", desc: "Passionate, intimate, sensual", example: "Chanel, Victoria's Secret" },
  { name: "The Jester", desc: "Playful, humorous, fun", example: "Old Spice, M&M's" },
  { name: "The Caregiver", desc: "Nurturing, generous, compassionate", example: "Johnson & Johnson, Volvo" },
  { name: "The Creator", desc: "Imaginative, artistic, inventive", example: "Adobe, Lego" },
  { name: "The Ruler", desc: "Authoritative, commanding, premium", example: "Mercedes-Benz, Rolex" },
];

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

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
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
  const [brandName, setBrandName] = useState("");
  const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>({});

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
          .select("id, title, description")
          .eq("id", strategyId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (projectError) throw projectError;
        if (!project) {
          router.push("/strategy/new");
          return;
        }

        // Extract brand name and category from project
        const projTitle = project.title || "";
        const projDesc = project.description || "";
        // Category is extracted from description (format: "Industry: X | Stage: Y | ...")
        const categoryMatch = projDesc.match(/Industry:\s*([^|]+)/);
        const category = categoryMatch ? categoryMatch[1].trim() : "";
        setBrandName(projTitle);

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
            .map((q) => {
              // Replace [BRAND] and [CATEGORY] placeholders with actual values
              const replacePlaceholders = (text: string | null) => {
                if (!text) return text;
                return text
                  .replace(/\[BRAND\]/g, projTitle || "[BRAND]")
                  .replace(/\[CATEGORY\]/g, category || "[CATEGORY]");
              };
              return {
                id: q.id,
                section_id: q.section_id,
                question_text: replacePlaceholders(q.question_text) || q.question_text,
                question_type: q.question_type as Question["question_type"],
                placeholder: replacePlaceholders(q.placeholder) ?? "",
                options: q.options,
                required: q.required ?? false,
                help_text: replacePlaceholders(q.help_text),
                question_number: q.question_number,
              };
            }),
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

  // Detect if current question is the first in its section
  const isFirstInSection =
    currentQuestionIdx === 0 ||
    (currentQuestion &&
      allQuestions[currentQuestionIdx - 1] &&
      allQuestions[currentQuestionIdx - 1].section_id !== currentQuestion.section_id);

  // Get section intro for current section
  const sectionIntro =
    isFirstInSection && currentSection
      ? SECTION_INTROS[currentSection.section_name] ?? null
      : null;

  // Check if current question is an archetype select
  const isArchetypeQuestion =
    currentQuestion?.question_type === "select" &&
    /archetype/i.test(currentQuestion.question_text);

  // Check if it's the anti-archetype question (Q25)
  const isAntiArchetype =
    isArchetypeQuestion && currentQuestion?.question_number === 25;

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

  /* ---------- Archetype Grid Renderer ---------- */

  function renderArchetypeGrid(question: Question) {
    const value = answers[question.id] ?? "";

    return (
      <div>
        {isAntiArchetype && (
          <p className="mb-4 text-sm font-medium text-amber-600">
            Which archetype is the OPPOSITE of your brand?
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ARCHETYPES.map((arch) => {
            const isSelected = value === arch.name;
            return (
              <button
                key={arch.name}
                type="button"
                onClick={() => updateAnswer(question.id, arch.name)}
                className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-[var(--teal)] bg-[var(--teal)]/5"
                    : "border-border bg-background hover:border-[var(--teal)]/40 hover:bg-muted"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-4 w-4 text-[var(--teal)]" />
                  </div>
                )}
                <p className="pr-5 text-sm font-bold text-foreground">{arch.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{arch.desc}</p>
                <p className="mt-1.5 text-xs italic text-muted-foreground/70">
                  e.g. {arch.example}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- Input Renderers ---------- */

  function renderInput(question: Question) {
    const value = answers[question.id] ?? "";
    const aiState = aiSuggestion[question.id];
    const effectivePlaceholder =
      question.placeholder || QUESTION_PLACEHOLDERS[question.question_number] || "";

    // Archetype visual selector
    if (isArchetypeQuestion) {
      const currentVal = answers[question.id] ?? "";
      return (
        <div>
          {isAntiArchetype && (
            <p className="mb-4 text-sm text-muted-foreground italic">
              Which archetype is the OPPOSITE of your brand? What personality would feel inauthentic?
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((arch) => {
              const isSelected = currentVal === arch.name;
              return (
                <button
                  key={arch.name}
                  type="button"
                  onClick={() => updateAnswer(question.id, arch.name)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[var(--teal)] bg-[var(--teal)]/5 shadow-md"
                      : "border-border bg-background hover:border-[var(--teal)]/30 hover:bg-muted/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--teal)]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <p className="font-[family-name:var(--font-oswald)] text-sm font-bold text-[var(--navy)]">
                    {arch.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {arch.desc}
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium text-[var(--teal)]">
                    e.g. {arch.example}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    switch (question.question_type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={effectivePlaceholder}
            value={value}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
            autoFocus
          />
        );

      case "textarea": {
        const wordCount = countWords(value);
        const hasFocused = focusedFields[question.id] ?? false;
        const showDetailWarning =
          question.required && hasFocused && wordCount < 10 && value.length > 0;

        return (
          <div>
            <textarea
              rows={5}
              placeholder={effectivePlaceholder}
              value={value}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              onFocus={() =>
                setFocusedFields((prev) => ({ ...prev, [question.id]: true }))
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--coral)] focus:outline-none focus:ring-2 focus:ring-[var(--coral)]/20"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between">
              <div>
                {showDetailWarning && (
                  <p className="text-xs text-amber-500">
                    \ud83d\udca1 More detail will produce a better strategy
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
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
            <option value="">{effectivePlaceholder || "Select an option..."}</option>
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
            placeholder={effectivePlaceholder}
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
          {/* Section intro banner */}
          {sectionIntro && (
            <div className="mb-4 rounded-lg border border-[var(--teal)]/20 bg-[var(--teal)]/5 px-5 py-4">
              <h3 className="font-[family-name:var(--font-oswald)] text-sm font-bold text-[var(--teal)]">
                {currentSection.section_name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {sectionIntro}
              </p>
            </div>
          )}

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
