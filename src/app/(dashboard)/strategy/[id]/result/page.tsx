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
  CheckCircle2,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  status: "complete" | "error";
  qualityScore: number;
}

const CHAPTER_TITLES = [
  "Brand Story & Origin",
  "Market Analysis",
  "Target Audience Profile",
  "Brand Positioning Statement",
  "Competitive Analysis Matrix",
  "Brand Archetype & Personality",
  "Brand Values & Mission",
  "Jobs-To-Be-Done Framework",
  "Customer Journey Map",
  "Tone of Voice Guidelines",
  "Visual Identity Direction",
  "Mood Board & Visual References",
  "Communication Strategy",
  "Growth Roadmap",
  "Action Plan & Implementation",
];

function QualityBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-400";
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${color}`}>
      <Star className="h-2.5 w-2.5 fill-current" />
      {score}
    </span>
  );
}

export default function StrategyResultPage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [sections, setSections] = useState<GeneratedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load generated sections: try Supabase first, fallback to localStorage
  useEffect(() => {
    async function loadSections() {
      try {
        const supabase = createClient();
        const { data: strategy } = await supabase
          .from("strategies")
          .select("*, strategy_sections(*)")
          .eq("strategy_project_id", strategyId)
          .maybeSingle();

        if (strategy?.strategy_sections && strategy.strategy_sections.length > 0) {
          const dbSections: GeneratedSection[] = strategy.strategy_sections
            .sort((a: { section_number: number }, b: { section_number: number }) => a.section_number - b.section_number)
            .map((s: { section_type: string; section_title: string; content: { markdown?: string } | string; quality_score: number | null }) => ({
              id: s.section_type,
              title: s.section_title,
              content: typeof s.content === "object" && s.content !== null && "markdown" in s.content
                ? (s.content as { markdown: string }).markdown
                : String(s.content ?? ""),
              status: "complete" as const,
              qualityScore: (s.quality_score || 0) * 10,
            }));
          setSections(dbSections);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to load strategy from DB, falling back to localStorage:", err);
      }

      // Fallback: try localStorage (for strategies generated before DB persistence)
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
    }

    loadSections();
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

  // Scroll to top when changing chapters
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSectionIdx]);

  const activeSection = sections[activeSectionIdx];
  const chapterNum = String(activeSectionIdx + 1).padStart(2, "0");
  const totalChapters = sections.length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const [exporting, setExporting] = useState(false);

  const handleExportPDF = () => {
    setExporting(true);

    // Build a printable HTML document with all 15 sections
    const printContent = sections.map((section, idx) => {
      // Convert markdown to simple HTML
      const htmlContent = section.content
        .replace(/^### (.*$)/gm, '<h3 style="font-family:Oswald,sans-serif;color:#1A1A2E;font-size:16px;margin-top:20px;">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="font-family:Oswald,sans-serif;color:#1A1A2E;font-size:20px;margin-top:24px;border-bottom:1px solid #e0e0e0;padding-bottom:6px;">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="font-family:Oswald,sans-serif;color:#1A1A2E;font-size:24px;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A1A2E;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left:20px;margin-bottom:4px;list-style-type:decimal;">$2</li>')
        .replace(/\n\n/g, '</p><p style="margin:10px 0;line-height:1.7;">')
        .replace(/\n/g, '<br/>');

      return `
        <div style="page-break-before:${idx > 0 ? 'always' : 'auto'};padding:40px 0;">
          <div style="color:#2AB9B0;font-family:Oswald,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">
            Chapter ${String(idx + 1).padStart(2, '0')}
          </div>
          <h1 style="font-family:Oswald,sans-serif;color:#1A1A2E;font-size:28px;text-transform:uppercase;margin:0 0 16px 0;">
            ${section.title}
          </h1>
          <hr style="border:none;height:2px;background:#2AB9B0;width:60px;margin:0 0 24px 0;"/>
          <div style="font-family:Inter,sans-serif;font-size:13px;color:#333;line-height:1.8;">
            <p style="margin:10px 0;line-height:1.7;">${htmlContent}</p>
          </div>
        </div>`;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setExporting(false);
      alert("Please allow popups to export PDF");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Brand Strategy Deck</title>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { margin: 50px 60px; size: A4; }
          body { font-family: Inter, sans-serif; color: #333; margin: 0; padding: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div style="height:100vh;display:flex;flex-direction:column;justify-content:center;padding:60px;">
          <div style="color:#2AB9B0;font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:4px;">Brand Strategy</div>
          <h1 style="font-family:Oswald,sans-serif;color:#1A1A2E;font-size:48px;margin:16px 0 8px 0;text-transform:uppercase;">Strategy Deck</h1>
          <div style="height:3px;width:80px;background:#2AB9B0;margin:16px 0;"></div>
          <p style="font-size:14px;color:#666;margin-top:24px;">Generated by Advertising Unplugged</p>
          <p style="font-size:12px;color:#999;margin-top:8px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        ${printContent}

        <!-- Back Cover -->
        <div style="page-break-before:always;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
          <div style="color:#2AB9B0;font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:4px;margin-bottom:16px;">Advertising Unplugged</div>
          <p style="font-size:14px;color:#666;">Clarity Over Noise. Purpose Beyond Profit.</p>
          <p style="font-size:12px;color:#999;margin-top:16px;">advertisingunplugged.com</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for fonts to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      setExporting(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--teal,#2AB9B0)]" />
          <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.2em] text-[var(--navy,#1A1A2E)]/60">
            Loading your strategy deck...
          </span>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md px-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--teal,#2AB9B0)]/10">
            <AlertCircle className="h-8 w-8 text-[var(--teal,#2AB9B0)]" />
          </div>
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
            No Strategy Found
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-12 bg-[var(--teal,#2AB9B0)]" />
          <p className="mt-6 text-sm leading-relaxed text-[var(--navy,#1A1A2E)]/60">
            It looks like the strategy hasn&apos;t been generated yet, or the
            data has expired. Please generate your strategy first.
          </p>
          <Link
            href={`/strategy/${strategyId}/review`}
            className="mt-8 inline-block rounded-lg bg-[var(--teal,#2AB9B0)] px-6 py-3 font-[family-name:var(--font-oswald)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[var(--teal,#2AB9B0)]/90"
          >
            Go to Review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F8FA]">
      {/* ================================================================ */}
      {/* LEFT SIDEBAR — Chapter navigation (desktop) */}
      {/* ================================================================ */}
      <aside className="hidden w-64 shrink-0 border-r border-[var(--navy,#1A1A2E)]/10 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Sidebar header */}
          <div className="border-b border-[var(--navy,#1A1A2E)]/10 px-5 py-5">
            <p className="font-[family-name:var(--font-oswald)] text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--navy,#1A1A2E)]/40">
              Brand Strategy Deck
            </p>
            <p className="mt-1 font-[family-name:var(--font-oswald)] text-sm font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
              {totalChapters} Chapters
            </p>
          </div>

          {/* Chapter list */}
          <nav className="flex-1 overflow-y-auto py-1">
            {sections.map((section, idx) => {
              const isActive = idx === activeSectionIdx;
              const num = String(idx + 1).padStart(2, "0");
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`group flex w-full items-start gap-3 border-l-[3px] px-5 py-3 text-left transition-all ${
                    isActive
                      ? "border-l-[var(--teal,#2AB9B0)] bg-[var(--navy,#1A1A2E)] text-white"
                      : "border-l-transparent text-[var(--navy,#1A1A2E)]/50 hover:bg-[var(--navy,#1A1A2E)]/[0.03] hover:text-[var(--navy,#1A1A2E)]/80"
                  }`}
                >
                  <span
                    className={`mt-0.5 font-[family-name:var(--font-oswald)] text-[11px] font-bold tracking-wider ${
                      isActive ? "text-[var(--teal,#2AB9B0)]" : "text-[var(--navy,#1A1A2E)]/30 group-hover:text-[var(--navy,#1A1A2E)]/50"
                    }`}
                  >
                    {num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-medium leading-tight ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      {section.title}
                    </span>
                    <div className="mt-1">
                      <QualityBadge score={section.qualityScore} />
                    </div>
                  </div>
                  {section.status === "complete" && isActive && (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--teal,#2AB9B0)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <main className="min-w-0 flex-1">
        {/* ---- Top bar ---- */}
        <div className="sticky top-0 z-10 border-b border-[var(--navy,#1A1A2E)]/10 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3 lg:px-8">
            <div className="flex items-center gap-4">
              <h1 className="font-[family-name:var(--font-oswald)] text-lg font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]">
                Brand Strategy
              </h1>
              <span className="rounded-full bg-[var(--navy,#1A1A2E)]/5 px-3 py-0.5 font-[family-name:var(--font-oswald)] text-[11px] font-semibold uppercase tracking-wider text-[var(--navy,#1A1A2E)]/50">
                Chapter {chapterNum} of {String(totalChapters).padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/70 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03] disabled:opacity-50"
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{exporting ? "Preparing..." : "Export PDF"}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/70 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03]"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/70 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03] disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          {/* Mobile chapter selector */}
          <div className="border-t border-[var(--navy,#1A1A2E)]/10 px-6 py-2 lg:hidden">
            <select
              value={activeSectionIdx}
              onChange={(e) => setActiveSectionIdx(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--navy,#1A1A2E)]/10 bg-white px-3 py-2 font-[family-name:var(--font-oswald)] text-sm text-[var(--navy,#1A1A2E)]"
            >
              {sections.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {String(idx + 1).padStart(2, "0")} — {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---- Chapter content ---- */}
        <div className="mx-auto max-w-[860px] px-6 py-10 lg:px-10">
          {activeSection && (
            <>
              {/* ======== Chapter title page ======== */}
              <div className="mb-10">
                <p className="font-[family-name:var(--font-oswald)] text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--teal,#2AB9B0)]">
                  Chapter {chapterNum}
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-oswald)] text-[36px] font-bold uppercase leading-[1.1] tracking-wide text-[var(--navy,#1A1A2E)] sm:text-[44px]">
                  {activeSection.title}
                </h2>
                <div className="mt-5 h-[3px] w-16 bg-[var(--teal,#2AB9B0)]" />
              </div>

              {/* ======== Content card ======== */}
              <div className="rounded-[4px] bg-white px-8 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-12 sm:py-12">
                {activeSection.status === "error" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
                    <h3 className="mt-4 font-[family-name:var(--font-oswald)] text-lg font-bold uppercase tracking-wider text-red-800">
                      Section Generation Failed
                    </h3>
                    <p className="mt-2 text-sm text-red-600">
                      {activeSection.content}
                    </p>
                  </div>
                ) : (
                  <article className="strategy-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children, ...props }) => (
                          <h1
                            className="mb-6 mt-10 font-[family-name:var(--font-oswald)] text-[28px] font-bold uppercase tracking-wide text-[var(--navy,#1A1A2E)] first:mt-0"
                            {...props}
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children, ...props }) => {
                          const text =
                            typeof children === "string"
                              ? children
                              : Array.isArray(children)
                                ? children.join("")
                                : String(children ?? "");

                          // "Key Takeaways" special box
                          if (text.toLowerCase().includes("key takeaway")) {
                            return (
                              <div className="my-8 rounded-[4px] border-l-[4px] border-l-[var(--teal,#2AB9B0)] bg-[var(--teal,#2AB9B0)]/[0.04] px-7 py-5">
                                <h2
                                  className="font-[family-name:var(--font-oswald)] text-[18px] font-bold uppercase tracking-wider text-[var(--navy,#1A1A2E)]"
                                  {...props}
                                >
                                  {children}
                                </h2>
                              </div>
                            );
                          }

                          // "Recommended Actions" special box
                          if (
                            text.toLowerCase().includes("recommended action") ||
                            text.toLowerCase().includes("action item")
                          ) {
                            return (
                              <div className="my-8 rounded-[4px] bg-[var(--navy,#1A1A2E)] px-7 py-5">
                                <h2
                                  className="font-[family-name:var(--font-oswald)] text-[18px] font-bold uppercase tracking-wider text-white"
                                  {...props}
                                >
                                  {children}
                                </h2>
                              </div>
                            );
                          }

                          // "What X IS / is NOT" comparison style
                          if (
                            text.toLowerCase().includes(" is and") ||
                            text.toLowerCase().includes(" is not") ||
                            text.toLowerCase().includes(" isn't")
                          ) {
                            return (
                              <div className="my-8 border-b-[2px] border-b-[var(--navy,#1A1A2E)]/10 pb-2">
                                <h2
                                  className="font-[family-name:var(--font-oswald)] text-[20px] font-bold uppercase tracking-wide text-[var(--navy,#1A1A2E)]"
                                  {...props}
                                >
                                  {children}
                                </h2>
                              </div>
                            );
                          }

                          // Default h2
                          return (
                            <h2
                              className="mb-4 mt-10 border-b-[2px] border-b-[var(--navy,#1A1A2E)]/10 pb-2 font-[family-name:var(--font-oswald)] text-[20px] font-bold uppercase tracking-wide text-[var(--navy,#1A1A2E)] first:mt-0"
                              {...props}
                            >
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children, ...props }) => (
                          <h3
                            className="mb-3 mt-8 font-[family-name:var(--font-oswald)] text-[17px] font-semibold uppercase tracking-wide text-[var(--teal,#2AB9B0)]"
                            {...props}
                          >
                            {children}
                          </h3>
                        ),
                        h4: ({ children, ...props }) => (
                          <h4
                            className="mb-2 mt-6 font-[family-name:var(--font-oswald)] text-[15px] font-semibold uppercase tracking-wide text-[var(--navy,#1A1A2E)]/70"
                            {...props}
                          >
                            {children}
                          </h4>
                        ),
                        p: ({ children, ...props }) => (
                          <p
                            className="mb-4 text-[15px] leading-[1.8] text-[var(--navy,#1A1A2E)]/75"
                            {...props}
                          >
                            {children}
                          </p>
                        ),
                        strong: ({ children, ...props }) => (
                          <strong
                            className="font-semibold text-[var(--navy,#1A1A2E)]"
                            {...props}
                          >
                            {children}
                          </strong>
                        ),
                        em: ({ children, ...props }) => (
                          <em className="text-[var(--navy,#1A1A2E)]/60" {...props}>
                            {children}
                          </em>
                        ),
                        blockquote: ({ children, ...props }) => (
                          <blockquote
                            className="my-6 rounded-r-[4px] border-l-[4px] border-l-[var(--teal,#2AB9B0)] bg-[var(--navy,#1A1A2E)]/[0.02] px-6 py-4 italic text-[var(--navy,#1A1A2E)]/70 [&>p]:mb-0"
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children, ...props }) => (
                          <ul
                            className="my-4 space-y-2 pl-0"
                            {...props}
                          >
                            {children}
                          </ul>
                        ),
                        ol: ({ children, ...props }) => (
                          <ol
                            className="my-4 space-y-2 pl-0 [counter-reset:item]"
                            {...props}
                          >
                            {children}
                          </ol>
                        ),
                        li: ({ children, ...props }) => (
                          <li
                            className="flex items-start gap-3 text-[15px] leading-[1.8] text-[var(--navy,#1A1A2E)]/75"
                            style={{ listStyle: "none" }}
                            {...props}
                          >
                            <span className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--teal,#2AB9B0)]" />
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        table: ({ children, ...props }) => (
                          <div className="my-6 overflow-x-auto rounded-[4px] border border-[var(--navy,#1A1A2E)]/10">
                            <table
                              className="w-full text-[14px]"
                              {...props}
                            >
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children, ...props }) => (
                          <thead
                            className="bg-[var(--navy,#1A1A2E)] text-white"
                            {...props}
                          >
                            {children}
                          </thead>
                        ),
                        th: ({ children, ...props }) => (
                          <th
                            className="px-4 py-3 text-left font-[family-name:var(--font-oswald)] text-[12px] font-semibold uppercase tracking-wider"
                            {...props}
                          >
                            {children}
                          </th>
                        ),
                        td: ({ children, ...props }) => (
                          <td
                            className="border-b border-[var(--navy,#1A1A2E)]/5 px-4 py-3 text-[14px] text-[var(--navy,#1A1A2E)]/70"
                            {...props}
                          >
                            {children}
                          </td>
                        ),
                        tr: ({ children, ...props }) => (
                          <tr
                            className="transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.02]"
                            {...props}
                          >
                            {children}
                          </tr>
                        ),
                        hr: () => (
                          <div className="my-8 flex items-center gap-3">
                            <div className="h-[2px] flex-1 bg-[var(--navy,#1A1A2E)]/5" />
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--teal,#2AB9B0)]" />
                            <div className="h-[2px] flex-1 bg-[var(--navy,#1A1A2E)]/5" />
                          </div>
                        ),
                        a: ({ children, ...props }) => (
                          <a
                            className="font-medium text-[var(--teal,#2AB9B0)] underline decoration-[var(--teal,#2AB9B0)]/30 underline-offset-2 transition-colors hover:text-[var(--teal,#2AB9B0)]/80"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                        code: ({ children, className, ...props }) => {
                          const isBlock = className?.includes("language-");
                          if (isBlock) {
                            return (
                              <code
                                className="block overflow-x-auto rounded-[4px] bg-[var(--navy,#1A1A2E)] p-5 text-[13px] leading-relaxed text-[var(--teal,#2AB9B0)]"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code
                              className="rounded bg-[var(--navy,#1A1A2E)]/5 px-1.5 py-0.5 text-[13px] font-medium text-[var(--navy,#1A1A2E)]"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {activeSection.content}
                    </ReactMarkdown>
                  </article>
                )}
              </div>

              {/* ======== Chapter navigation ======== */}
              <div className="mt-10 flex items-center justify-between">
                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) => Math.max(0, prev - 1))
                  }
                  disabled={activeSectionIdx === 0}
                  className="group flex items-center gap-3 rounded-[4px] border border-[var(--navy,#1A1A2E)]/10 bg-white px-5 py-3 transition-all hover:border-[var(--navy,#1A1A2E)]/20 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4 text-[var(--navy,#1A1A2E)]/40 transition-colors group-hover:text-[var(--navy,#1A1A2E)]" />
                  <div className="text-left">
                    <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-[var(--navy,#1A1A2E)]/40">
                      Previous
                    </p>
                    <p className="text-[13px] font-medium text-[var(--navy,#1A1A2E)]">
                      {activeSectionIdx > 0
                        ? sections[activeSectionIdx - 1]?.title
                        : "—"}
                    </p>
                  </div>
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {sections.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSectionIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeSectionIdx
                          ? "w-6 bg-[var(--teal,#2AB9B0)]"
                          : "w-1.5 bg-[var(--navy,#1A1A2E)]/10 hover:bg-[var(--navy,#1A1A2E)]/25"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setActiveSectionIdx((prev) =>
                      Math.min(sections.length - 1, prev + 1)
                    )
                  }
                  disabled={activeSectionIdx === sections.length - 1}
                  className="group flex items-center gap-3 rounded-[4px] bg-[var(--navy,#1A1A2E)] px-5 py-3 text-white transition-all hover:bg-[var(--navy,#1A1A2E)]/90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-white/50">
                      Next
                    </p>
                    <p className="text-[13px] font-medium">
                      {activeSectionIdx < sections.length - 1
                        ? sections[activeSectionIdx + 1]?.title
                        : "—"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/50 transition-colors group-hover:text-white" />
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-6 text-center text-[11px] text-[var(--navy,#1A1A2E)]/30">
                Use arrow keys to navigate between chapters
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
