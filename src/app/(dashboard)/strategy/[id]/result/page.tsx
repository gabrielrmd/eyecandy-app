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

    const origin = window.location.origin;
    const logoColor = `${origin}/brand/au-logo.png`;
    const logoWhite = `${origin}/brand/au-logo-white.png`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr = new Date().getFullYear();

    // Markdown → HTML with brand-compliant styling
    function mdToHtml(md: string): string {
      return md
        .replace(/^### (.*$)/gm, '<h3 class="h3">$1</h3>')
        .replace(/^## (.*$)/gm, (_, t: string) => {
          const l = t.toLowerCase();
          if (l.includes('key takeaway')) return `<div class="box-takeaways"><p class="box-label">Key Takeaways</p>`;
          if (l.includes('recommended action')) return `<div class="box-actions"><p class="box-label-alt">Recommended Actions</p>`;
          return `<h2 class="h2">${t}</h2>`;
        })
        .replace(/^# (.*$)/gm, '<h1 class="h1">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gm, '<div class="li"><span class="dot"></span><span>$1</span></div>')
        .replace(/^(\d+)\. (.*$)/gm, '<div class="li-num"><span class="num">$1.</span><span>$2</span></div>')
        .replace(/\n\n/g, '</p><p class="p">')
        .replace(/\n/g, '<br/>');
    }

    const tocRows = sections.map((s, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<tr><td class="tc-n">${n}</td><td class="tc-t">${s.title}</td></tr>`;
    }).join('');

    const pages = sections.map((section, idx) => {
      const n = String(idx + 1).padStart(2, '0');
      return `
<div class="pg divider"><div class="d-wrap"><p class="d-n">${n}</p><p class="d-t">${section.title}</p><div class="d-bar"></div></div><img src="${logoColor}" class="d-logo"/></div>
<div class="pg content"><div class="c-head"><span class="c-ch">Chapter ${n}</span><span class="c-dt">${dateStr}</span></div><div class="c-body"><p class="p">${mdToHtml(section.content)}</p></div><div class="c-foot"><img src="${logoColor}" class="f-logo"/><span class="f-pg">${n} / ${String(sections.length).padStart(2, '0')}</span></div></div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (!w) { setExporting(false); alert("Allow popups to export"); return; }

    w.document.write(`<!DOCTYPE html><html><head><title>Brand Strategy</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
@page{margin:0;size:A4}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,sans-serif;color:#333;-webkit-print-color-adjust:exact;print-color-adjust:exact}
img{display:block;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges}

/* === PAGE TEMPLATE === */
.pg{height:100vh;page-break-after:always;position:relative;overflow:hidden}

/* === COVER === */
.cover{height:100vh;background:#1A1A2E;page-break-after:always;position:relative;display:flex;flex-direction:column}
.cover-top{flex:1;display:flex;align-items:center;justify-content:center}
.cover-logo{height:72px;width:auto;filter:brightness(0) invert(1);image-rendering:-webkit-optimize-contrast}
.cover-bot{padding:0 100px 80px}
.cover-bar{width:100%;height:4px;background:linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30);margin-bottom:48px}
.cover-lbl{font-family:Oswald,sans-serif;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:6px;color:#2AB9B0;margin-bottom:16px}
.cover-ttl{font-family:Oswald,sans-serif;font-size:54px;font-weight:700;color:white;line-height:1.05;margin-bottom:24px}
.cover-sub{font-family:Inter,sans-serif;font-size:14px;color:rgba(255,255,255,0.45);line-height:1.8}
.cover-ft{position:absolute;bottom:36px;left:100px;right:100px;display:flex;justify-content:space-between;font-family:Oswald,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,0.2)}

/* === TOC === */
.toc{height:100vh;padding:100px;page-break-after:always;background:white}
.toc-h{font-family:Oswald,sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:5px;color:#2AB9B0;margin-bottom:48px}
.toc table{width:100%;border-collapse:collapse}
.tc-n{font-family:Oswald,sans-serif;font-size:13px;font-weight:700;color:#2AB9B0;padding:14px 0;width:40px;vertical-align:baseline;border-bottom:1px solid #F5F5F5}
.tc-t{font-family:Oswald,sans-serif;font-size:14px;font-weight:400;color:#333;padding:14px 0;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid #F5F5F5}

/* === DIVIDER === */
.divider{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:white}
.d-wrap{padding:40px}
.d-n{font-family:Oswald,sans-serif;font-size:72px;font-weight:300;color:#2AB9B0;line-height:1;margin-bottom:20px}
.d-t{font-family:Oswald,sans-serif;font-size:26px;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:#1A1A2E}
.d-bar{width:48px;height:3px;background:linear-gradient(90deg,#2AB9B0,#8ED16A);margin:28px auto 0}
.d-logo{position:absolute;bottom:48px;left:50%;transform:translateX(-50%);height:24px;width:auto;opacity:0.12}

/* === CONTENT === */
.content{padding:72px 100px 80px;background:white}
.c-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;margin-bottom:36px;border-bottom:1.5px solid #2AB9B0}
.c-ch{font-family:Oswald,sans-serif;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:4px;color:#2AB9B0}
.c-dt{font-family:Inter,sans-serif;font-size:9px;color:#999;letter-spacing:0.5px}
.c-body{font-size:12.5px;line-height:2;color:#444;max-width:520px}
.c-foot{position:absolute;bottom:36px;left:100px;right:100px;display:flex;justify-content:space-between;align-items:center}
.f-logo{height:18px;width:auto;opacity:0.1}
.f-pg{font-family:Oswald,sans-serif;font-size:9px;color:#bbb;letter-spacing:1.5px}

/* === TYPOGRAPHY === */
.h1{font-family:Oswald,sans-serif;font-size:20px;font-weight:600;color:#1A1A2E;margin:32px 0 14px;text-transform:uppercase;letter-spacing:0.5px}
.h2{font-family:Oswald,sans-serif;font-size:16px;font-weight:600;color:#1A1A2E;margin:32px 0 12px;padding-bottom:8px;border-bottom:1px solid #eee}
.h3{font-family:Oswald,sans-serif;font-size:13px;font-weight:500;color:#2AB9B0;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px}
.p{margin:6px 0;line-height:2}
strong{color:#1A1A2E;font-weight:600}
em{color:#666}

/* === LISTS === */
.li{display:flex;gap:10px;margin:5px 0 5px 4px;line-height:1.8}
.dot{width:5px;height:5px;border-radius:50%;background:#2AB9B0;flex-shrink:0;margin-top:9px}
.li-num{display:flex;gap:8px;margin:5px 0 5px 4px;line-height:1.8}
.num{font-family:Oswald,sans-serif;font-weight:600;color:#2AB9B0;font-size:12px;min-width:18px}

/* === CALLOUT BOXES === */
.box-takeaways{background:#F5F5F5;border-left:3px solid #2AB9B0;padding:20px 24px;margin:28px 0 20px;border-radius:0 6px 6px 0}
.box-label{font-family:Oswald,sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#2AB9B0;margin-bottom:10px}
.box-actions{background:#1A1A2E;padding:20px 24px;margin:28px 0 20px;border-radius:6px}
.box-label-alt{font-family:Oswald,sans-serif;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#2AB9B0;margin-bottom:10px}
.box-actions,.box-actions strong,.box-actions span{color:rgba(255,255,255,0.85)}
.box-actions .dot{background:#2AB9B0}

/* === BACK COVER === */
.back{height:100vh;background:#1A1A2E;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.b-logo{height:64px;width:auto;margin-bottom:48px}
.b-bar{width:120px;height:3px;background:linear-gradient(90deg,#2AB9B0,#8ED16A,#F28C28,#F8CE30);margin-bottom:32px}
.b-tag{font-family:Oswald,sans-serif;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:5px;color:rgba(255,255,255,0.5);margin-bottom:8px}
.b-mot{font-family:Inter,sans-serif;font-size:13px;color:rgba(255,255,255,0.3);font-style:italic}
.b-url{font-family:Oswald,sans-serif;font-size:10px;color:#2AB9B0;text-transform:uppercase;letter-spacing:3px;margin-top:48px}
</style></head><body>

<div class="cover">
  <div class="cover-top"><img src="${logoWhite}" class="cover-logo"/></div>
  <div class="cover-bot">
    <div class="cover-bar"></div>
    <p class="cover-lbl">Brand Strategy</p>
    <p class="cover-ttl">Strategy Deck</p>
    <p class="cover-sub">Prepared by Advertising Unplugged<br/>${dateStr}</p>
  </div>
  <div class="cover-ft"><span>Confidential &mdash; ${yearStr}</span><span>advertisingunplugged.com</span></div>
</div>

<div class="toc">
  <p class="toc-h">Table of Contents</p>
  <table>${tocRows}</table>
</div>

${pages}

<div class="pg back">
  <img src="${logoWhite}" class="b-logo"/>
  <div class="b-bar"></div>
  <p class="b-tag">Advertising Unplugged</p>
  <p class="b-mot">Clarity Over Noise. Purpose Beyond Profit.</p>
  <p class="b-url">advertisingunplugged.com</p>
</div>

</body></html>`);

    w.document.close();
    setTimeout(() => { w.print(); setExporting(false); }, 2500);
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
