"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  Share2,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  status: "complete" | "error";
  qualityScore: number;
}

const SECTION_TITLES = [
  "Brand Identity",
  "Market Analysis",
  "Competitive Positioning",
  "Target Audience Deep Dive",
  "Unique Value Proposition",
  "Messaging Framework",
  "Visual Strategy",
  "Channel Strategy",
  "Content Pillars",
  "Campaign Ideas",
  "Metrics & KPIs",
  "Budget Allocation",
  "90-Day Roadmap",
  "Risk Mitigation",
  "Next Steps",
];

export default function StrategyResultPage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (sections.length === 0) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSectionIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSectionIdx((prev) =>
          Math.min(sections.length - 1, prev + 1)
        );
      }
    },
    [sections.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activeSection = sections[activeSectionIdx];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
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
          <AlertCircle className="mx-auto h-10 w-10 text-[#2AB9B0]" />
          <h2 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[#1A1A2E]">
            No Strategy Found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It looks like the strategy hasn&apos;t been generated yet, or the
            data has expired. Please generate your strategy first.
          </p>
          <Link
            href={`/strategy/${strategyId}/review`}
            className="mt-4 inline-block rounded-lg bg-[#2AB9B0] px-4 py-2 text-sm font-medium text-white hover:bg-[#2AB9B0]/90"
          >
            Go to Review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-4">
            <h2 className="font-[family-name:var(--font-oswald)] text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Strategy Sections
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {sections.map((section, idx) => {
              const isActive = idx === activeSectionIdx;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "border-l-[#2AB9B0] bg-[#2AB9B0]/5 font-medium text-[#1A1A2E]"
                      : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold ${
                      isActive
                        ? "bg-[#2AB9B0] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {section.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <h1 className="font-[family-name:var(--font-oswald)] text-[20px] font-semibold text-[#1A1A2E]">
                Your Strategy
              </h1>
              <span className="text-xs text-muted-foreground">
                Section {activeSectionIdx + 1} of {sections.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <button
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
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
        <div className="mx-auto max-w-[900px] px-6 py-8 lg:px-10">
          {activeSection && (
            <>
              {/* White card container */}
              <div className="rounded-[12px] bg-white p-10 shadow-md">
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
                  <>
                    {/* Section heading */}
                    <h2 className="mb-6 font-[family-name:var(--font-oswald)] text-[28px] font-bold text-[#1A1A2E]">
                      {activeSectionIdx + 1}. {activeSection.title}
                    </h2>

                    {/* Markdown content */}
                    <article className="prose prose-sm max-w-none prose-headings:font-[family-name:var(--font-oswald)] prose-headings:text-[#1A1A2E] prose-h2:mt-8 prose-h2:text-xl prose-h3:text-lg prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-table:text-sm prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-li:text-foreground prose-a:text-[#2AB9B0]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children, ...props }) => {
                            const text =
                              typeof children === "string"
                                ? children
                                : Array.isArray(children)
                                  ? children.join("")
                                  : String(children ?? "");

                            // Key Takeaways gets special styling
                            if (text.toLowerCase().includes("key takeaway")) {
                              return (
                                <div className="mt-8 mb-4 rounded-lg border-l-4 border-l-[#2AB9B0] bg-[#2AB9B0]/5 px-6 py-4">
                                  <h2
                                    className="!mt-0 !mb-0 font-[family-name:var(--font-oswald)] text-xl font-bold text-[#1A1A2E]"
                                    {...props}
                                  >
                                    {children}
                                  </h2>
                                </div>
                              );
                            }

                            // Recommended Actions gets special styling
                            if (
                              text.toLowerCase().includes("recommended action") ||
                              text.toLowerCase().includes("action item")
                            ) {
                              return (
                                <div className="mt-8 mb-4 rounded-lg bg-gradient-to-r from-[#2AB9B0]/10 to-[#1A1A2E]/5 px-6 py-4">
                                  <h2
                                    className="!mt-0 !mb-0 font-[family-name:var(--font-oswald)] text-xl font-bold text-[#1A1A2E]"
                                    {...props}
                                  >
                                    {children}
                                  </h2>
                                </div>
                              );
                            }

                            return <h2 {...props}>{children}</h2>;
                          },
                        }}
                      >
                        {activeSection.content}
                      </ReactMarkdown>
                    </article>
                  </>
                )}
              </div>

              {/* Section navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={activeSectionIdx === 0}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="text-xs text-muted-foreground">
                  {activeSectionIdx + 1} / {sections.length}
                </span>

                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) =>
                      Math.min(sections.length - 1, prev + 1)
                    )
                  }
                  disabled={activeSectionIdx === sections.length - 1}
                  className="flex items-center gap-2 rounded-lg bg-[#2AB9B0] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2AB9B0]/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
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
