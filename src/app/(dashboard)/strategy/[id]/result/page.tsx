"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  FileDown,
  Presentation,
  Share2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Target,
  Users,
  Megaphone,
  PenTool,
  Globe,
  Lightbulb,
  Route,
  Shield,
  Rocket,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  GitBranch,
  LineChart,
  Compass,
} from "lucide-react";

interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  status: "complete" | "error";
  qualityScore: number;
}

const SECTION_ICONS: Record<string, typeof Target> = {
  "exec-summary": Sparkles,
  "market-analysis": BarChart3,
  "target-audience": Users,
  "competitive-position": Target,
  "brand-strategy": PenTool,
  "value-prop": Lightbulb,
  "marketing-goals": Compass,
  "channel-strategy": Globe,
  "content-strategy": Megaphone,
  "customer-journey": GitBranch,
  "marketing-calendar": CalendarDays,
  "growth-strategy": TrendingUp,
  "analytics": LineChart,
  "implementation": Route,
  "risk-management": Shield,
};

export default function StrategyResultPage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Load generated sections from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`strategy_result_${strategyId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GeneratedSection[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
    setLoading(false);
  }, [strategyId]);

  const activeSection = sections[activeSectionIdx];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your strategy...</span>
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
            No Strategy Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It looks like the strategy hasn&apos;t been generated yet, or the
            data has expired. Please generate your strategy first.
          </p>
          <Link
            href={`/strategy/${strategyId}/review`}
            className="mt-4 inline-block rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral/90"
          >
            Go to Review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-4">
            <Link
              href="/strategy/new"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h2 className="mt-3 font-[family-name:var(--font-oswald)] text-base font-semibold text-navy">
              Your Strategy
            </h2>
            <p className="text-xs text-muted-foreground">
              {sections.length} sections generated
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {sections.map((section, idx) => {
              const Icon = SECTION_ICONS[section.id] || Sparkles;
              const isActive = idx === activeSectionIdx;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-coral/10 font-medium text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {section.title}
                  </span>
                  {section.qualityScore > 0 && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        section.qualityScore >= 95
                          ? "bg-emerald-100 text-emerald-700"
                          : section.qualityScore >= 90
                            ? "bg-teal/10 text-teal"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {section.qualityScore}%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              {activeSection && activeSection.qualityScore > 0 && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    activeSection.qualityScore >= 95
                      ? "bg-emerald-100 text-emerald-700"
                      : activeSection.qualityScore >= 90
                        ? "bg-teal/10 text-teal"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  Quality: {activeSection.qualityScore}%
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Section {activeSectionIdx + 1} of {sections.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : "Share"}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                <Presentation className="h-3.5 w-3.5" />
                PPTX
              </button>
              <Link
                href={`/strategy/${strategyId}/generating`}
                className="flex items-center gap-1.5 rounded-lg border border-coral/30 px-3 py-1.5 text-xs font-medium text-coral transition-colors hover:bg-coral/5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Link>
            </div>
          </div>

          {/* Mobile section selector */}
          <div className="border-t border-border px-6 py-2 lg:hidden">
            <select
              value={activeSectionIdx}
              onChange={(e) => setActiveSectionIdx(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {sections.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {idx + 1}. {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
          {activeSection && (
            <>
              {activeSection.status === "error" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                  <h3 className="mt-3 font-[family-name:var(--font-oswald)] text-lg font-semibold text-red-800">
                    Section Generation Failed
                  </h3>
                  <p className="mt-2 text-sm text-red-600">
                    {activeSection.content}
                  </p>
                </div>
              ) : (
                <article className="prose prose-sm max-w-none prose-headings:font-[family-name:var(--font-oswald)] prose-headings:text-navy prose-h2:text-2xl prose-h3:text-lg prose-p:text-foreground prose-strong:text-foreground prose-table:text-sm prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-li:text-foreground prose-a:text-coral">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeSection.content}
                  </ReactMarkdown>
                </article>
              )}

              {/* Section navigation */}
              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={activeSectionIdx === 0}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Section
                </button>
                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) =>
                      Math.min(sections.length - 1, prev + 1)
                    )
                  }
                  disabled={activeSectionIdx === sections.length - 1}
                  className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next Section
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
