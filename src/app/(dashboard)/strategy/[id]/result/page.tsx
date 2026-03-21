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
  Pencil,
  Save,
  X,
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
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const startEditing = (idx: number) => {
    setEditingIdx(idx);
    setEditContent(sections[idx].content);
  };

  const cancelEditing = () => {
    setEditingIdx(null);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (editingIdx === null) return;
    setSaving(true);

    // Update local state
    const updated = [...sections];
    updated[editingIdx] = { ...updated[editingIdx], content: editContent };
    setSections(updated);

    // Update localStorage cache
    localStorage.setItem(`strategy_result_${strategyId}`, JSON.stringify(updated));

    // Update in Supabase
    try {
      const supabase = createClient();
      const { data: strategy } = await supabase
        .from("strategies")
        .select("id")
        .eq("strategy_project_id", strategyId)
        .maybeSingle();

      if (strategy) {
        await supabase
          .from("strategy_sections")
          .update({
            content: { markdown: editContent },
            updated_at: new Date().toISOString(),
          })
          .eq("strategy_id", strategy.id)
          .eq("section_number", editingIdx + 1);
      }
    } catch (err) {
      console.error("Failed to save edit to DB:", err);
    }

    setSaving(false);
    setEditingIdx(null);
    setEditContent("");
  };

  const handleExportPDF = () => {
    setExporting(true);

    // Use the white-text logo for dark backgrounds (as per brand book: "ON DARK BACKGROUNDS")
    // Use the color logo for white backgrounds
    const origin = window.location.origin;
    const logoWhite = `${origin}/brand/au-logo-white.png`;
    const logoColor = `${origin}/brand/au-logo.png`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr = new Date().getFullYear();
    const totalSections = sections.length;

    // Markdown → HTML
    function mdToHtml(md: string): string {
      let html = md;
      // Must process multi-line patterns before single-line
      html = html.replace(/^### (.*$)/gm, '<h3 class="sh3">$1</h3>');
      html = html.replace(/^## (.*$)/gm, (_, t: string) => {
        const l = t.toLowerCase();
        if (l.includes('key takeaway')) return `</div><div class="box tk"><p class="box-h tk-h">Key Takeaways</p><div class="box-body">`;
        if (l.includes('recommended action')) return `</div><div class="box ra"><p class="box-h ra-h">Recommended Actions</p><div class="box-body">`;
        return `<h2 class="sh2">${t}</h2>`;
      });
      html = html.replace(/^# (.*$)/gm, '<h1 class="sh1">$1</h1>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/^- (.*$)/gm, '<div class="bul"><span class="bul-d"></span><span class="bul-t">$1</span></div>');
      html = html.replace(/^(\d+)\. (.*$)/gm, '<div class="bul"><span class="bul-n">$1.</span><span class="bul-t">$2</span></div>');
      html = html.replace(/\n\n/g, '<br/><br/>');
      html = html.replace(/\n/g, '<br/>');
      return html;
    }

    // TOC
    const tocHtml = sections.map((s, i) =>
      `<div class="toc-row"><span class="toc-n">${String(i+1).padStart(2,'0')}</span><span class="toc-ln"></span><span class="toc-t">${s.title}</span></div>`
    ).join('');

    // Sections — NO fixed height, NO overflow hidden
    // Each section gets a page-break-before, content flows naturally
    const chaptersHtml = sections.map((section, idx) => {
      const n = String(idx + 1).padStart(2, '0');
      const bodyHtml = mdToHtml(section.content);
      return `
<div class="chapter-start">
  <p class="cs-n">${n}</p>
  <h1 class="cs-t">${section.title}</h1>
  <div class="cs-bar"></div>
</div>
<div class="chapter-body">
  <div class="cb-head">
    <span class="cb-label">Chapter ${n}</span>
    <span class="cb-date">${dateStr}</span>
  </div>
  <div class="cb-content"><div class="cb-inner">${bodyHtml}</div></div>
</div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (!w) { setExporting(false); alert("Allow popups to export PDF"); return; }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Brand Strategy Deck</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
/* ============================================================
   PRINT-OPTIMISED BRAND STRATEGY DECK
   Source of truth: Advertising_Unplugged_Brand_Guidelines v1.0
   Fonts: Oswald (headlines), Inter (body)
   Colors: Teal #2AB9B0, Charcoal #333, Dark #1A1A2E, Light #F5F5F5
   ============================================================ */

@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; font-size: 12px; color: #333;
       -webkit-print-color-adjust: exact; print-color-adjust: exact; }
img { image-rendering: -webkit-optimize-contrast; }

/* ---- COVER ---- */
.cover { width: 100%; height: 100vh; background: #1A1A2E; color: #fff;
         display: flex; flex-direction: column; justify-content: flex-end;
         padding: 0 90px 70px; page-break-after: always; position: relative; }
.cover-logo { width: 200px; height: auto; position: absolute; top: 60px; left: 90px; }
.cover-bar { width: 100%; height: 4px; margin-bottom: 44px;
             background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-lbl { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
             text-transform: uppercase; letter-spacing: 6px; color: #2AB9B0; margin-bottom: 14px; }
.cover-ttl { font-family: Oswald, sans-serif; font-size: 48px; font-weight: 700;
             color: #fff; line-height: 1.08; margin-bottom: 20px; }
.cover-sub { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.8; }
.cover-ft  { position: absolute; bottom: 32px; left: 90px; right: 90px;
             display: flex; justify-content: space-between;
             font-family: Oswald, sans-serif; font-size: 8px; letter-spacing: 2px;
             text-transform: uppercase; color: rgba(255,255,255,0.18); }

/* ---- TABLE OF CONTENTS ---- */
.toc-page { padding: 90px; page-break-after: always; }
.toc-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
             text-transform: uppercase; letter-spacing: 5px; color: #2AB9B0; margin-bottom: 44px; }
.toc-row { display: flex; align-items: baseline; gap: 12px; padding: 11px 0;
           border-bottom: 1px solid #F0F0F0; }
.toc-n { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 700;
         color: #2AB9B0; min-width: 24px; }
.toc-ln { flex: 1; border-bottom: 1px dotted #ddd; margin-bottom: 3px; }
.toc-t { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 400;
         color: #333; text-transform: uppercase; letter-spacing: 0.6px; }

/* ---- CHAPTER START (divider) ---- */
.chapter-start { page-break-before: always; height: 100vh; display: flex;
                 flex-direction: column; justify-content: center; align-items: center;
                 text-align: center; }
.cs-n { font-family: Oswald, sans-serif; font-size: 64px; font-weight: 300;
        color: #2AB9B0; line-height: 1; margin-bottom: 18px; }
.cs-t { font-family: Oswald, sans-serif; font-size: 24px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 2.5px; color: #1A1A2E; max-width: 440px; }
.cs-bar { width: 40px; height: 3px; margin-top: 24px;
          background: linear-gradient(90deg, #2AB9B0, #8ED16A); }

/* ---- CHAPTER BODY (content — flows naturally, NO fixed height) ---- */
.chapter-body { page-break-before: always; padding: 64px 90px 60px; }
.cb-head { display: flex; justify-content: space-between; align-items: center;
           padding-bottom: 12px; margin-bottom: 32px; border-bottom: 1.5px solid #2AB9B0; }
.cb-label { font-family: Oswald, sans-serif; font-size: 9px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 3.5px; color: #2AB9B0; }
.cb-date { font-size: 8px; color: #aaa; }
.cb-content { font-size: 12px; line-height: 1.95; color: #444; }
.cb-inner { max-width: 480px; }

/* ---- HEADINGS (inside content) ---- */
.sh1 { font-family: Oswald, sans-serif; font-size: 18px; font-weight: 600;
       color: #1A1A2E; margin: 28px 0 12px; text-transform: uppercase; letter-spacing: 0.4px; }
.sh2 { font-family: Oswald, sans-serif; font-size: 15px; font-weight: 600;
       color: #1A1A2E; margin: 26px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
.sh3 { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 500;
       color: #2AB9B0; margin: 20px 0 6px; text-transform: uppercase; letter-spacing: 0.8px; }
strong { color: #1A1A2E; font-weight: 600; }
em { color: #777; }

/* ---- BULLETS ---- */
.bul { display: flex; gap: 8px; margin: 4px 0; line-height: 1.8; }
.bul-d { width: 4px; height: 4px; border-radius: 50%; background: #2AB9B0;
         flex-shrink: 0; margin-top: 8px; }
.bul-n { font-family: Oswald, sans-serif; font-weight: 600; color: #2AB9B0;
         font-size: 11px; min-width: 16px; }
.bul-t { flex: 1; }

/* ---- CALLOUT BOXES ---- */
.box { padding: 16px 20px; margin: 22px 0 16px; page-break-inside: avoid; }
.box-h { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
         text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.box-body { font-size: 12px; line-height: 1.85; }
.tk { background: #F5F5F5; border-left: 3px solid #2AB9B0; border-radius: 0 4px 4px 0; }
.tk-h { color: #2AB9B0; }
.ra { background: #1A1A2E; border-radius: 4px; color: rgba(255,255,255,0.85); }
.ra-h { color: #2AB9B0; }
.ra strong { color: #fff; }
.ra .bul-d { background: #2AB9B0; }

/* ---- BACK COVER ---- */
.back-cover { page-break-before: always; height: 100vh; background: #1A1A2E;
              display: flex; flex-direction: column; justify-content: center;
              align-items: center; text-align: center; }
.bc-logo { width: 180px; height: auto; margin-bottom: 44px; }
.bc-bar { width: 100px; height: 3px; margin-bottom: 28px;
          background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.bc-tag { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 4px; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
.bc-mot { font-size: 12px; color: rgba(255,255,255,0.25); font-style: italic; }
.bc-url { font-family: Oswald, sans-serif; font-size: 9px; color: #2AB9B0;
          text-transform: uppercase; letter-spacing: 3px; margin-top: 40px; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <img src="${logoWhite}" class="cover-logo"/>
  <div class="cover-bar"></div>
  <p class="cover-lbl">Brand Strategy</p>
  <p class="cover-ttl">Strategy Deck</p>
  <p class="cover-sub">Prepared by Advertising Unplugged<br/>${dateStr}</p>
  <div class="cover-ft">
    <span>Confidential &mdash; ${yearStr}</span>
    <span>advertisingunplugged.com</span>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc-page">
  <p class="toc-label">Table of Contents</p>
  ${tocHtml}
</div>

<!-- ALL ${totalSections} CHAPTERS -->
${chaptersHtml}

<!-- BACK COVER -->
<div class="back-cover">
  <img src="${logoWhite}" class="bc-logo"/>
  <div class="bc-bar"></div>
  <p class="bc-tag">Advertising Unplugged</p>
  <p class="bc-mot">Clarity Over Noise. Purpose Beyond Profit.</p>
  <p class="bc-url">advertisingunplugged.com</p>
</div>

</body>
</html>`);

    w.document.close();
    // Wait for Google Fonts + logo images to fully load
    setTimeout(() => { w.print(); setExporting(false); }, 3000);
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
                {/* Edit / View toggle */}
                <div className="mb-6 flex items-center justify-end gap-2">
                  {editingIdx === activeSectionIdx ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--teal,#2AB9B0)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--teal,#2AB9B0)]/90 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/60 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03]"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(activeSectionIdx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/60 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Chapter
                    </button>
                  )}
                </div>

                {editingIdx === activeSectionIdx ? (
                  /* ======== EDIT MODE ======== */
                  <div>
                    <p className="mb-2 text-xs text-[var(--navy,#1A1A2E)]/40">
                      Edit the markdown content below. Use ## for headings, **bold**, - for bullets.
                    </p>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-[var(--navy,#1A1A2E)]/10 bg-[#F8F8FA] px-5 py-4 font-mono text-[13px] leading-relaxed text-[var(--navy,#1A1A2E)]/80 focus:border-[var(--teal,#2AB9B0)] focus:outline-none focus:ring-2 focus:ring-[var(--teal,#2AB9B0)]/20"
                      rows={Math.max(20, editContent.split('\n').length + 5)}
                      spellCheck={false}
                    />
                  </div>
                ) : activeSection.status === "error" ? (
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
