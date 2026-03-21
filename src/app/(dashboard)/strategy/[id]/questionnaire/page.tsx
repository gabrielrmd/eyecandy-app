"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Save,
  Loader2,
  Building2,
  Users,
  Swords,
  Gem,
  Target,
  AlertTriangle,
  Rocket,
} from "lucide-react";

interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder: string;
  options?: string[];
}

interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: typeof Building2;
  questions: Question[];
}

const SECTIONS: SectionDef[] = [
  {
    id: "business-foundation",
    title: "Business Foundation",
    description:
      "Tell us about your business basics — what you do, how you started, and where you stand today.",
    icon: Building2,
    questions: [
      { id: "bf-1", label: "What does your business do in one sentence?", type: "textarea", placeholder: "We help [audience] achieve [outcome] through [method]" },
      { id: "bf-2", label: "How long has your business been operating?", type: "select", placeholder: "Select duration", options: ["Pre-launch", "Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"] },
      { id: "bf-3", label: "What is your current annual revenue range?", type: "select", placeholder: "Select range", options: ["Pre-revenue", "Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$5M", "$5M-$10M", "$10M+"] },
      { id: "bf-4", label: "How many employees do you have?", type: "select", placeholder: "Select size", options: ["Solo founder", "2-5", "6-15", "16-50", "51-200", "200+"] },
      { id: "bf-5", label: "What makes your business different from competitors?", type: "textarea", placeholder: "Describe your unique selling proposition..." },
      { id: "bf-6", label: "What is your company mission statement?", type: "textarea", placeholder: "Our mission is to..." },
    ],
  },
  {
    id: "target-audience",
    title: "Target Audience",
    description:
      "Help us understand who your ideal customers are and how they find you.",
    icon: Users,
    questions: [
      { id: "ta-1", label: "Describe your ideal customer in detail", type: "textarea", placeholder: "Age, role, industry, pain points, aspirations..." },
      { id: "ta-2", label: "What is the primary problem you solve for them?", type: "textarea", placeholder: "The biggest problem our customers face is..." },
      { id: "ta-3", label: "Where do your customers currently find you?", type: "textarea", placeholder: "Social media, referrals, search, events..." },
      { id: "ta-4", label: "What is your average customer lifetime value?", type: "text", placeholder: "e.g., $5,000" },
      { id: "ta-5", label: "How long is your typical sales cycle?", type: "select", placeholder: "Select duration", options: ["Instant / impulse buy", "1-7 days", "1-4 weeks", "1-3 months", "3-6 months", "6+ months"] },
    ],
  },
  {
    id: "competitive-landscape",
    title: "Competitive Landscape",
    description: "Tell us about your market position and key competitors.",
    icon: Swords,
    questions: [
      { id: "cl-1", label: "Name your top 3 competitors", type: "textarea", placeholder: "Competitor 1, Competitor 2, Competitor 3" },
      { id: "cl-2", label: "What do your competitors do better than you?", type: "textarea", placeholder: "Be honest about competitive advantages they hold..." },
      { id: "cl-3", label: "What do you do better than your competitors?", type: "textarea", placeholder: "Describe your competitive advantages..." },
      { id: "cl-4", label: "How saturated is your market?", type: "select", placeholder: "Select market saturation", options: ["Blue ocean (new category)", "Low competition", "Moderate competition", "Highly competitive", "Oversaturated"] },
      { id: "cl-5", label: "What market trends are affecting your industry?", type: "textarea", placeholder: "Emerging trends, technology shifts, regulatory changes..." },
    ],
  },
  {
    id: "value-proposition",
    title: "Value Proposition",
    description:
      "Define the core value you deliver and how you communicate it.",
    icon: Gem,
    questions: [
      { id: "vp-1", label: "What is your core value proposition?", type: "textarea", placeholder: "We provide [value] to [audience] unlike [alternative] because [reason]" },
      { id: "vp-2", label: "What emotional benefit do customers get?", type: "textarea", placeholder: "Confidence, peace of mind, excitement, belonging..." },
      { id: "vp-3", label: "What is your pricing strategy?", type: "select", placeholder: "Select strategy", options: ["Premium / luxury", "Value-based", "Competitive / market rate", "Freemium", "Low-cost leader", "Subscription"] },
      { id: "vp-4", label: "What proof points support your claims?", type: "textarea", placeholder: "Case studies, testimonials, data, awards..." },
      { id: "vp-5", label: "Describe your brand voice in 3 words", type: "text", placeholder: "e.g., Bold, Approachable, Expert" },
      { id: "vp-6", label: "What is your brand tagline or slogan?", type: "text", placeholder: "e.g., Just Do It" },
    ],
  },
  {
    id: "marketing-goals",
    title: "Marketing Goals",
    description: "Set clear goals and define what success looks like.",
    icon: Target,
    questions: [
      { id: "mg-1", label: "What is your #1 marketing goal for the next 90 days?", type: "textarea", placeholder: "Increase leads by 50%, launch new product, build awareness..." },
      { id: "mg-2", label: "What is your monthly marketing budget?", type: "select", placeholder: "Select budget", options: ["Under $500", "$500-$2,000", "$2,000-$5,000", "$5,000-$10,000", "$10,000-$25,000", "$25,000-$50,000", "$50,000+"] },
      { id: "mg-3", label: "Which marketing channels are you currently using?", type: "textarea", placeholder: "Social media, email, SEO, paid ads, content, events..." },
      { id: "mg-4", label: "What does success look like in 12 months?", type: "textarea", placeholder: "Revenue target, market position, brand awareness..." },
      { id: "mg-5", label: "What KPIs do you currently track?", type: "textarea", placeholder: "Website traffic, conversion rate, CAC, LTV..." },
      { id: "mg-6", label: "How do you currently generate leads?", type: "textarea", placeholder: "Inbound, outbound, referrals, partnerships..." },
    ],
  },
  {
    id: "current-challenges",
    title: "Current Challenges",
    description:
      "Help us understand what's holding you back so we can address it.",
    icon: AlertTriangle,
    questions: [
      { id: "cc-1", label: "What is your biggest marketing challenge right now?", type: "textarea", placeholder: "Not enough leads, low conversion, brand confusion..." },
      { id: "cc-2", label: "What marketing tactics have you tried that didn't work?", type: "textarea", placeholder: "Describe past efforts and why they fell short..." },
      { id: "cc-3", label: "What internal resources or skills are you missing?", type: "textarea", placeholder: "Content creation, analytics, ad management..." },
      { id: "cc-4", label: "What is your biggest constraint?", type: "select", placeholder: "Select constraint", options: ["Budget", "Time", "Team / talent", "Knowledge / expertise", "Technology / tools", "All of the above"] },
      { id: "cc-5", label: "How do you rate your current brand consistency? (1-10)", type: "select", placeholder: "Select rating", options: ["1 - Very inconsistent", "2", "3", "4", "5 - Average", "6", "7", "8", "9", "10 - Perfectly consistent"] },
    ],
  },
  {
    id: "future-vision",
    title: "Future Vision",
    description:
      "Paint the picture of where you want to be and how you want to get there.",
    icon: Rocket,
    questions: [
      { id: "fv-1", label: "Where do you see your business in 3 years?", type: "textarea", placeholder: "Revenue, market position, team size, impact..." },
      { id: "fv-2", label: "Are there new markets or audiences you want to reach?", type: "textarea", placeholder: "New geographies, demographics, verticals..." },
      { id: "fv-3", label: "What new products or services are you planning?", type: "textarea", placeholder: "Upcoming launches, expansions, pivots..." },
      { id: "fv-4", label: "What role should marketing play in your growth?", type: "textarea", placeholder: "Lead generation engine, brand builder, community builder..." },
      { id: "fv-5", label: "Is there anything else we should know about your business?", type: "textarea", placeholder: "Any additional context, constraints, or aspirations..." },
      { id: "fv-6", label: "How committed are you to executing a new strategy?", type: "select", placeholder: "Select commitment level", options: ["Exploring options", "Fairly committed", "Very committed — ready to invest time and resources", "All-in — this is a top priority"] },
    ],
  },
];

