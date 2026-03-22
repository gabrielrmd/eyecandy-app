/**
 * QA PDF Export Script
 *
 * Generates the exact same HTML/CSS that the app's export functions produce,
 * then renders them to real A4 PDFs using Puppeteer. This is the same output
 * a user would get from the browser's "Save as PDF" dialog.
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public/review/pdfs');
const LOGO_PATH = `file://${path.join(process.cwd(), 'public/brand/au-logo-white.png')}`;
const DATE_STR = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const YEAR = new Date().getFullYear();

// ─── Shared CSS (matches the app's PDF export styles exactly) ────────

const SHARED_CSS = `
@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; }
body { font-family: Inter, -apple-system, sans-serif; font-size: 13px; color: #2d2d2d; line-height: 1.7;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
img { image-rendering: -webkit-optimize-contrast; }

.cover { width: 100%; height: 100vh; background: #1A1A2E; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
  page-break-after: always; position: relative; overflow: hidden; }
.cover::before { content: ''; position: absolute; top: -180px; right: -120px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.15) 0%, transparent 70%); }
.cover::after { content: ''; position: absolute; bottom: -100px; left: -80px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,56,79,0.08) 0%, transparent 70%); }
.cover-top { position: relative; z-index: 1; padding: 56px 72px; }
.cover-logo { width: 180px; height: auto; }
.cover-center { position: relative; z-index: 1; flex: 1;
  display: flex; flex-direction: column; justify-content: center; padding: 0 72px; }
.cover-bar { width: 80px; height: 3px; margin-bottom: 32px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-lbl { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 8px; color: #2AB9B0; margin-bottom: 20px; }
.cover-ttl { font-family: Oswald, sans-serif; font-size: 62px; font-weight: 700;
  color: #fff; line-height: 1.05; margin-bottom: 12px; max-width: 520px; }
.cover-ttl-accent { display: block; background: linear-gradient(90deg, #2AB9B0, #8ED16A);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.cover-sub { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.8; margin-top: 16px; max-width: 400px; }
.cover-bottom { position: relative; z-index: 1; padding: 0 72px 44px; }
.cover-gradient-bar { width: 100%; height: 4px; margin-bottom: 28px;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.cover-ft { display: flex; justify-content: space-between; align-items: center;
  font-family: Oswald, sans-serif; font-size: 9px; letter-spacing: 3px;
  text-transform: uppercase; color: rgba(255,255,255,0.25); }

.toc-page { padding: 72px; page-break-after: always; position: relative; }
.toc-page::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%;
  background: linear-gradient(180deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.toc-header { margin-bottom: 48px; padding-left: 20px; }
.toc-supra { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 6px; color: #2AB9B0; margin-bottom: 8px; }
.toc-title { font-family: Oswald, sans-serif; font-size: 36px; font-weight: 700;
  color: #1A1A2E; text-transform: uppercase; letter-spacing: 1px; }
.toc-list { padding-left: 20px; }
.toc-row { display: flex; align-items: baseline; gap: 16px; padding: 14px 0; border-bottom: 1px solid #eee; }
.toc-n { font-family: Oswald, sans-serif; font-size: 20px; font-weight: 700; color: #2AB9B0; min-width: 36px; }
.toc-t { font-family: Oswald, sans-serif; font-size: 14px; font-weight: 500; color: #1A1A2E;
  text-transform: uppercase; letter-spacing: 1px; }
.toc-ln { flex: 1; border-bottom: 1px dotted #ccc; margin-bottom: 4px; }
.toc-pg { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 400; color: #999; min-width: 24px; text-align: right; }

.chapter-divider { page-break-before: always; height: 100vh; display: flex; flex-direction: column;
  position: relative; overflow: hidden; background: #fff; }
.cd-accent { position: absolute; top: 0; left: 0; width: 8px; height: 100%; }
.cd-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 72px 0 80px; }
.cd-label { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: #999; margin-bottom: 8px; }
.cd-num { font-family: Oswald, sans-serif; font-size: 120px; font-weight: 200;
  color: #2AB9B0; line-height: 1; margin-bottom: 4px; letter-spacing: -2px; }
.cd-title { font-family: Oswald, sans-serif; font-size: 32px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 2px; color: #1A1A2E; max-width: 480px; line-height: 1.15; }
.cd-bar { width: 60px; height: 4px; margin-top: 28px; border-radius: 2px; }
.cd-footer { display: flex; justify-content: space-between; padding: 0 72px 36px 80px;
  font-family: Oswald, sans-serif; font-size: 8px; font-weight: 400;
  text-transform: uppercase; letter-spacing: 3px; color: #ccc; }

.chapter-body { page-break-before: always; padding: 52px 64px 48px 64px; position: relative; min-height: 100vh; }
.cb-sidebar { position: absolute; top: 0; left: 0; width: 52px; height: 100%; background: #1A1A2E;
  display: flex; flex-direction: column; align-items: center; padding-top: 56px; }
.cb-chnum { font-family: Oswald, sans-serif; font-size: 14px; font-weight: 700; color: #2AB9B0;
  writing-mode: horizontal-tb; margin-bottom: 12px; }
.cb-chtitle { font-family: Oswald, sans-serif; font-size: 7px; font-weight: 500;
  color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px;
  writing-mode: vertical-rl; text-orientation: mixed; white-space: nowrap; }
.cb-main { margin-left: 52px; padding: 0 0 0 28px; }
.cb-head { display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px; margin-bottom: 28px; border-bottom: 2px solid #2AB9B0; }
.cb-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 3px; color: #2AB9B0; }
.cb-date { font-family: Inter, sans-serif; font-size: 9px; color: #bbb; letter-spacing: 0.5px; }
.cb-content { font-size: 13px; line-height: 1.7; color: #3a3a3a; max-width: 100%; orphans: 3; widows: 3; }
.cb-content > * { padding-top: 14px; }
.cb-content > *:first-child { padding-top: 0; }
.cb-footer { position: absolute; bottom: 24px; left: 80px; right: 64px;
  display: flex; justify-content: space-between; font-family: Inter, sans-serif;
  font-size: 7px; color: #ccc; letter-spacing: 0.5px; border-top: 1px solid #f0f0f0; padding-top: 10px; }
.cb-foot-brand { text-transform: uppercase; letter-spacing: 1.5px; }
.cb-foot-page { font-family: Oswald, sans-serif; font-weight: 600; color: #2AB9B0; font-size: 9px; }

.sh1 { font-family: Oswald, sans-serif; font-size: 22px; font-weight: 700; color: #1A1A2E;
  margin: 0 0 8px; padding-top: 26px; text-transform: uppercase; letter-spacing: 0.5px;
  padding-left: 16px; border-left: 4px solid #2AB9B0; line-height: 1.25;
  break-after: avoid; page-break-after: avoid; }
.sh2 { font-family: Oswald, sans-serif; font-size: 16px; font-weight: 600; color: #1A1A2E;
  margin: 0 0 6px; padding-top: 22px; padding-bottom: 6px; border-bottom: 1px solid #e0e0e0;
  letter-spacing: 0.3px; break-after: avoid; page-break-after: avoid; }
.sh3 { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 600; color: #2AB9B0;
  margin: 0 0 4px; text-transform: uppercase; letter-spacing: 2px;
  break-after: avoid; page-break-after: avoid; }
strong { color: #1A1A2E; font-weight: 600; }
em { color: #777; font-style: italic; }
.para { margin: 0 0 6px; line-height: 1.75; orphans: 3; widows: 3; }

.label-group { break-inside: avoid; page-break-inside: avoid; padding-top: 18px; margin-bottom: 4px; }
.bul-group { break-inside: avoid; page-break-inside: avoid; padding-top: 14px; margin: 0 0 8px; }
.bul { display: flex; gap: 10px; margin: 2px 0; line-height: 1.65; font-size: 13px; }
.bul-d { width: 5px; height: 5px; border-radius: 50%; background: #2AB9B0; flex-shrink: 0; margin-top: 8px; }
.bul-n { font-family: Oswald, sans-serif; font-weight: 700; color: #2AB9B0; font-size: 13px; min-width: 22px; }
.bul-t { flex: 1; }

.box-wrap { padding-top: 24px; margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; }
.box { padding: 24px 28px; border-radius: 6px; position: relative; }
.box-icon { position: absolute; top: 22px; right: 24px; font-size: 16px; opacity: 0.3; }
.box-h { font-family: Oswald, sans-serif; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 3px; margin-bottom: 14px; padding-bottom: 10px; }
.box-body { font-size: 13px; line-height: 1.8; }
.tk { background: linear-gradient(135deg, #f0faf9 0%, #f5f7f6 100%); border-left: 5px solid #2AB9B0;
  border-top: 1px solid rgba(42,185,176,0.15); border-right: 1px solid rgba(42,185,176,0.08);
  border-bottom: 1px solid rgba(42,185,176,0.08); }
.tk-h { color: #2AB9B0; border-bottom: 1px solid rgba(42,185,176,0.2); }
.ra { background: linear-gradient(135deg, #1A1A2E 0%, #252540 100%); border-radius: 8px;
  color: rgba(255,255,255,0.9); border: 1px solid rgba(42,185,176,0.15); }
.ra-icon { color: #2AB9B0; }
.ra-h { color: #2AB9B0; border-bottom: 1px solid rgba(42,185,176,0.2); }
.ra strong { color: #fff; }
.ra .bul-d { background: #2AB9B0; }
.ra .bul-t { color: rgba(255,255,255,0.85); }

.pdf-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 11px;
  page-break-inside: avoid; break-inside: avoid; border-radius: 4px; overflow: hidden; }
.pdf-table th { background: #1A1A2E; color: #fff; font-family: Oswald, sans-serif;
  font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;
  padding: 12px 16px; text-align: left; }
.pdf-table td { padding: 11px 16px; border-bottom: 1px solid #eee; color: #444; line-height: 1.65; }
.pdf-table tr:nth-child(even) td { background: #fafbfc; }
.pdf-table tr:last-child td { border-bottom: 2px solid #2AB9B0; }

.back-cover { page-break-before: always; height: 100vh; background: #1A1A2E;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; position: relative; overflow: hidden; }
.back-cover::before { content: ''; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(42,185,176,0.06) 0%, transparent 70%); }
.bc-logo { width: 160px; height: auto; margin-bottom: 40px; position: relative; z-index: 1; }
.bc-bar { width: 120px; height: 3px; margin-bottom: 32px; position: relative; z-index: 1;
  background: linear-gradient(90deg, #2AB9B0, #8ED16A, #F28C28, #F8CE30); }
.bc-tag { font-family: Oswald, sans-serif; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 6px; color: rgba(255,255,255,0.5);
  margin-bottom: 8px; position: relative; z-index: 1; }
.bc-mot { font-size: 15px; color: rgba(255,255,255,0.3); font-style: italic; position: relative; z-index: 1; }
.bc-url { font-family: Oswald, sans-serif; font-size: 10px; color: #2AB9B0;
  text-transform: uppercase; letter-spacing: 4px; margin-top: 48px; position: relative; z-index: 1; }
.bc-year { font-size: 9px; color: rgba(255,255,255,0.15); margin-top: 20px; position: relative; z-index: 1; }

/* Template-specific styles */
.sheet-block { padding-top: 14px; margin-bottom: 28px; }
.sheet-title { font-family: Oswald, sans-serif; font-size: 22px; font-weight: 700;
  color: #1A1A2E; text-transform: uppercase; letter-spacing: 1px;
  padding-bottom: 8px; border-bottom: 2px solid #e0e0e0; margin-bottom: 18px;
  padding-left: 14px; border-left: 4px solid #2AB9B0; break-after: avoid; page-break-after: avoid; }
.sheet-desc { font-size: 12px; color: #777; margin-bottom: 14px; font-style: italic; break-after: avoid; }
.form-section { padding-top: 12px; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
.form-section-title { font-family: Oswald, sans-serif; font-size: 14px; font-weight: 600;
  color: #2AB9B0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;
  break-after: avoid; page-break-after: avoid; }
.field { padding: 10px 0; border-bottom: 1px solid #f0f0f0; break-inside: avoid; page-break-inside: avoid; }
.field:last-child { border-bottom: none; }
.field-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1.5px; color: #2AB9B0; margin-bottom: 4px; }
.field-value { font-size: 13px; line-height: 1.75; color: #333; white-space: pre-wrap; }
.empty { color: #ccc; font-style: italic; font-size: 12px; }

.content-page { padding: 56px 64px 48px 64px; position: relative; min-height: 100vh; }
.sidebar { position: absolute; top: 0; left: 0; width: 52px; height: 100%;
  background: #1A1A2E; display: flex; flex-direction: column; align-items: center; padding-top: 56px; }
.sidebar-label { font-family: Oswald, sans-serif; font-size: 7px; font-weight: 500;
  color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 2px;
  writing-mode: vertical-rl; text-orientation: mixed; white-space: nowrap; }
.content-main { margin-left: 52px; padding: 0 0 0 28px; }
.content-head { display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px; margin-bottom: 28px; border-bottom: 2px solid #2AB9B0; }
.content-head-label { font-family: Oswald, sans-serif; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 3px; color: #2AB9B0; }
.content-head-date { font-size: 9px; color: #bbb; }
.page-footer { position: absolute; bottom: 24px; left: 80px; right: 64px;
  display: flex; justify-content: space-between; font-size: 7px; color: #ccc;
  border-top: 1px solid #f0f0f0; padding-top: 10px; }
`;

// ─── Markdown to HTML (same as app) ──────────────────────────────

function applyInline(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inBul = false, inLabel = false;
  function nextIsBullet(from) {
    for (let j = from + 1; j < lines.length; j++) { const t = lines[j].trim(); if (!t) continue; return /^[-]/.test(t) || /^\d+\.\s/.test(t); }
    return false;
  }
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.startsWith('|') && t.endsWith('|')) {
      if (inBul) { out.push('</div>'); inBul = false; }
      if (inLabel) { out.push('</div>'); inLabel = false; }
      const rows = [t];
      while (i+1 < lines.length && lines[i+1].trim().startsWith('|')) { i++; rows.push(lines[i].trim()); }
      if (rows.length >= 2) {
        let h = '<table class="pdf-table"><thead><tr>';
        rows[0].split('|').filter(c => c.trim()).forEach(c => h += `<th>${c.trim()}</th>`);
        h += '</tr></thead><tbody>';
        for (let r = 1; r < rows.length; r++) {
          if (/^\|[\s\-:|]+\|$/.test(rows[r])) continue;
          h += '<tr>'; rows[r].split('|').filter(c => c.trim()).forEach(c => h += `<td>${c.trim()}</td>`); h += '</tr>';
        }
        h += '</tbody></table>'; out.push(h);
      }
      continue;
    }
    const bm = t.match(/^- (.+)$/), nm = t.match(/^(\d+)\. (.+)$/);
    if (bm || nm) {
      if (!inBul) { out.push('<div class="bul-group">'); inBul = true; }
      if (bm) out.push(`<div class="bul"><span class="bul-d"></span><span class="bul-t">${applyInline(bm[1])}</span></div>`);
      else out.push(`<div class="bul"><span class="bul-n">${nm[1]}.</span><span class="bul-t">${applyInline(nm[2])}</span></div>`);
      continue;
    }
    if (inBul) { out.push('</div>'); inBul = false; if (inLabel) { out.push('</div>'); inLabel = false; } }
    if (!t) continue;
    const h3 = t.match(/^### (.+)$/);
    if (h3) { if (inLabel) { out.push('</div>'); inLabel = false; } out.push(`<h3 class="sh3">${applyInline(h3[1])}</h3>`); continue; }
    const h2 = t.match(/^## (.+)$/);
    if (h2) {
      if (inLabel) { out.push('</div>'); inLabel = false; }
      const l = h2[1].toLowerCase();
      if (l.includes('key takeaway')) out.push('<div class="box-wrap"><div class="box tk"><div class="box-icon">&#9670;</div><p class="box-h tk-h">Key Takeaways</p><div class="box-body">');
      else if (l.includes('recommended action')) out.push('<div class="box-wrap"><div class="box ra"><div class="box-icon ra-icon">&#9654;</div><p class="box-h ra-h">Recommended Actions</p><div class="box-body">');
      else out.push(`<h2 class="sh2">${applyInline(h2[1])}</h2>`);
      continue;
    }
    const h1 = t.match(/^# (.+)$/);
    if (h1) { if (inLabel) { out.push('</div>'); inLabel = false; } out.push(`<h1 class="sh1">${applyInline(h1[1])}</h1>`); continue; }
    if (/[:\u2014]$/.test(t.replace(/\*+/g, '').trim()) && nextIsBullet(i) && !inLabel) { out.push('<div class="label-group">'); inLabel = true; }
    out.push(`<p class="para">${applyInline(t)}</p>`);
  }
  if (inBul) out.push('</div>');
  if (inLabel) out.push('</div>');
  let html = out.join('\n');
  const open = (html.match(/<div class="box-wrap">/g) || []).length;
  const close = (html.match(/<\/div><\/div><\/div><!-- \/box -->/g) || []).length;
  for (let j = 0; j < open - close; j++) html += '</div></div></div><!-- /box -->';
  return html;
}

// ─── Strategy Deck Data ──────────────────────────────────────────

const SECTIONS = [
  { id: "brand-story", title: "Brand Story & Origin", content: "# Brand Story & Origin\n\nFounded in 2019 by former agency strategists, **NovaBrew Coffee** emerged from a simple insight: specialty coffee culture was booming, but the brands behind it were struggling to differentiate.\n\n## The Problem Worth Solving\n\nThe specialty coffee market grew 25% year-over-year, yet **78% of independent roasters** couldn't articulate their brand positioning beyond \"we source quality beans.\" This created a sea of sameness.\n\n## The Founding Insight\n\nGreat coffee brands aren't built on bean quality alone — they're built on **story, purpose, and emotional connection**.\n\n**Core Values:**\n- Authenticity over perfection\n- Community over competition\n- Sustainability as a business model, not a marketing angle\n\n## Key Takeaways\n\n- NovaBrew addresses a €48B specialty coffee market with a strategy-first approach\n- The brand's origin story connects founder motivation to customer pain\n- Core values drive every business decision" },
  { id: "market-analysis", title: "Market Analysis", content: "# Market Analysis\n\nThe European specialty coffee market is valued at **€12.3B in 2026**, growing at 8.2% CAGR.\n\n## Market Landscape\n\n**Market Size & Growth:**\n- Total addressable market: €12.3B (Europe)\n- Serviceable market: €2.1B (Romania + CEE)\n- Growth rate: 8.2% CAGR through 2030\n\n## Competitive Dynamics\n\n1. **Mass-market chains** (Starbucks, Costa) — 45% share, declining loyalty\n2. **Premium independents** (local roasters) — 30% share, fragmented\n3. **DTC disruptors** (subscription brands) — 25% share, growing at 15% YoY\n\n## Trend Analysis\n\n| Trend | Impact | Timeline | Opportunity |\n|-------|--------|----------|-------------|\n| Sustainability transparency | High | Now | Carbon-neutral packaging |\n| Cold brew growth | Medium | 2026-2028 | RTD cold brew line |\n| Subscription fatigue | High | Now | Community model |\n| AI personalization | Medium | 2027+ | Taste profile matching |\n\n## Key Takeaways\n\n- The €2.1B CEE market is underserved by premium brands\n- DTC disruptors grow 2x the market rate\n- Sustainability and community are the strongest differentiation levers" },
  { id: "target-audience", title: "Target Audience Profile", content: "# Target Audience Profile\n\n## Persona 1: \"Mindful Maria\"\n\n**Demographics:**\n- Age: 28-35, Bucharest urban professional\n- Income: €35K-55K, Master's degree\n- Role: Marketing Manager at a tech startup\n\n**Psychographic Profile:**\nMaria values authenticity and sustainability. She researches brands before buying and pays 30-40% more for values-aligned products. Active on Instagram and LinkedIn.\n\n**Behavioral Patterns:**\n- Drinks 3-4 specialty coffees per day\n- Subscribes to 2 food/drink newsletters\n- Shares brand stories on social media\n- Purchase decisions based on peer recommendations\n\n## Persona 2: \"Curious Cristian\"\n\n**Demographics:**\n- Age: 35-45, Cluj-Napoca\n- Income: €45K-70K, IT Director\n\n**Psychographic Profile:**\nHobby coffee enthusiast who upgraded from Nespresso to manual brewing. Watches YouTube reviews, participates in r/coffee.\n\n**Key Life Moments:**\n- Morning routine (daily ritual)\n- Weekend hosting (impressing guests)\n- Work-from-home transition\n- Gift-giving seasons\n\n## Key Takeaways\n\n- Two distinct personas with different entry points but shared values\n- Both are digitally active and influenced by peer content\n- Life moments create natural purchase triggers" },
  { id: "positioning", title: "Brand Positioning Statement", content: "# Brand Positioning Statement\n\n**For** mindful urban professionals who believe their daily coffee ritual should reflect their values, **NovaBrew** is the specialty coffee brand that delivers **transparently sourced, sustainability-first coffee** because great coffee should taste good AND do good.\n\n## Positioning Rationale\n\n- **Mass-market chains** compete on convenience and price\n- **Independent roasters** compete on bean quality and craft\n- **DTC brands** compete on subscription convenience\n- **NovaBrew** competes on **purpose + community + transparency**\n\n## Competitive White Space\n\nNo competitor owns the intersection of:\n1. Full supply chain transparency (farm-to-cup)\n2. Community-driven brand experience\n3. Sustainability as measurable impact\n\n## Positioning Guard Rails\n\n**We always claim:**\n- Traceable sourcing with named farms\n- Carbon-neutral operations with published metrics\n- Community impact through profit-sharing\n\n**We never claim:**\n- \"The best coffee\" — subjective and generic\n- \"Artisanal\" or \"craft\" — overused\n- Premium for premium's sake\n\n## Key Takeaways\n\n- Positioning occupies unique white space no competitor owns\n- Guard rails prevent drift into generic messaging\n- \"Purpose + community + transparency\" triad is defensible" },
  { id: "competitive-matrix", title: "Competitive Analysis Matrix", content: "# Competitive Analysis Matrix\n\n## Comparison Matrix\n\n| Dimension | NovaBrew | Roaster X | DTC Brand Y | Chain Z |\n|-----------|----------|-----------|-------------|--------|\n| Price Point | €14-18/250g | €12-16/250g | €16-22/250g | €8-10/250g |\n| Sourcing | Full traceability | Partial | Region only | None |\n| Sustainability | Carbon-neutral | Organic cert | Claims only | Greenwashing |\n| Community | Active | Local events | Online forum | None |\n| Digital | Strong | Weak | Very strong | Corporate |\n| Brand Story | Compelling | Generic | Good | None |\n\n## Threat Assessment\n\n**Most Dangerous: DTC Brand Y**\n- Strong digital presence, well-funded (€12M Series B)\n- Weakness: rigid subscription, no community focus\n\n**Most Vulnerable: Roaster X**\n- Quality product but weak digital presence\n- Potential partnership target\n\n## Key Takeaways\n\n- NovaBrew's transparency + community + sustainability is unique\n- DTC Brand Y is primary threat with structural weaknesses\n- Digital investment is critical to compete" },
  { id: "archetype", title: "Brand Archetype & Personality", content: "# Brand Archetype & Personality\n\n## Primary Archetype: The Explorer\n\nDriven by curiosity, authenticity, and meaningful discovery.\n\n**How it manifests:**\n- Product naming references origin stories\n- Marketing focuses on discovery and education\n- Community events framed as \"expeditions\"\n\n## Personality Traits\n\n| Dimension | Score | Expression |\n|-----------|-------|------------|\n| Formal ↔ Casual | 7/10 casual | Warm, approachable |\n| Serious ↔ Playful | 6/10 playful | Knowledgeable, not pretentious |\n| Traditional ↔ Modern | 8/10 modern | Digital-first, progressive |\n| Reserved ↔ Bold | 7/10 bold | Confident, data-backed |\n\n## Rejected Archetype: The Ruler\n\nRejected because it creates distance, implies hierarchy, attracts status-seekers over values-aligned customers.\n\n## Brand as a Person\n\nA 32-year-old who's traveled extensively, runs a food blog, hosts dinner parties where conversation matters as much as food. The friend who knows the best local spots but never makes you feel uncultured.\n\n## Key Takeaways\n\n- Explorer archetype drives curiosity-based marketing\n- Personality balances expertise with warmth\n- Rejected Ruler clarifies what NovaBrew will never become" },
  { id: "values-mission", title: "Brand Values & Mission", content: "# Brand Values & Mission\n\n## Mission Statement\n\nTo make transparently sourced, sustainability-first coffee accessible to mindful consumers.\n\n## Vision Statement\n\nBy 2030, NovaBrew will be the most trusted specialty coffee brand in CEE — measured by community impact, transparency, and advocacy.\n\n## Values Hierarchy\n\n**Primary Values:**\n1. **Transparency** — Every bean traceable, every impact measurable\n2. **Community** — Growth through shared experiences\n3. **Sustainability** — Environmental responsibility as business model\n\n**Supporting Values:**\n- Curiosity — Always learning, always improving\n- Accessibility — Premium quality without premium pretension\n- Integrity — Do what we say, measure what we claim\n\n## Values-to-Action Framework\n\n| Value | Daily Decision | Example |\n|-------|---------------|--------|\n| Transparency | Publish sourcing data | QR code on every bag |\n| Community | Prioritize engagement | Monthly virtual tastings |\n| Sustainability | Choose impact over margin | Carbon-neutral shipping |\n\n## Key Takeaways\n\n- Mission and vision are measurable, not aspirational fluff\n- Three primary values create a clear decision framework\n- Every value translates to observable behaviors" },
  { id: "jtbd", title: "Jobs-To-Be-Done Framework", content: "# Jobs-To-Be-Done Framework\n\n## Functional Jobs\n\n- \"Help me start my morning with energy and focus\"\n- \"Help me find coffee matching my taste preferences\"\n- \"Help me serve impressive coffee when hosting\"\n\n## Emotional Jobs\n\n- \"Make me feel good about my purchasing choices\"\n- \"Make me feel part of a values-aligned community\"\n- \"Make me feel like I'm discovering something special\"\n\n## JTBD Analysis\n\n| Job Statement | Trigger | Current Solution | Pain | Opportunity |\n|--------------|---------|-----------------|------|-------------|\n| Find ethically sourced coffee | Supply chain exposé | Random fair trade labels | 8/10 | Full traceability |\n| Morning ritual that feels intentional | WFH routine | Generic subscription | 6/10 | Curated experience |\n| Impress guests with unique coffee | Weekend hosting | Whatever looks premium | 7/10 | Story-rich packaging |\n| Connect with coffee community | Isolation in hobby | Reddit, YouTube | 7/10 | Active community |\n\n## Key Takeaways\n\n- Emotional and social jobs are as important as functional ones\n- \"Ethical sourcing confidence\" is the highest-pain opportunity\n- Community connection is a structural advantage" },
  { id: "journey", title: "Customer Journey Map", content: "# Customer Journey Map\n\n## Stage 1: Trigger / Awareness\n\n**Actions:** Reads article about supply chain issues, sees friend's Instagram post, encounters targeted ad\n\n**Emotions:** Curiosity mixed with skepticism\n\n**Brand Opportunity:** Lead with proof, not promises.\n\n## Stage 2: Research / Consideration\n\n**Actions:** Visits website, reads farm profiles, checks reviews, follows on Instagram\n\n**Emotions:** Growing trust, comparing 2-3 alternatives\n\n**Brand Opportunity:** Educational content demonstrating expertise.\n\n## Stage 3: Evaluation\n\n**Actions:** Compares pricing, reads subscription terms, looks for trial option\n\n**Emotions:** Hesitation about price premium\n\n**Brand Opportunity:** No-commitment tasting kit + social proof.\n\n## Stage 4: Purchase Decision\n\n**Actions:** Selects tasting kit, chooses flavor profile, completes checkout\n\n**Emotions:** Excitement mixed with hope\n\n**Brand Opportunity:** Post-purchase transparency (sourcing details).\n\n## Stage 5: Post-Purchase\n\n**Actions:** Tries coffee, scans QR code, shares on social, considers upgrade\n\n**Emotions:** Satisfaction and belonging\n\n**Brand Opportunity:** Community onboarding within 48 hours.\n\n## Critical Drop-Off Points\n\n- **Stage 2→3:** 40% drop (price comparison)\n- **Stage 3→4:** 25% drop (no trial option)\n- **Stage 4→5:** 15% churn (first month)\n\n## Key Takeaways\n\n- Two critical gaps: price perception and trial availability\n- Post-purchase community onboarding reduces churn\n- Every touchpoint should reinforce transparency" },
  { id: "tone", title: "Tone of Voice Guidelines", content: "# Tone of Voice Guidelines\n\n## Voice Attributes\n\n| Dimension | Position | Expression |\n|-----------|----------|------------|\n| Formal ↔ Casual | 7/10 casual | \"Hey, let's talk about your coffee\" |\n| Expert ↔ Peer | 6/10 peer | Knowledgeable but not condescending |\n| Serious ↔ Playful | 6/10 playful | Warm, sometimes witty, never silly |\n| Cautious ↔ Bold | 7/10 bold | Confident claims backed by evidence |\n\n## Do's and Don'ts\n\n| Do | Don't |\n|----|-------|\n| \"Sourced from Maria's farm in Huila, Colombia\" | \"Premium artisanal beans\" |\n| \"Carbon-neutral since 2024 (here's the data)\" | \"We care about the planet\" |\n| \"Join 2,400 coffee explorers\" | \"Buy now, limited time!\" |\n\n## Channel Variations\n\n**Social Media:** Most casual. First-person plural, behind-the-scenes.\n\n**Website:** Confident and informative. Lead with proof points.\n\n**Email:** Personal and warm. First name basis. Value-first.\n\n**Advertising:** Bold and visual. One strong claim per ad.\n\n## Before/After Rewrites\n\n**Generic:** \"Our premium coffee is sourced from the finest farms.\"\n**On-brand:** \"This week's roast comes from the Gutiérrez family farm in Huila — 1,650m altitude, washed process, dark chocolate and mandarin notes.\"\n\n## Key Takeaways\n\n- Voice is warm, knowledgeable, proof-driven\n- Specificity is the signature: names, numbers, origins\n- Tone flexes by channel but voice never changes" },
  { id: "visual-identity", title: "Visual Identity Direction", content: "# Visual Identity Direction\n\n## Color Psychology\n\n**Primary: Deep Forest Green (#2D5016)** — Growth, sustainability, nature\n**Secondary: Warm Cream (#F5E6D3)** — Warmth, approachability\n**Accent: Burnt Copper (#B87333)** — Craft, premium, earth tones\n\n## Typography Direction\n\n**Headings:** Serif (DM Serif Display) — heritage and substance\n**Body:** Sans-serif (Inter) — modern digital readability\n**Weight:** Medium-bold headings, regular body. No ultra-thin.\n\n## Imagery Style\n\n**Photography:**\n- Natural lighting, warm tones\n- Real people in real settings\n- Close-ups of coffee process\n- Farm photography with named individuals\n\n## Visual Principles\n\n| Principle | Application |\n|-----------|------------|\n| Transparency | Show process, not just product |\n| Warmth | Natural lighting, earth tones |\n| Authenticity | Real photos over stock |\n| Simplicity | Clean layouts, generous white space |\n| Story | Every visual supports a narrative |\n\n## Key Takeaways\n\n- Green + cream + copper bridges sustainability with warmth\n- Photography must feature real people and places\n- Visual identity: editorial and warm, not corporate" },
  { id: "mood-board", title: "Mood Board & Visual References", content: "# Mood Board Direction\n\n## Overall Mood\n\nWarm, earthy, authentic. Like a cozy morning in a well-lit coffee shop.\n\n## Image Descriptions\n\n1. **Hands cupping a ceramic mug** — warm morning light, steam visible, rough texture\n2. **Aerial view of coffee farm at sunrise** — lush green, mist, human scale\n3. **Farmer sorting coffee cherries** — genuine smile, weathered hands\n4. **Coffee beans on raw linen** — natural textures, earth tones\n5. **Friends sharing coffee** — natural lighting, conversation visible\n6. **Inside a modern roastery** — industrial, copper accents\n7. **Hand-written tasting notes** — fountain pen, coffee ring stain\n8. **Package being unwrapped** — kraft paper, QR code visible\n\n## Texture References\n\n- Raw linen and natural cotton\n- Kraft paper and recycled cardboard\n- Copper and brushed metal accents\n- Ceramic and stoneware\n- Reclaimed wood grain\n\n## Key Takeaways\n\n- Every mood board image features human presence\n- Palette stays within earth tones\n- Avoid clinical, corporate, or overly polished" },
  { id: "comms-strategy", title: "Communication Strategy", content: "# Communication Strategy\n\n## Key Message Hierarchy\n\n**Primary:** \"Know exactly where your coffee comes from.\"\n\n**Secondary:**\n- \"Join 2,400 coffee explorers\"\n- \"Carbon-neutral operations, farmer profit-sharing\"\n- \"From farm to cup — every step visible\"\n\n## Channel Strategy Matrix\n\n| Channel | Segment | Content Type | Frequency | KPI |\n|---------|---------|-------------|-----------|-----|\n| Instagram | Mindful Maria | Behind-the-scenes | 5x/week | Engagement |\n| LinkedIn | B2B | Thought leadership | 2x/week | Connections |\n| Email | All subs | Education + offers | Weekly | Open rate |\n| Blog/SEO | Discovery | Long-form guides | 2x/month | Traffic |\n| YouTube | Curious Cristian | Tutorials, tours | 1x/week | Watch time |\n| Events | Community | Virtual tastings | Monthly | NPS |\n\n## Content Pillars\n\n1. **Origin Stories** — Farm profiles, farmer interviews\n2. **Brewing Knowledge** — Techniques, recipes, equipment\n3. **Impact Reports** — Sustainability data, metrics\n4. **Community Spotlights** — Member stories, events\n5. **Product Education** — Tasting notes, seasonal releases\n\n## Key Takeaways\n\n- Five content pillars ensure variety with coherence\n- Instagram and email are highest-priority channels\n- Every piece traces back to a content pillar" },
  { id: "growth-roadmap", title: "Growth Roadmap", content: "# Growth Roadmap\n\n## Phase 1 — Foundation (Months 1-6)\n\n**Strategic Priorities:**\n- Launch DTC website with subscription\n- Build initial community of 500 founders\n- Establish 5 direct farm partnerships\n\n**Key Initiatives:**\n- Website development and launch\n- Founding member campaign\n- Content marketing: 20 origin stories, 10 guides\n- Instagram + email infrastructure\n- First virtual tasting event\n\n**Success Metrics:**\n- 500 subscribers by month 6\n- 15% MoM growth\n- 4.5+ average rating\n- €50K monthly revenue\n\n## Phase 2 — Acceleration (Months 7-12)\n\n**Strategic Priorities:**\n- Scale to 2,000 subscribers\n- Launch community platform\n- Begin B2B channel\n\n**Key Initiatives:**\n- Community platform launch\n- B2B pilot with 10 partner cafés\n- 5 micro-influencer partnerships\n- Cold brew line for summer\n- First farm visit trip\n\n**Success Metrics:**\n- 2,000 active subscribers\n- 35% retention at 6 months\n- 500 monthly active community users\n- €150K monthly revenue\n\n## Phase 3 — Scale (Year 2-3)\n\n**Strategic Priorities:**\n- Expand to 3 CEE markets\n- Launch retail channel\n- Build category leadership\n\n**Key Initiatives:**\n- Market entry: Poland, Czech Republic, Hungary\n- Retail partnerships with premium grocers\n- Annual impact report\n- Brand ambassador program\n- Limited-edition collaboration roasts\n\n**Success Metrics:**\n- 10,000 subscribers across 4 markets\n- €1M+ annual revenue\n- 25% aided awareness in target segment\n- NPS: 70+\n\n## Key Takeaways\n\n- Three phases with distinct priorities and measurable outcomes\n- Community building connects all three phases\n- Risk mitigation built into each phase" },
  { id: "action-plan", title: "Action Plan & Implementation", content: "# Action Plan & Implementation\n\n## Top 10 Immediate Actions (Next 30 Days)\n\n1. **Finalize brand identity package**\n2. **Secure 3 farm partnerships** — Colombia, Ethiopia, Guatemala\n3. **Build website MVP** — Shopify + subscription\n4. **Create founding member landing page**\n5. **Produce 5 origin story pieces**\n6. **Set up email marketing** — Welcome sequence + newsletter\n7. **Launch Instagram** — 30-day content calendar\n8. **Order initial inventory** — 3 single-origin roasts\n9. **Set up analytics** — GA4, social tracking\n10. **Plan first virtual tasting**\n\n## Quick Wins (High Impact, Low Effort)\n\n- Instagram Highlights with farm stories\n- QR codes on packaging → farm profiles\n- Referral program with founding incentive\n- \"Coffee Explorer's Guide\" lead magnet\n\n## Prioritization Matrix\n\n| Action | Impact | Effort | Priority | Timeline |\n|--------|--------|--------|----------|----------|\n| Website MVP | High | High | P1 | Month 1-2 |\n| Farm partnerships | High | Medium | P1 | Month 1 |\n| Brand identity | High | Medium | P1 | Week 1-2 |\n| Email marketing | High | Low | P1 | Week 2-3 |\n| Instagram launch | Medium | Low | P2 | Week 2 |\n| Community platform | High | High | P3 | Month 3-6 |\n\n## Start / Stop / Continue\n\n**Start:**\n- Leading with transparency and proof points\n- Building community before selling product\n- Publishing impact data regularly\n\n**Stop:**\n- Using generic \"premium\" language\n- Comparing to mass-market brands\n- Delaying launch for perfection\n\n**Continue:**\n- Direct farmer relationships\n- Values-driven decisions\n- Customer feedback loops\n\n## Key Takeaways\n\n- 10 immediate actions provide a clear 30-day roadmap\n- Quick wins generate momentum while strategic bets build moat\n- Start/Stop/Continue makes daily decisions simple" },
];

// ─── Template sample data ────────────────────────────────────────

const sampleData = JSON.parse(readFileSync(path.join(process.cwd(), 'src/data/qa-sample-data.json'), 'utf-8'));

// ─── HTML Generators ─────────────────────────────────────────────

function generateStrategyDeckHtml() {
  const totalSections = SECTIONS.length;
  const accentColors = ['#2AB9B0', '#e8384f', '#F28C28', '#8ED16A', '#F8CE30'];

  const tocHtml = SECTIONS.map((s, i) =>
    `<div class="toc-row"><span class="toc-n">${String(i+1).padStart(2,'0')}</span><span class="toc-t">${s.title}</span><span class="toc-ln"></span><span class="toc-pg">${String(i*2+3).padStart(2,'0')}</span></div>`
  ).join('');

  const chaptersHtml = SECTIONS.map((s, idx) => {
    const n = String(idx+1).padStart(2,'0');
    const accent = accentColors[idx % accentColors.length];
    const bodyHtml = mdToHtml(s.content);
    return `<div class="chapter-divider"><div class="cd-accent" style="background:${accent}"></div><div class="cd-content"><span class="cd-label">Chapter</span><p class="cd-num">${n}</p><h1 class="cd-title">${s.title}</h1><div class="cd-bar" style="background:linear-gradient(90deg,${accent},${accent}44)"></div></div><div class="cd-footer"><span>Advertising Unplugged</span><span>Brand Strategy Deck</span></div></div>
<div class="chapter-body"><div class="cb-sidebar"><span class="cb-chnum">${n}</span><span class="cb-chtitle">${s.title}</span></div><div class="cb-main"><div class="cb-head"><span class="cb-label">Chapter ${n} &mdash; ${s.title}</span><span class="cb-date">${DATE_STR}</span></div><div class="cb-content">${bodyHtml}</div></div><div class="cb-footer"><span class="cb-foot-brand">Advertising Unplugged &bull; Brand Strategy Deck</span><span class="cb-foot-page">${n} / ${String(totalSections).padStart(2,'0')}</span></div></div>`;
  }).join('\n');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Brand Strategy Deck — NovaBrew</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${SHARED_CSS}</style></head><body>
<div class="cover"><div class="cover-top"><img src="${LOGO_PATH}" class="cover-logo"/></div><div class="cover-center"><div class="cover-bar"></div><p class="cover-lbl">Brand Strategy</p><h1 class="cover-ttl">Strategy<br/><span class="cover-ttl-accent">Deck</span></h1><p class="cover-sub">A comprehensive brand strategy prepared exclusively for NovaBrew Coffee by Advertising Unplugged.</p></div><div class="cover-bottom"><div class="cover-gradient-bar"></div><div class="cover-ft"><span>Confidential &mdash; ${YEAR}</span><span>${DATE_STR}</span><span>advertisingunplugged.com</span></div></div></div>
<div class="toc-page"><div class="toc-header"><p class="toc-supra">Overview</p><h2 class="toc-title">Contents</h2></div><div class="toc-list">${tocHtml}</div></div>
${chaptersHtml}
<div class="back-cover"><img src="${LOGO_PATH}" class="bc-logo"/><div class="bc-bar"></div><p class="bc-tag">Advertising Unplugged</p><p class="bc-mot">Clarity Over Noise. Purpose Beyond Profit.</p><p class="bc-url">advertisingunplugged.com</p><p class="bc-year">&copy; ${YEAR} All rights reserved.</p></div>
</body></html>`;
}

function generateTemplateHtml(name, category, sheetsData) {
  let sheetsHtml = '';
  for (const [sheetName, fields] of Object.entries(sheetsData)) {
    const fieldsHtml = Object.entries(fields).map(([label, value]) =>
      `<div class="field"><p class="field-label">${label.replace(/_/g, ' ')}</p><div class="field-value">${String(value) || '<span class="empty">Not filled</span>'}</div></div>`
    ).join('');
    sheetsHtml += `<div class="sheet-block"><h2 class="sheet-title">${sheetName.replace(/_/g, ' ')}</h2>${fieldsHtml}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${SHARED_CSS}</style></head><body>
<div class="cover"><div class="cover-top"><img src="${LOGO_PATH}" class="cover-logo"/></div><div class="cover-center"><div class="cover-bar"></div><p class="cover-lbl">${category} Template</p><h1 class="cover-ttl">${name}</h1></div><div class="cover-bottom"><div class="cover-gradient-bar"></div><div class="cover-ft"><span>Confidential &mdash; ${YEAR}</span><span>${DATE_STR}</span><span>advertisingunplugged.com</span></div></div></div>
<div class="content-page"><div class="sidebar"><span class="sidebar-label">${name}</span></div><div class="content-main"><div class="content-head"><span class="content-head-label">${name}</span><span class="content-head-date">${DATE_STR}</span></div>${sheetsHtml}</div><div class="page-footer"><span class="page-footer-brand">Advertising Unplugged &bull; ${category} Template</span><span>${DATE_STR}</span></div></div>
<div class="back-cover"><img src="${LOGO_PATH}" class="bc-logo"/><div class="bc-bar"></div><p class="bc-tag">Advertising Unplugged</p><p class="bc-mot">Clarity Over Noise. Purpose Beyond Profit.</p><p class="bc-url">advertisingunplugged.com</p><p class="bc-year">&copy; ${YEAR} All rights reserved.</p></div>
</body></html>`;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  const exports = [
    {
      name: 'strategy-deck-novabrew',
      label: 'Strategy Deck (15 chapters)',
      html: generateStrategyDeckHtml(),
    },
    {
      name: 'template-customer-persona-builder',
      label: 'Customer Persona Builder',
      html: generateTemplateHtml('Customer Persona Builder', 'Brand',
        Object.fromEntries(
          Object.entries(sampleData.customer_persona_builder).map(([sheet, rows]) => [
            sheet, rows[0] || {}
          ])
        )
      ),
    },
    {
      name: 'template-brand-messaging-matrix',
      label: 'Brand Messaging Matrix',
      html: generateTemplateHtml('Brand Messaging Matrix', 'Brand',
        Object.fromEntries(
          Object.entries(sampleData.brand_messaging_matrix).map(([sheet, rows]) => [
            sheet, rows[0] || {}
          ])
        )
      ),
    },
  ];

  const results = [];

  for (const exp of exports) {
    console.log(`\nExporting: ${exp.label}...`);
    const page = await browser.newPage();

    // Write HTML to a temp file and load it (for local image paths to work)
    const tmpHtml = path.join(OUTPUT_DIR, `_tmp_${exp.name}.html`);
    writeFileSync(tmpHtml, exp.html);
    await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));

    const pdfPath = path.join(OUTPUT_DIR, `${exp.name}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    // Cleanup temp HTML
    const fs = await import('fs/promises');
    await fs.unlink(tmpHtml);

    const stats = await fs.stat(pdfPath);
    const pages = Math.round(stats.size / 25000); // rough estimate
    console.log(`  ✓ Saved: ${pdfPath} (${Math.round(stats.size/1024)}KB, ~${pages} pages)`);

    results.push({
      name: exp.label,
      file: `pdfs/${exp.name}.pdf`,
      size: `${Math.round(stats.size/1024)}KB`,
      status: 'EXPORTED',
    });

    await page.close();
  }

  await browser.close();

  console.log('\n═══ QA Export Summary ═══\n');
  for (const r of results) {
    console.log(`  ${r.status === 'EXPORTED' ? '✓' : '✗'} ${r.name} → ${r.file} (${r.size})`);
  }
  console.log(`\nAll PDFs saved to: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
