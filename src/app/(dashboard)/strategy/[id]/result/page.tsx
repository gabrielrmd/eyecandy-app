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

// Error patterns that indicate a section failed to generate
const ERROR_PATTERNS = [
  "generation failed", "could not be generated", "please retry",
  "please try regenerating", "failed to generate", "error occurred",
  "section generation failed", "an error occurred",
];

function isErrorContent(content: string): boolean {
  const lower = content.toLowerCase();
  return ERROR_PATTERNS.some(p => lower.includes(p));
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
            .map((s: { section_type: string; section_title: string; content: { markdown?: string } | string; quality_score: number | null }) => {
              const text = typeof s.content === "object" && s.content !== null && "markdown" in s.content
                ? (s.content as { markdown: string }).markdown
                : String(s.content ?? "");
              return {
                id: s.section_type,
                title: s.section_title,
                content: text,
                status: (isErrorContent(text) || text.length <= 50 ? "error" : "complete") as "complete" | "error",
                qualityScore: (s.quality_score || 0) * 10,
              };
            });
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

    // Update local state — mark status as "complete" since user manually fixed the content
    const updated = [...sections];
    updated[editingIdx] = {
      ...updated[editingIdx],
      content: editContent,
      status: "complete",
    };
    setSections(updated);

    // Update localStorage cache
    localStorage.setItem(`strategy_result_${strategyId}`, JSON.stringify(updated));

    // Update in Supabase (strategy_sections has no status column — only content + updated_at)
    try {
      const supabase = createClient();
      const { data: strategy } = await supabase
        .from("strategies")
        .select("id")
        .eq("strategy_project_id", strategyId)
        .maybeSingle();

      if (strategy) {
        const { error: updateError } = await supabase
          .from("strategy_sections")
          .update({
            content: { markdown: editContent },
            updated_at: new Date().toISOString(),
          })
          .eq("strategy_id", strategy.id)
          .eq("section_number", editingIdx + 1);

        if (updateError) {
          console.error("Failed to update section in DB:", updateError);
        }
      }
    } catch (err) {
      console.error("Failed to save edit to DB:", err);
    }

    setSaving(false);
    setEditingIdx(null);
    setEditContent("");
  };

  // Count sections with valid (non-error) content — derived purely from content
  const validSections = sections.filter(
    s => !isErrorContent(s.content) && s.content.length > 50
  );
  const failedSections = sections.filter(
    s => isErrorContent(s.content) || s.content.length <= 50
  );
  const canExport = validSections.length === sections.length && sections.length > 0;

  const handleExportPDF = () => {
    // Pre-export validation gate
    if (!canExport) {
      const failedNames = failedSections.map(s => s.title).join(", ");
      alert(
        `Cannot export: ${failedSections.length} section(s) failed or contain invalid content.\n\n` +
        `Failed: ${failedNames}\n\n` +
        `Please regenerate the strategy or edit the failed sections before exporting.`
      );
      return;
    }

    setExporting(true);

    const origin = window.location.origin;
    const logoWhite = `${origin}/brand/au-logo-white.png`;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const yearStr = new Date().getFullYear();
    const totalSections = sections.length;

    // Markdown → HTML with print-safe structure
    // - Wraps bullet runs in <div class="bul-group"> for pagination control
    // - Wraps label-paragraphs (ending with ":") + their bullet list in
    //   <div class="label-group"> so labels never orphan from their list
    // - Headings get break-after:avoid via CSS to stay with next content
    function mdToHtml(md: string): string {
      const lines = md.split('\n');
      const htmlLines: string[] = [];
      let inBulletGroup = false;
      let inLabelGroup = false;

      // Look ahead: is the next non-empty line a bullet?
      function nextNonEmptyIsBullet(fromIdx: number): boolean {
        for (let j = fromIdx + 1; j < lines.length; j++) {
          const t = lines[j].trim();
          if (t === '') continue;
          return /^[-]/.test(t) || /^\d+\.\s/.test(t);
        }
        return false;
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Table detection: accumulate table lines
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (inBulletGroup) { htmlLines.push('</div>'); inBulletGroup = false; }
          if (inLabelGroup) { htmlLines.push('</div>'); inLabelGroup = false; }
          const tableRows: string[] = [trimmed];
          while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
            i++;
            tableRows.push(lines[i].trim());
          }
          if (tableRows.length >= 2) {
            let tableHtml = '<table class="pdf-table"><thead><tr>';
            const headerCells = tableRows[0].split('|').filter((c: string) => c.trim());
            headerCells.forEach((cell: string) => { tableHtml += '<th>' + cell.trim() + '</th>'; });
            tableHtml += '</tr></thead><tbody>';
            for (let r = 1; r < tableRows.length; r++) {
              if (/^\|[\s\-:|]+\|$/.test(tableRows[r])) continue;
              const cells = tableRows[r].split('|').filter((c: string) => c.trim());
              tableHtml += '<tr>';
              cells.forEach((cell: string) => { tableHtml += '<td>' + cell.trim() + '</td>'; });
              tableHtml += '</tr>';
            }
            tableHtml += '</tbody></table>';
            htmlLines.push(tableHtml);
          }
          continue;
        }

        // Bullet line (- item or 1. item)
        const bulletMatch = trimmed.match(/^- (.+)$/);
        const numMatch = trimmed.match(/^(\d+)\. (.+)$/);
        if (bulletMatch || numMatch) {
          if (!inBulletGroup) { htmlLines.push('<div class="bul-group">'); inBulletGroup = true; }
          if (bulletMatch) {
            htmlLines.push('<div class="bul"><span class="bul-d"></span><span class="bul-t">' + applyInline(bulletMatch[1]) + '</span></div>');
          } else if (numMatch) {
            htmlLines.push('<div class="bul"><span class="bul-n">' + numMatch[1] + '.</span><span class="bul-t">' + applyInline(numMatch[2]) + '</span></div>');
          }
          continue;
        }

        // Non-bullet line: close bullet group if open
        if (inBulletGroup) {
          htmlLines.push('</div>'); inBulletGroup = false;
          // Also close label-group if this bullet group was the list for a label
          if (inLabelGroup) { htmlLines.push('</div>'); inLabelGroup = false; }
        }

        // Empty line
        if (trimmed === '') {
          continue;
        }

        // Headings
        const h3Match = trimmed.match(/^### (.+)$/);
        if (h3Match) {
          if (inLabelGroup) { htmlLines.push('</div>'); inLabelGroup = false; }
          htmlLines.push('<h3 class="sh3">' + applyInline(h3Match[1]) + '</h3>');
          continue;
        }

        const h2Match = trimmed.match(/^## (.+)$/);
        if (h2Match) {
          if (inLabelGroup) { htmlLines.push('</div>'); inLabelGroup = false; }
          const l = h2Match[1].toLowerCase();
          if (l.includes('key takeaway')) {
            htmlLines.push('<div class="box-wrap"><div class="box tk"><div class="box-icon">&#9670;</div><p class="box-h tk-h">Key Takeaways</p><div class="box-body">');
          } else if (l.includes('recommended action')) {
            htmlLines.push('<div class="box-wrap"><div class="box ra"><div class="box-icon ra-icon">&#9654;</div><p class="box-h ra-h">Recommended Actions</p><div class="box-body">');
          } else {
            htmlLines.push('<h2 class="sh2">' + applyInline(h2Match[1]) + '</h2>');
          }
          continue;
        }

        const h1Match = trimmed.match(/^# (.+)$/);
        if (h1Match) {
          if (inLabelGroup) { htmlLines.push('</div>'); inLabelGroup = false; }
          htmlLines.push('<h1 class="sh1">' + applyInline(h1Match[1]) + '</h1>');
          continue;
        }

        // Label detection: a paragraph ending with ":" followed by a bullet list.
        // Wrap label + its list in a label-group to prevent orphaning.
        const isLabel = /[:\u2014]$/.test(trimmed.replace(/\*+/g, '').trim()) && nextNonEmptyIsBullet(i);
        if (isLabel && !inLabelGroup) {
          htmlLines.push('<div class="label-group">');
          inLabelGroup = true;
        }

        // Regular paragraph
        htmlLines.push('<p class="para">' + applyInline(trimmed) + '</p>');
      }

      // Close trailing groups
      if (inBulletGroup) { htmlLines.push('</div>'); }
      if (inLabelGroup) { htmlLines.push('</div>'); }

      let html = htmlLines.join('\n');

      // Close any opened callout boxes (box-body → box → box-wrap)
      const openBoxes = (html.match(/<div class="box-wrap">/g) || []).length;
      const closeBoxes = (html.match(/<\/div><\/div><\/div><!-- \/box -->/g) || []).length;
      for (let j = 0; j < openBoxes - closeBoxes; j++) {
        html += '</div></div></div><!-- /box -->';
      }

      return html;
    }

    // Inline formatting: bold, italic
    function applyInline(text: string): string {
      let s = text;
      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return s;
    }

    // TOC
    const tocHtml = sections.map((s, i) =>
      `<div class="toc-row">
        <span class="toc-n">${String(i+1).padStart(2,'0')}</span>
        <span class="toc-t">${s.title}</span>
        <span class="toc-ln"></span>
        <span class="toc-pg">${String(i * 2 + 3).padStart(2,'0')}</span>
      </div>`
    ).join('');

    // Chapters — consistent layout, no alignment drift
    const chaptersHtml = sections.map((section, idx) => {
      const n = String(idx + 1).padStart(2, '0');
      const bodyHtml = mdToHtml(section.content);
      const accentColors = ['#2AB9B0', '#e8384f', '#F28C28', '#8ED16A', '#F8CE30'];
      const accent = accentColors[idx % accentColors.length];
      return `
<div class="chapter-divider">
  <div class="cd-accent" style="background:${accent}"></div>
  <div class="cd-content">
    <span class="cd-label">Chapter</span>
    <p class="cd-num">${n}</p>
    <h1 class="cd-title">${section.title}</h1>
    <div class="cd-bar" style="background: linear-gradient(90deg, ${accent}, ${accent}44)"></div>
  </div>
  <div class="cd-footer">
    <span>Advertising Unplugged</span>
    <span>Brand Strategy Deck</span>
  </div>
</div>
<div class="chapter-body">
  <div class="cb-sidebar">
    <span class="cb-chnum">${n}</span>
    <span class="cb-chtitle">${section.title}</span>
  </div>
  <div class="cb-main">
    <div class="cb-head">
      <span class="cb-label">Chapter ${n} &mdash; ${section.title}</span>
      <span class="cb-date">${dateStr}</span>
    </div>
    <div class="cb-content">${bodyHtml}</div>
  </div>
  <div class="cb-footer">
    <span class="cb-foot-brand">Advertising Unplugged &bull; Brand Strategy Deck</span>
    <span class="cb-foot-page">${n} / ${String(totalSections).padStart(2,'0')}</span>
  </div>
</div>`;
    }).join('');

    // Get the project title from the first section's content or fallback
    const projectTitle = sections[0]?.title ? 'Brand Strategy Deck' : 'Strategy Deck';

    const w = window.open('', '_blank');
    if (!w) { setExporting(false); alert("Allow popups to export PDF"); return; }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${projectTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
/* ============================================================
   PREMIUM BRAND STRATEGY DECK — Advertising Unplugged
   Editorial agency-grade PDF styling
   Fonts: Oswald (display), Inter (body)
   ============================================================ */

@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; }
body {
  font-family: Inter, -apple-system, sans-serif;
  font-size: 13px;
  color: #2d2d2d;
  line-height: 1.7;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
img { image-rendering: -webkit-optimize-contrast; }

/* ============================================================
   COVER — Premium, confident, filled
   ============================================================ */
.cover {
  width: 100%; height: 100vh;
  background: #1A1A2E;
  color: #fff;
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 0;
  page-break-after: always;
  position: relative;
  overflow: hidden;
}
/* Decorative corner glow */
.cover::before {
  content: '';
  position: absolute;
  top: -180px; right: -120px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.15) 0%, transparent 70%);
}
.cover::after {
  content: '';
  position: absolute;
  bottom: -100px; left: -80px;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,56,79,0.08) 0%, transparent 70%);
}
.cover-top {
  position: relative; z-index: 1;
  padding: 56px 72px;
}
.cover-logo { width: 180px; height: auto; }
.cover-center {
  position: relative; z-index: 1;
  flex: 1;
  display: flex; flex-direction: column;
  justify-content: center;
  padding: 0 72px;
}
.cover-bar {
  width: 80px; height: 3px; margin-bottom: 32px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30);
}
.cover-lbl {
  font-family: Oswald, sans-serif;
  font-size: 12px; font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 8px;
  color: #2AB9B0;
  margin-bottom: 20px;
}
.cover-ttl {
  font-family: Oswald, sans-serif;
  font-size: 62px; font-weight: 700;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 12px;
  max-width: 520px;
}
.cover-ttl-accent {
  display: block;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cover-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  line-height: 1.8;
  margin-top: 16px;
  max-width: 400px;
}
.cover-bottom {
  position: relative; z-index: 1;
  padding: 0 72px 44px;
}
.cover-gradient-bar {
  width: 100%; height: 4px; margin-bottom: 28px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30);
}
.cover-ft {
  display: flex; justify-content: space-between; align-items: center;
  font-family: Oswald, sans-serif;
  font-size: 9px; letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
}
.cover-ft-date { color: rgba(255,255,255,0.35); }