export default function QuestionnairePage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const currentSection = SECTIONS[currentSectionIdx];
  const SectionIcon = currentSection.icon;

  // Calculate completion per section
  const sectionCompletion = SECTIONS.map((section) => {
    const answered = section.questions.filter(
      (q) => answers[q.id]?.trim()
    ).length;
    return { total: section.questions.length, answered };
  });

  const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const totalAnswered = Object.values(answers).filter((v) => v.trim()).length;
  const overallProgress = Math.round((totalAnswered / totalQuestions) * 100);

  // Auto-save simulation
  useEffect(() => {
    if (totalAnswered === 0) return;
    setSaveStatus("saving");
    const t = setTimeout(() => setSaveStatus("saved"), 1000);
    return () => clearTimeout(t);
  }, [answers, totalAnswered]);

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

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
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-navy sm:text-lg">
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
                Section {currentSectionIdx + 1} of {SECTIONS.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            {SECTIONS.map((_, i) => (
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
            {SECTIONS.map((section, idx) => {
              const { answered, total } = sectionCompletion[idx];
              const isActive = idx === currentSectionIdx;
              const isComplete = answered === total;
              const Icon = section.icon;

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
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
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
                      <Icon className="h-3.5 w-3.5" />
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
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <SectionIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-navy">
                  {currentSection.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentSection.description}
                </p>
              </div>
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
                    {question.label}
                  </label>

                  {question.type === "textarea" ? (
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
                  ) : question.type === "select" ? (
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

              {currentSectionIdx < SECTIONS.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentSectionIdx((prev) =>
                      Math.min(SECTIONS.length - 1, prev + 1)
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
        </main>
      </div>
    </div>
  );
}
