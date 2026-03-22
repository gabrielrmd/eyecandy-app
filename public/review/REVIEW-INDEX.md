# Template & Export QA Review Index

**Date:** March 22, 2026
**App:** Advertising Unplugged — eyecandy-app
**Review Page:** `/qa-review` (requires login)

---

## QA Status Legend

- **CODE-VERIFIED** — Export code implemented, compiles, deployed. Not browser-tested.
- **BROWSER-TESTED** — Opened in browser, filled with data, PDF exported and inspected.
- **PASS** — Browser-tested, PDF exported, visually inspected, no issues.
- **FAIL** — Browser-tested, issues found (see notes).
- **FIXED** — Was FAIL, issue fixed, re-tested, now passes.

---

## Export Systems

| System | Code Status | Browser Status | Notes |
|--------|------------|----------------|-------|
| Strategy Deck PDF (15 chapters) | CODE-VERIFIED | **NEEDS BROWSER TEST** | Full markdown → HTML pipeline, premium print CSS |
| Template PDF (Schema renderer) | CODE-VERIFIED (this session) | **NEEDS BROWSER TEST** | NEW — was a dead stub button |
| Template PDF (Legacy editor) | CODE-VERIFIED (this session) | **NEEDS BROWSER TEST** | NEW — was a dead stub button |
| Template XLSX | NOT IMPLEMENTED | — | UI button exists, no logic |

---

## Priority Templates — Detailed QA

### 1. Strategy Deck (15 chapters)

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | CREATED — 15 chapters of NovaBrew Coffee brand strategy (see `qa-review/page.tsx`) |
| Content types tested | Headings, bullets, numbered lists, tables, Key Takeaways boxes, Recommended Actions, bold/italic |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/strategy-deck-novabrew.pdf` |

**Sample data summary:** Full NovaBrew Coffee strategy covering brand story, market analysis (€12.3B European market), two detailed personas, positioning statement, competitive matrix (4-competitor table), archetype analysis, values framework, JTBD analysis (5 jobs table), customer journey (5 stages), tone of voice (do/don't table, channel variations, before/after rewrites), visual identity, mood board, communication strategy (channel matrix table), 3-phase growth roadmap, and action plan (prioritization matrix table).

**What to check in the PDF:**
- [ ] Cover page renders with logo, title, gradient
- [ ] TOC lists all 15 chapters with page numbers
- [ ] Chapter dividers show correct numbers and accent colors
- [ ] Tables render correctly (Market Analysis, Competitive Matrix, JTBD, Channel Strategy, Prioritization)
- [ ] Key Takeaways boxes have proper styling and don't split across pages
- [ ] Bullet groups stay together (label-group wrapping)
- [ ] Headings don't orphan at bottom of pages
- [ ] Back cover renders
- [ ] Fonts load (Oswald + Inter)
- [ ] Navy sidebar stripe appears on content pages

---

### 2. Customer Persona Builder

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | CREATED — "Marketing Maria" persona (`qa-sample-data.json`) |
| Sheets | 6 form sheets: Demographics, Psychographics, Goals & Challenges, Buying Journey, Communication, Brand Relationship |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/template-customer-persona-builder.pdf` |

**Sample data summary:** Complete "Marketing Maria" persona — 28-35yo Marketing Manager at a SaaS startup in Bucharest, €35-55K income, early tech adopter, LinkedIn-active, frustrated with too many marketing tools, looking to prove ROI to her CEO.

**What to check:**
- [ ] Cover page shows "Customer Persona Builder" + "brand Template"
- [ ] All 6 sheets render with section titles
- [ ] 58 fields show labels (teal uppercase) and values
- [ ] Long textarea values (lifestyle, research behavior) wrap correctly
- [ ] Dropdown values (tech_attitude, decision_timeline) show selected option
- [ ] Fields don't split awkwardly across pages
- [ ] Back cover renders

---

