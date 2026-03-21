"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Swords,
  Gem,
  Target,
  AlertTriangle,
  Rocket,
  Pencil,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SECTIONS = [
  {
    id: "business-foundation",
    title: "Business Foundation",
    icon: Building2,
    answers: [
      { question: "What does your business do in one sentence?", answer: "We help small businesses build professional brand strategies using AI-powered tools and marketing templates." },
      { question: "How long has your business been operating?", answer: "1-3 years" },
      { question: "Current annual revenue range", answer: "$100K-$500K" },
      { question: "Number of employees", answer: "6-15" },
      { question: "What makes your business different?", answer: "Our AI combines the strategic depth of a marketing agency with the affordability and speed of a self-service tool." },
      { question: "Company mission statement", answer: "To democratize professional brand strategy for businesses that can't afford top-tier agencies." },
    ],
  },
  {
    id: "target-audience",
    title: "Target Audience",
    icon: Users,
    answers: [
      { question: "Describe your ideal customer", answer: "SME founders and marketing managers aged 28-45, in growth-stage companies with $500K-$5M revenue, who know they need better marketing but don't have agency budgets." },
      { question: "Primary problem you solve", answer: "They waste time and money on unfocused marketing because they lack a cohesive strategy." },
      { question: "Where do customers find you?", answer: "LinkedIn content, Google search, and referrals from existing customers." },
      { question: "Average customer lifetime value", answer: "$2,400" },
      { question: "Typical sales cycle", answer: "1-4 weeks" },
    ],
  },
  {
    id: "competitive-landscape",
    title: "Competitive Landscape",
    icon: Swords,
    answers: [
      { question: "Top 3 competitors", answer: "Canva, HubSpot, and traditional marketing agencies" },
      { question: "What competitors do better", answer: "Canva has better design tools; HubSpot has deeper CRM integration; agencies provide more personalised service." },
      { question: "What you do better", answer: "We combine strategy + templates + AI in one platform at a fraction of agency cost." },
      { question: "Market saturation", answer: "Moderate competition" },
      { question: "Market trends affecting your industry", answer: "AI adoption in marketing, DIY brand building, and the shift from agency retainers to SaaS tools." },
    ],
  },
  {
    id: "value-proposition",
    title: "Value Proposition",
    icon: Gem,
    answers: [
      { question: "Core value proposition", answer: "Professional brand strategy in 24 hours, not 24 weeks." },
      { question: "Emotional benefit", answer: "Confidence that their marketing is strategic, not guesswork." },
      { question: "Pricing strategy", answer: "Subscription" },
      { question: "Proof points", answer: "4,200+ strategies generated, 92% satisfaction rate, featured in MarketingWeek." },
      { question: "Brand voice in 3 words", answer: "Bold, Clear, Empowering" },
      { question: "Tagline", answer: "Clarity Over Noise." },
    ],
  },
  {
    id: "marketing-goals",
    title: "Marketing Goals",
    icon: Target,
    answers: [
      { question: "#1 marketing goal for next 90 days", answer: "Increase monthly signups from 200 to 500." },
      { question: "Monthly marketing budget", answer: "$5,000-$10,000" },
      { question: "Current marketing channels", answer: "LinkedIn organic, Google Ads, email newsletter, blog content." },
      { question: "Success in 12 months", answer: "10,000 active users, $2M ARR, recognized as a category leader in AI-driven brand strategy." },
      { question: "KPIs you track", answer: "MRR, signup conversion rate, churn rate, NPS, CAC, LTV." },
      { question: "How you generate leads", answer: "Content marketing, free template downloads, and Google Ads." },
    ],
  },
  {
    id: "current-challenges",
    title: "Current Challenges",
    icon: AlertTriangle,
    answers: [
      { question: "Biggest marketing challenge", answer: "Converting free users to paid plans — our freemium-to-paid conversion is only 3%." },
      { question: "Tactics that didn't work", answer: "Facebook Ads had high CPC and low-quality leads. Cold email outreach had very low response rates." },
      { question: "Missing resources or skills", answer: "Dedicated content creator and a performance marketing specialist." },
      { question: "Biggest constraint", answer: "Team / talent" },
      { question: "Brand consistency rating", answer: "6" },
    ],
  },
  {
    id: "future-vision",
    title: "Future Vision",
    icon: Rocket,
    answers: [
      { question: "Where in 3 years?", answer: "The go-to AI strategy platform for SMEs globally, with 100K users across 50 countries." },
      { question: "New markets or audiences", answer: "Expanding into European and APAC markets, and targeting marketing agencies as resellers." },
      { question: "New products or services planned", answer: "AI creative assistant, strategy implementation tracking, and a marketplace for freelance marketers." },
      { question: "Role of marketing in growth", answer: "Marketing should be the primary growth engine, generating 80% of new customer acquisition." },
      { question: "Anything else?", answer: "We're raising a Series A in Q3 and want the strategy to support investor conversations." },
      { question: "Commitment level", answer: "All-in — this is a top priority" },
    ],
  },
];

export default function ReviewPage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalAnswers = SECTIONS.reduce((sum, s) => sum + s.answers.length, 0);

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
            Review all {totalAnswers} answers across {SECTIONS.length} sections
            before generating your strategy. Make sure everything is accurate.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section summaries */}
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
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
                      <Icon className="h-4.5 w-4.5" />
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
            Estimated generation time: 2-3 minutes
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