/* ============================================================
   TABLE OF CONTENTS
   ============================================================ */
.toc-page {
  padding: 72px;
  page-break-after: always;
  position: relative;
}
.toc-page::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 6px; height: 100%;
  background: linear-gradient(180deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30);
}
.toc-header {
  margin-bottom: 48px;
  padding-left: 20px;
}
.toc-supra {
  font-family: Oswald, sans-serif;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: #2AB9B0;
  margin-bottom: 8px;
}
.toc-title {
  font-family: Oswald, sans-serif;
  font-size: 36px; font-weight: 700;
  color: #1A1A2E;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.toc-list { padding-left: 20px; }
.toc-row {
  display: flex; align-items: baseline; gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #eee;
}
.toc-n {
  font-family: Oswald, sans-serif;
  font-size: 20px; font-weight: 700;
  color: #2AB9B0;
  min-width: 36px;
}
.toc-t {
  font-family: Oswald, sans-serif;
  font-size: 14px; font-weight: 500;
  color: #1A1A2E;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.toc-ln {
  flex: 1;
  border-bottom: 1px dotted #ccc;
  margin-bottom: 4px;
}
.toc-pg {
  font-family: Oswald, sans-serif;
  font-size: 12px; font-weight: 400;
  color: #999;
  min-width: 24px;
  text-align: right;
}

/* ============================================================
   CHAPTER DIVIDER PAGES — Bold, editorial
   ============================================================ */
.chapter-divider {
  page-break-before: always;
  height: 100vh;
  display: flex; flex-direction: column;
  position: relative;
  overflow: hidden;
  background: #fff;
}
.cd-accent {
  position: absolute; top: 0; left: 0;
  width: 8px; height: 100%;
}
.cd-content {
  flex: 1;
  display: flex; flex-direction: column;
  justify-content: center;
  padding: 0 72px 0 80px;
}
.cd-label {
  font-family: Oswald, sans-serif;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: #999;
  margin-bottom: 8px;
}
.cd-num {
  font-family: Oswald, sans-serif;
  font-size: 120px; font-weight: 200;
  color: #2AB9B0;
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -2px;
}
.cd-title {
  font-family: Oswald, sans-serif;
  font-size: 32px; font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #1A1A2E;
  max-width: 480px;
  line-height: 1.15;
}
.cd-bar {
  width: 60px; height: 4px;
  margin-top: 28px;
  border-radius: 2px;
}
.cd-footer {
  display: flex; justify-content: space-between;
  padding: 0 72px 36px 80px;
  font-family: Oswald, sans-serif;
  font-size: 8px; font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #ccc;
}

/* ============================================================
   CHAPTER BODY — Content pages, consistent grid
   ============================================================ */
.chapter-body {
  page-break-before: always;
  padding: 52px 64px 48px 64px;
  position: relative;
  min-height: 100vh;
}
/* Left accent stripe */
.cb-sidebar {
  position: absolute;
  top: 0; left: 0;
  width: 52px; height: 100%;
  background: #1A1A2E;
  display: flex; flex-direction: column;
  align-items: center;
  padding-top: 56px;
}
.cb-chnum {
  font-family: Oswald, sans-serif;
  font-size: 14px; font-weight: 700;
  color: #2AB9B0;
  writing-mode: horizontal-tb;
  margin-bottom: 12px;
}
.cb-chtitle {
  font-family: Oswald, sans-serif;
  font-size: 7px; font-weight: 500;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  white-space: nowrap;
}
.cb-main {
  margin-left: 52px;
  padding: 0 0 0 28px;
}
.cb-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px;
  margin-bottom: 28px;
  border-bottom: 2px solid #2AB9B0;
}
.cb-label {
  font-family: Oswald, sans-serif;
  font-size: 10px; font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #2AB9B0;
}
.cb-date {
  font-family: Inter, sans-serif;
  font-size: 9px; color: #bbb;
  letter-spacing: 0.5px;
}
.cb-content {
  font-size: 13px;
  line-height: 1.7;
  color: #3a3a3a;
  max-width: 100%;
  orphans: 3;
  widows: 3;
}
/* ── General print-layout rule ──
   Every direct child of .cb-content gets padding-top instead of
   margin-top. Padding survives print page-break boundaries while
   margin collapses to zero at the top of a new page.
   This single rule guarantees that ANY block pushed to a new page
   by pagination automatically starts with breathing room. */