### 3. Brand Messaging Matrix

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | CREATED — NovaBrew messaging (`qa-sample-data.json`) |
| Sheets | 4 working sheets: Brand Foundation (form), Messaging Pillars (table), Audience Matrix (table), Elevator Pitches (form) |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/template-brand-messaging-matrix.pdf` |

**What to check:**
- [ ] Form fields render (positioning statement, mission, values)
- [ ] Table sheets (Messaging Pillars, Audience Matrix) render as HTML tables
- [ ] Long text values don't overflow or clip
- [ ] Mixed form + table content paginates correctly

---

### 4. Competitor Analysis Framework

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | Uses default rows from schema (20+ competitor profile rows, 22+ marketing analysis rows) |
| Sheets | 2 table sheets: Competitor Profiles (7 columns × 20 rows), Marketing Analysis (7 columns × 22 rows) |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/template-competitor-analysis.pdf` |

**What to check:**
- [ ] Large tables render without clipping
- [ ] 7-column tables fit on A4 (may need smaller font)
- [ ] Row data is readable
- [ ] Table doesn't overflow page width

---

### 5. Marketing Funnel Tracker

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | Uses default rows from schema (21 metric rows × 14 columns) |
| Sheets | 2 table sheets: Monthly Funnel, Funnel Targets |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/template-marketing-funnel.pdf` |

**What to check:**
- [ ] 14-column tables (monthly data) fit or adapt to A4
- [ ] Numeric data aligns correctly
- [ ] Computed/calculated rows render

---

### 6. Brand Book Template

| Item | Status |
|------|--------|
| Code | CODE-VERIFIED |
| Sample data | Uses default rows from schema |
| Sheets | 8 working sheets (2 forms, 5 tables, 1 summary): Brand Foundation, Visual Identity, Tone of Voice, Messaging Architecture, Application Guidelines, Asset Library, Brand Audit, Compliance Tracker |
| PDF export | **NEEDS BROWSER TEST** |
| Expected file | `public/review/template-brand-book.pdf` |

**What to check:**
- [ ] All 8 sheets render
- [ ] Form fields and table sheets both work
- [ ] Grouped tables (groupBy: category) render correctly
- [ ] Many-field forms (Brand Foundation: 11 fields, Visual Identity: 20+ fields) paginate well

---

## Code Fixes Made During This QA Session

| # | Fix | Files Changed |
|---|-----|---------------|
| 1 | **Implemented template PDF export** (was dead stub) | `template-renderer.tsx`, `template-editor-client.tsx` |
| 2 | **Wired Export PDF buttons** to actual functions | Both files above |
| 3 | **Created QA test page** at `/qa-review` | `src/app/(dashboard)/qa-review/page.tsx` |
| 4 | **Created sample data fixtures** for 2 priority templates | `src/data/qa-sample-data.json` |
| 5 | **Created 15-chapter strategy deck sample** with NovaBrew content | Embedded in QA page |

---

## Remaining Work

| Item | Priority | Notes |
|------|----------|-------|
| **Browser QA for all 6 templates** | HIGH | Open each, fill data, export PDF, save to this folder |
| Wide table handling | MEDIUM | 14-column Marketing Funnel may overflow A4 — may need landscape or smaller font |
| XLSX export | LOW | Still a dead button — not critical for launch |

---

## How to Complete Browser QA

1. Open `https://eyecandy-app.vercel.app/qa-review` (logged in)
2. For each template:
   a. Click "Test Export" to open the template
   b. Fill with sample data from `qa-sample-data.json` or manually
   c. Click "Export PDF" in the template's top bar
   d. In Chrome: Destination → "Save as PDF", Margins → "None", check "Background graphics"
   e. Save to `public/review/` with the naming convention above
3. For the Strategy Deck:
   a. Go to Dashboard → open a strategy with generated content
   b. Click "Export PDF" on the result page
   c. Save as `strategy-deck-[name].pdf`
4. Update this file with PASS/FAIL for each template