.cb-content > * {
  padding-top: 14px;
}
/* First child on the page already has the header above it */
.cb-content > *:first-child {
  padding-top: 0;
}
.cb-footer {
  position: absolute;
  bottom: 24px; left: 80px; right: 64px;
  display: flex; justify-content: space-between;
  font-family: Inter, sans-serif;
  font-size: 7px;
  color: #ccc;
  letter-spacing: 0.5px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}
.cb-foot-brand { text-transform: uppercase; letter-spacing: 1.5px; }
.cb-foot-page {
  font-family: Oswald, sans-serif;
  font-weight: 600;
  color: #2AB9B0;
  font-size: 9px;
}

/* ============================================================
   TYPOGRAPHY — Stronger hierarchy, premium scale
   Print pagination: headings always stay with next content
   ============================================================ */
/* Headings: larger padding-top overrides the general 14px rule
   for stronger visual hierarchy separation. */
.sh1 {
  font-family: Oswald, sans-serif;
  font-size: 22px; font-weight: 700;
  color: #1A1A2E;
  margin: 0 0 8px;
  padding-top: 26px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 16px;
  border-left: 4px solid #2AB9B0;
  line-height: 1.25;
  break-after: avoid;
  page-break-after: avoid;
}
.sh2 {
  font-family: Oswald, sans-serif;
  font-size: 16px; font-weight: 600;
  color: #1A1A2E;
  margin: 0 0 6px;
  padding-top: 22px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e0e0;
  letter-spacing: 0.3px;
  break-after: avoid;
  page-break-after: avoid;
}
.sh3 {
  font-family: Oswald, sans-serif;
  font-size: 12px; font-weight: 600;
  color: #2AB9B0;
  margin: 0 0 4px;
  /* inherits 14px from .cb-content > * */
  text-transform: uppercase;
  letter-spacing: 2px;
  break-after: avoid;
  page-break-after: avoid;
}
strong { color: #1A1A2E; font-weight: 600; }
em { color: #777; font-style: italic; }

/* Paragraphs */
.para {
  margin: 0 0 6px;
  line-height: 1.75;
  orphans: 3;
  widows: 3;
}

/* ============================================================
   BULLETS — Compact, clean, grouped for print
   ============================================================ */
/* Label-group: wraps a label paragraph + its bullet list so they
   never split across pages. Inherits 14px padding-top from
   .cb-content > * general rule; override to 18px for section weight. */
.label-group {
  break-inside: avoid;
  page-break-inside: avoid;
  padding-top: 18px;
  margin-bottom: 4px;
}
/* Bullet-group: keeps bullet runs together across page breaks.
   Inherits 14px padding-top from .cb-content > * general rule. */
.bul-group {
  break-inside: avoid;
  page-break-inside: avoid;
  /* inherits 14px from general rule — enough for standalone lists */
  margin: 0 0 8px;
}
.bul {
  display: flex; gap: 10px;
  margin: 2px 0;
  line-height: 1.65;
  font-size: 13px;
}
.bul-d {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #2AB9B0;
  flex-shrink: 0;
  margin-top: 8px;
}
.bul-n {
  font-family: Oswald, sans-serif;
  font-weight: 700; color: #2AB9B0;
  font-size: 13px; min-width: 22px;
}
.bul-t { flex: 1; }

/* ============================================================
   CALLOUT BOXES — Premium, high visual weight, never split.
   The .box-wrap container provides top spacing via padding
   (not margin), which survives print page-break push.
   Margin collapses to zero at the top of a new print page;
   padding does not — this gives breathing room when a box
   gets pushed onto a fresh page by break-inside:avoid.
   ============================================================ */
.box-wrap {
  padding-top: 24px;
  margin-bottom: 14px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.box {
  padding: 24px 28px;
  border-radius: 6px;
  position: relative;
}
.box-icon {
  position: absolute;
  top: 22px; right: 24px;
  font-size: 16px;
  opacity: 0.3;
}
.box-h {
  font-family: Oswald, sans-serif;
  font-size: 12px; font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 14px;
  padding-bottom: 10px;
}
.box-body {
  font-size: 13px;
  line-height: 1.8;
}
/* Key Takeaways */
.tk {
  background: linear-gradient(135deg, #f0faf9 0%, #f5f7f6 100%);
  border-left: 5px solid #2AB9B0;
  border-top: 1px solid rgba(42,185,176,0.15);
  border-right: 1px solid rgba(42,185,176,0.08);
  border-bottom: 1px solid rgba(42,185,176,0.08);
}
.tk-h {
  color: #2AB9B0;
  border-bottom: 1px solid rgba(42,185,176,0.2);
}
/* Recommended Actions */
.ra {
  background: linear-gradient(135deg, #1A1A2E 0%, #252540 100%);
  border-radius: 8px;
  color: rgba(255,255,255,0.9);
  border: 1px solid rgba(42,185,176,0.15);
}
.ra-icon { color: #2AB9B0; }
.ra-h { color: #2AB9B0; border-bottom: 1px solid rgba(42,185,176,0.2); }
.ra strong { color: #fff; }
.ra .bul-d { background: #2AB9B0; }
.ra .bul-t { color: rgba(255,255,255,0.85); }

/* ============================================================
   TABLES — Polished, premium
   ============================================================ */
.pdf-table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0;
  font-size: 11px;
  page-break-inside: avoid;
  break-inside: avoid;
  border-radius: 4px;
  overflow: hidden;
}
.pdf-table th {
  background: #1A1A2E;
  color: #fff;
  font-family: Oswald, sans-serif;
  font-size: 9px; font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 12px 16px;
  text-align: left;
}
.pdf-table td {
  padding: 11px 16px;
  border-bottom: 1px solid #eee;
  color: #444;
  line-height: 1.65;
}
.pdf-table tr:nth-child(even) td { background: #fafbfc; }
.pdf-table tr:last-child td { border-bottom: 2px solid #2AB9B0; }

/* ============================================================
   BACK COVER — Confident, branded
   ============================================================ */
.back-cover {
  page-break-before: always;
  height: 100vh;
  background: #1A1A2E;
  display: flex; flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.back-cover::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.06) 0%, transparent 70%);
}
.bc-logo { width: 160px; height: auto; margin-bottom: 40px; position: relative; z-index: 1; }
.bc-bar {
  width: 120px; height: 3px; margin-bottom: 32px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30);
  position: relative; z-index: 1;
}
.bc-tag {
  font-family: Oswald, sans-serif;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
  position: relative; z-index: 1;
}
.bc-mot {
  font-size: 15px;
  color: rgba(255,255,255,0.3);
  font-style: italic;
  position: relative; z-index: 1;
}
.bc-url {
  font-family: Oswald, sans-serif;
  font-size: 10px;
  color: #2AB9B0;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-top: 48px;
  position: relative; z-index: 1;
}
.bc-year {
  font-family: Inter, sans-serif;
  font-size: 9px;
  color: rgba(255,255,255,0.15);
  margin-top: 20px;
  position: relative; z-index: 1;
}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-top">
    <img src="${logoWhite}" class="cover-logo"/>
  </div>
  <div class="cover-center">
    <div class="cover-bar"></div>
    <p class="cover-lbl">Brand Strategy</p>
    <h1 class="cover-ttl">Strategy<br/><span class="cover-ttl-accent">Deck</span></h1>
    <p class="cover-sub">A comprehensive brand strategy prepared exclusively for your business by Advertising Unplugged.</p>
  </div>
  <div class="cover-bottom">
    <div class="cover-gradient-bar"></div>
    <div class="cover-ft">
      <span>Confidential &mdash; ${yearStr}</span>
      <span class="cover-ft-date">${dateStr}</span>
      <span>advertisingunplugged.com</span>
    </div>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc-page">
  <div class="toc-header">
    <p class="toc-supra">Overview</p>
    <h2 class="toc-title">Contents</h2>
  </div>
  <div class="toc-list">
    ${tocHtml}
  </div>
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
  <p class="bc-year">&copy; ${yearStr} All rights reserved.</p>
</div>

</body>
</html>`);

    w.document.close();

    // Wait for all resources (fonts + images) before printing
    const waitForResources = () => {
      const images = Array.from(w.document.querySelectorAll('img'));
      const imagePromises = images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // continue even if image fails
        });
      });

      const fontsReady = w.document.fonts ? w.document.fonts.ready : Promise.resolve();

      Promise.all([fontsReady, ...imagePromises])
        .then(() => {
          // Extra safety delay for rendering
          setTimeout(() => {
            w.print();
            setExporting(false);
          }, 500);
        })
        .catch(() => {
          // Fallback: print anyway after 5s
          setTimeout(() => {
            w.print();
            setExporting(false);
          }, 5000);
        });
    };

    // Wait for window to finish loading the document
    if (w.document.readyState === 'complete') {
      waitForResources();
    } else {
      w.addEventListener('load', waitForResources);
      // Safety timeout in case load never fires
      setTimeout(() => {
        w.print();
        setExporting(false);
      }, 10000);
    }
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
                disabled={exporting || !canExport}
                title={!canExport ? `${failedSections.length} section(s) need fixing before export` : ""}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${canExport ? "border-[var(--navy,#1A1A2E)]/10 text-[var(--navy,#1A1A2E)]/70 hover:bg-[var(--navy,#1A1A2E)]/[0.03]" : "border-red-200 text-red-400"}`}
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{exporting ? "Preparing..." : !canExport ? `${failedSections.length} failed` : "Export PDF"}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/70 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03]"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--navy,#1A1A2E)]/10 px-3 py-1.5 text-xs font-medium text-[var(--navy,#1A1A2E)]/70 transition-colors hover:bg-[var(--navy,#1A1A2E)]/[0.03]"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
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

        {/* ---- Error banner if sections failed ---- */}
        {failedSections.length > 0 && (
          <div className="mx-auto max-w-[860px] px-6 pt-6 lg:px-10">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {failedSections.length} section{failedSections.length > 1 ? 's' : ''} failed to generate
                </p>
                <p className="mt-1 text-xs text-red-600">
                  {failedSections.map(s => s.title).join(', ')}. Edit these sections manually or regenerate the strategy before exporting.
                </p>
              </div>
            </div>
          </div>
        )}

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
