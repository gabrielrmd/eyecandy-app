# Product Requirements Document: Strategy Builder Intake

**Product:** Advertising Unplugged
**Feature:** Strategy Builder — Intake Page
**Route:** `/strategy/new`
**Document version:** 1.0
**Date:** 2026-03-26
**Author:** Product team
**Status:** Active feature — documenting existing implementation for refinement

---

## 1. Product / Feature Name

**AI Strategy Builder — Intake Page**

This is the entry point into the Strategy Builder flow within the Advertising Unplugged platform. It is a gated, authenticated page that collects foundational business context before launching the user into a multi-step AI-powered strategy questionnaire.

---

## 2. Overview

The Strategy Builder Intake page (`/strategy/new`) is the first step of a multi-stage AI-powered strategy generation tool. It sits inside the authenticated dashboard shell of Advertising Unplugged, a SaaS platform that provides marketing templates, strategy tools, community access, and growth challenges to entrepreneurs and marketing professionals.

This page does three things:

1. **Communicates the value proposition** — tells the user what the Strategy Builder does, what they will receive, and why it is worth their time.
2. **Captures foundational business data** — collects five fields (business name, industry, business stage, main challenge, primary goal) that seed the downstream AI strategy generation.
3. **Initiates the strategy workflow** — upon submission, creates a strategy project record and navigates the user into the questionnaire flow.

The page is not a standalone marketing page. It is a product screen experienced after login, within the dashboard layout, and gated behind a subscription entitlement.

---

## 3. Problem Statement

Entrepreneurs and marketing professionals need comprehensive brand and marketing strategies but lack the time, budget, or expertise to produce them. Traditional strategy consulting engagements take weeks and cost thousands of euros. Generic templates lack personalization.

The Strategy Builder addresses this by guiding users through a structured questionnaire and generating a tailored, AI-powered strategy deck. The intake page is the critical first touchpoint — it must simultaneously:

- Reduce friction to starting
- Set expectations for the process and output
- Capture enough business context to personalize the experience from step one
- Prevent abandonment by communicating value clearly

If this page fails, users either never start the strategy flow or start it with insufficient context, degrading the quality of downstream AI output.

---

## 4. Goal

**Primary goal:** Maximize the conversion rate from page load to successful form submission (intake completion).

**Secondary goals:**
- Ensure all submitted intake data is of sufficient quality to seed the AI strategy generation
- Support draft persistence so users can return and resume without data loss
- Reinforce product credibility through trust signals and value framing
- Maintain visual and functional consistency with the broader product experience

---

## 5. Business Context

### 5.1 Monetization

`Observed from product code`

The Strategy Builder is a premium feature gated behind the **Professional plan** (€149/year) or available as a **standalone add-on** (€199 one-time). It is also included in the **Agency plan** (€249/year).

- Professional plan includes 5 strategy credits
- Agency plan includes unlimited strategy credits
- Additional credits available as a 5-pack for €99
- The standalone Strategy Builder add-on grants 5 credits

This means the intake page serves as a key activation point for a paid feature. Users who reach this page have either paid or are evaluating whether to upgrade.

### 5.2 Access gating

`Observed from code`

The page is wrapped in an `AccessGate` component that checks the `strategy_builder` entitlement. Users without access see a paywall screen directing them to the Pricing page or back to the Dashboard. The paywall states: "Professional Plan Required — This feature requires an active Professional subscription."

### 5.3 Product positioning

`Observed from UI copy`

The product positions itself as a tool built on:
- 15+ years of strategy consulting experience
- Analysis of 1,000+ successful brand strategies
- Usage by entrepreneurs across 30+ countries

This is not positioned as a generic AI form filler. It is positioned as expert-led strategy methodology delivered via AI — a consultancy-grade tool at software scale.

---

## 6. User Types / Personas

### 6.1 Primary: Entrepreneur / Founder

`Inferred from field options and product context`

- Solo founders or small team leaders
- Building or scaling a business across various stages (idea, MVP, revenue-generating)
- Need marketing/brand strategy but lack a dedicated strategist
- Budget-conscious — chose this tool over hiring a consultant
- Industries ranging from SaaS to local service businesses

### 6.2 Secondary: Marketing Professional / Freelancer

`Inferred from product positioning and Agency plan`

- In-house marketer or agency professional
- Needs to rapidly produce strategy decks for clients or internal stakeholders
- Values speed, structure, and editability over perfect AI output
- May use the Agency plan for white-label client delivery

### 6.3 Tertiary: Agency User (White-Label)

`Inferred from Agency plan features`

- Uses the platform to generate branded strategies for their own clients
- Unlimited credits, team seats
- The intake page functions as a client project initiation screen

---

## 7. User Jobs-To-Be-Done

| Job | Context |
|-----|---------|
| Understand what the Strategy Builder will produce for me | Before committing time to answer 39 questions |
| Provide basic business context so the strategy is relevant | Seeding the AI with foundational inputs |
| Start the strategy process quickly without friction | Users are motivated but may abandon if the start feels heavy |
| Resume where I left off if I get interrupted | Real-world attention spans; users may not complete in one session |
| Feel confident that the output will be worth my time | Trust-building before a significant time investment |

---

## 8. Primary User Flow

```
[User logs in]
      ↓
[Navigates to Strategy Builder via sidebar or top nav]
      ↓
[Access gate checks subscription entitlement]
      ↓
  ┌── Has access ──────────────────────┐
  │                                     │
  │  [Intake page loads]                │
  │  [Draft loaded if exists]           │
  │  [User reads hero + value panel]    │
  │  [User fills intake form]           │
  │  [Validation on blur + submit]      │
  │  [User clicks "Start Strategy       │
  │   Builder"]                         │
  │  [Strategy project created in DB]   │
  │  [Navigate to /strategy/{id}/       │
  │   questionnaire]                    │
  │                                     │
  └── No access ───────────────────────┘
  │                                     │
  │  [Paywall screen shown]             │
  │  [CTA: "View Plans & Pricing"]      │
  │  [CTA: "Back to Dashboard"]         │
  └─────────────────────────────────────┘
```

### Downstream flow after intake

`Observed from route structure`

After submission, the user proceeds through:

1. `/strategy/{id}/questionnaire` — the 39-question, 7-section questionnaire
2. `/strategy/{id}/generating` — AI generation in progress screen
3. `/strategy/{id}/result` — the completed 15-section strategy deck
4. `/strategy/{id}/review` — review/edit/export screen

The intake data (business name, industry, stage, challenge, goal) is passed downstream as context for all AI generation.

---

## 9. Page Purpose

This page serves as a **conversion funnel step** within the product. It is not informational in isolation — its sole purpose is to move the user from "considering" to "actively building" their strategy.

The page must balance three forces:
1. **Speed** — let eager users start immediately
2. **Clarity** — set expectations so users don't abandon mid-questionnaire
3. **Quality** — collect enough context that the AI output is genuinely tailored

---

## 10. Information Architecture / Page Structure

`Observed from UI`

The page exists within the authenticated dashboard shell:

```
┌─────────────────────────────────────────────────────────┐
│  TOP NAVIGATION BAR (dark navy, sticky)                 │
│  Logo | Templates | Strategy Builder* | Growth          │
│  Challenge | Community | Pricing | Dashboard | Log out  │
├──────────┬──────────────────────────────────────────────┤
│ LEFT     │  MAIN CONTENT AREA                           │
│ SIDEBAR  │                                              │
│          │  ┌─ Hero Section ──────────────────────┐     │
│ Dashboard│  │ [pill] AI Strategy Builder           │     │
│ Templates│  │ Create Your Strategy                 │     │
│ Strategy*│  │ Supporting paragraph                 │     │
│ Growth   │  └────────────────────────────────────────┘  │
│ Community│                                              │
│ Settings │  ┌─ Form Card ──────┐  ┌─ Value Panel ─┐    │
│ Billing  │  │ Let's get started│  │ What you get   │    │
│          │  │ [5 fields]       │  │ [6 benefits]   │    │
│ Log out  │  │ [CTA button]     │  │ [3 trust items]│    │
│          │  └──────────────────┘  └────────────────┘    │
│ [collapse│                                              │
│  toggle] │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Layout behavior

- **Desktop (lg+):** Three-column layout — sidebar (240px collapsible to 64px) + main content (flexible) + value panel (320px). Hero spans the full main content width. Form card and value panel sit side by side below the hero.
- **Tablet / smaller screens:** Sidebar hidden. Value panel stacks below the form card.
- **Mobile:** Single column. Top nav collapses to hamburger menu. All content stacks vertically.

---

## 11. Detailed UI Breakdown

### 11.1 Top Navigation Bar

`Observed from code`

- **Appearance:** Dark navy (#1A1A2E) background, white text, sticky at top, z-index 50
- **Height:** 64px (h-16)
- **Logo:** Advertising Unplugged white logo, links to home (`/`)
- **Nav links (desktop):** Templates, Strategy Builder, Growth Challenge, Community, Pricing
- **Active state:** `Strategy Builder` is highlighted with `bg-white/15 text-white` when pathname starts with `/strategy`
- **Auth section:** Dashboard link with user icon, Log out button with border
- **Mobile:** Hamburger toggle reveals full-screen overlay with nav links + auth controls

### 11.2 Left Sidebar

`Observed from code`

- **Position:** Sticky below top nav, full remaining viewport height
- **Width:** 240px expanded, 64px collapsed
- **Background:** White with right border
- **Links:** Dashboard, Templates, Strategy Builder, Growth Challenge, Community, Settings, Billing
- **Active state:** `Strategy Builder` highlighted with coral accent (`bg-coral/10 text-coral`) when at `/strategy/new`
- **Footer:** Log out button (red text) + collapse/expand chevron
- **Visibility:** Hidden on mobile (md breakpoint)

### 11.3 Hero / Introduction Section

`Observed from UI`

- **Eyebrow pill:** "AI Strategy Builder" — coral background at 10% opacity, coral text, sparkle icon, rounded-full badge
- **Heading:** "Create Your Strategy" — Oswald font, bold, navy color, 3xl/4xl responsive sizing
- **Supporting paragraph:** "Answer 39 strategic questions across 7 sections, and our AI will generate a comprehensive 15-section strategy deck tailored to your business. What normally takes weeks of consulting work, distilled into a guided questionnaire."
  - Max width constrained (~xl)
  - Muted foreground color
  - 18px (text-lg) with relaxed line height

**Product role:** This section sets expectations and creates excitement. The specific numbers (39 questions, 7 sections, 15-section deck, weeks of consulting) serve as concrete proof points that this is a substantial, structured output — not a gimmick.

### 11.4 Intake Form Card

`Observed from UI`

- **Container:** Rounded-xl border, card background, 24px padding, max-width ~md (max-w-md)
- **Title:** "Let's get started" — Oswald font, semibold, navy, lg size
- **Subtitle:** "Tell us about your business to begin." — small, muted foreground
- **Draft indicator:** Appears next to the title when a draft is loaded — shows "Resuming saved draft" (server) or "Resumed from local draft" (localStorage) or "Draft saved" (after autosave)
- **Fields:** See Section 12
- **CTA:** See Section 12.6
- **Error display:** Red background (red-50) with red-600 text below the form when submission errors occur
- **Spacing:** 20px gap between fields (space-y-4), 20px top margin from title to first field

### 11.5 Right-Side Value Panel

`Observed from UI`

- **Container:** Rounded-xl border, card background, 24px padding, fixed width 320px on desktop
- **Title:** "What you get" — Oswald font, semibold, navy, base size

**Benefits list (6 items):**

| Benefit | Icon | Description |
|---------|------|-------------|
| AI-Powered Analysis | Brain | Our AI analyzes your answers to craft a bespoke strategy |
| 15 Strategic Sections | Target | From brand positioning to growth tactics, every area is covered |
| Ready in Minutes | Clock | What normally takes weeks of consulting, generated in minutes |
| Data-Driven | BarChart3 | Backed by analysis of thousands of successful strategies |
| Fully Editable | Layers | Refine, regenerate, and export any section at any time |
| Actionable Next Steps | Zap | Each section includes concrete action items you can start today |

- Each item has a 36px square icon container with teal background at 10% opacity
- Title in sm/medium weight, description in xs/muted

**Trust/proof block:**
- Background: navy at 5% opacity, rounded-lg, 16px padding
- Three items, each with a green checkmark (CheckCircle2, emerald-500):
  - "Built on 15+ years of strategy consulting experience"
  - "Powered by analysis of 1,000+ successful brand strategies"
  - "Used by entrepreneurs across 30+ countries"

**Product role:** This panel exists to sustain motivation while the user is filling out the form. It answers the implicit question "Is this worth my time?" by enumerating concrete deliverables and social proof. Its placement alongside the form ensures the user sees value reinforcement at the moment of highest friction (data entry).

---

## 12. Form / Input Specification

### 12.1 Business Name

| Property | Value | Source |
|----------|-------|--------|
| Type | Single-line text input | Observed |
| Label | "Business Name" | Observed |
| Placeholder | "e.g., Acme Corp" | Observed |
| HTML ID | `business-name` | Observed |
| Required | Yes | Observed |
| Min length | 2 characters (trimmed) | Observed |
| Max length | 100 characters (enforced via `maxLength`) | Observed |
| Character counter | Shown below field: `{current}/{max}` | Observed |
| Validation trigger | On blur + on submit | Observed |
| Error messages | "Business name is required." / "Business name must be at least 2 characters." / "Business name must be 100 characters or fewer." | Observed |

**Purpose:** Identifies the business. Used as the title for the strategy project record. Appears in the strategy deck output.

### 12.2 Industry

| Property | Value | Source |
|----------|-------|--------|
| Type | Select dropdown | Observed |
| Label | "Industry" | Observed |
| Default option | "Select your industry" (value: "") | Observed |
| Required | Yes | Observed |
| Validation trigger | On blur + on submit | Observed |
| Error message | "Please select an industry." | Observed |

**Options (14 + Other):**

| Option | Value |
|--------|-------|
| SaaS | "SaaS" |
| E-commerce | "E-commerce" |
| Agency | "Agency" |
| Coaching / Consulting | "Coaching / Consulting" |
| Healthcare | "Healthcare" |
| Education | "Education" |
| Real Estate | "Real Estate" |
| Hospitality | "Hospitality" |
| Consumer Goods | "Consumer Goods" |
| Finance | "Finance" |
| Nonprofit | "Nonprofit" |
| Creator / Personal Brand | "Creator / Personal Brand" |
| Local Service Business | "Local Service Business" |
| Other | "Other" |

**Conditional field — Custom Industry:**

| Property | Value | Source |
|----------|-------|--------|
| Visibility | Only when "Other" is selected | Observed |
| Type | Single-line text input | Observed |
| Placeholder | "Please specify your industry..." | Observed |
| Border style | Dashed (visual distinction) | Observed |
| Required | Yes, when visible | Observed |
| Min length | 2 characters | Observed |
| Auto-focus | Yes, on reveal | Observed |
| Error message | "Please specify your industry (at least 2 characters)." | Observed |

**Purpose:** Industry is a primary segmentation variable for AI strategy generation. It determines which frameworks, benchmarks, and competitive context the AI applies. The curated list covers the platform's target market breadth while "Other" provides an escape hatch.

### 12.3 Business Stage

| Property | Value | Source |
|----------|-------|--------|
| Type | Radio-card selector (styled radio group) | Observed |
| Label | "Business Stage" | Observed |
| Required | Yes | Observed |
| Selection model | Single select (radio behavior) | Observed |
| Validation trigger | On blur + on submit | Observed |
| Error message | "Please select a business stage." | Observed |

**Options:**

| Label | Description | Value | Source |
|-------|-------------|-------|--------|
| Idea Stage | "You have a concept but haven't launched yet. Still validating the market or building your first version." | `idea` | Observed |
| MVP / Early Stage | "You've launched something and have early users or customers, but you're still finding product-market fit." | `mvp_early` | Observed |
| Revenue Generating | "You have paying customers and consistent revenue. Now focused on growth, retention, or scaling." | `revenue_generating` | Observed |

**Visual states:**
- **Unselected:** Border-border, white background, hover:bg-muted
- **Selected:** Coral border, coral background at 5% opacity, coral-accented radio
- **Error (unselected, post-validation):** Red-300 border on all unselected options
- **Focus:** Native radio focus ring with coral accent

**Purpose:** Business stage fundamentally changes the strategic advice. An idea-stage business needs validation frameworks; a revenue-generating business needs scaling and retention strategies. This field is a primary branching variable for AI output.

### 12.4 Main Challenge

| Property | Value | Source |
|----------|-------|--------|
| Type | Multiline textarea | Observed |
| Label | "Main Challenge" | Observed |
| Placeholder | "What is the biggest challenge your business is facing right now?" | Observed |
| HTML ID | `main-challenge` | Observed |
| Rows | 3 | Observed |
| Required | Yes | Observed |
| Min length | 10 characters (trimmed) | Observed |
| Recommended max | 500 characters | Observed |
| Character counter | Shown below field: `{current}/500` | Observed |
| Counter color change | Turns amber (text-amber-500) when exceeding 500 | Observed |
| Validation trigger | On blur + on submit | Observed |
| Error message | "Main challenge is required." / "Please write at least 10 characters." | Observed |

**Purpose:** This is the most open-ended and arguably most important intake field. It captures the user's primary pain point in their own words. This free-text input gives the AI its most specific signal for personalization. Example challenges: unclear positioning, weak lead generation, low conversion rates, stagnant growth, retention issues, go-to-market confusion.

**Note on the 500-character "recommended" max:** The counter turns amber but does not block input. This is a soft limit — the UI encourages conciseness without enforcing truncation. This is a deliberate UX choice: some challenges genuinely need more context.

### 12.5 Goal

| Property | Value | Source |
|----------|-------|--------|
| Type | Select dropdown | Observed |
| Label | "Goal" | Observed |
| Default option | "Select your primary goal" (value: "") | Observed |
| HTML ID | `goal` | Observed |
| Required | Yes | Observed |
| Validation trigger | On blur + on submit | Observed |
| Error message | "Please select a goal." | Observed |

**Options (8):**

| Option |
|--------|
| Get more customers |
| Clarify brand positioning |
| Improve marketing strategy |
| Increase revenue |
| Launch a new offer |
| Enter a new market |
| Improve retention |
| Build a go-to-market plan |

**Purpose:** The goal provides directional focus for the AI strategy output. While all 15 sections of the strategy deck are generated regardless, the goal influences emphasis, prioritization of recommendations, and the framing of action items.

**Note:** Unlike Industry, this field does not have an "Other" option. This is a deliberate constraint — the eight options cover the platform's supported strategy archetypes. Allowing freeform goals would introduce unbounded variability that the AI templates may not handle well.

### 12.6 Primary CTA

| Property | Value | Source |
|----------|-------|--------|
| Label | "Start Strategy Builder" | Observed |
| Icon | ArrowRight (trailing) | Observed |
| Loading label | "Creating..." | Observed |
| Loading icon | Loader2 (spinning) | Observed |
| Width | Full width (w-full) | Observed |
| Height | ~48px (py-3, text-base) | Observed |
| Enabled state | Coral background, white text, hover:coral/90 | Observed |
| Disabled state | Coral/40 background, white/70 text, cursor-not-allowed | Observed |
| Disable condition | Form is invalid OR submission in progress | Observed |

**Behavior on click:**
1. Mark all fields as requiring validation (submit attempted)
2. Run full validation across all fields
3. If invalid: show all field errors, do not submit
4. If valid: set loading state, call `startStrategy()`
5. On success: navigate to `/strategy/{id}/questionnaire`
6. On failure: show error message in red banner, restore button state

---

## 13. Validation Rules

### 13.1 Validation strategy

`Observed from code`

The page uses a **hybrid blur + submit validation** model:

- **On blur:** When a user leaves a field, that field is validated and errors shown if the field has been "touched"
- **On submit:** All fields are validated simultaneously, all errors shown
- **On change (post-touch):** If a field has been previously touched or a submit has been attempted, live revalidation occurs on each keystroke/selection

This is a thoughtful UX pattern — it avoids aggressive validation on first interaction but provides immediate feedback after the user has engaged with a field.

### 13.2 Field validation matrix

| Field | Required | Min Length | Max Length | Conditional | Error Display |
|-------|----------|-----------|-----------|-------------|---------------|
| Business Name | Yes | 2 (trimmed) | 100 (hard) | — | Below field |
| Industry | Yes | — | — | — | Below field |
| Custom Industry | Yes (when industry = "Other") | 2 (trimmed) | — | Only validated when visible | Below field |
| Business Stage | Yes | — | — | — | Below radio group |
| Main Challenge | Yes | 10 (trimmed) | 500 (soft/recommended) | — | Below field |
| Goal | Yes | — | — | — | Below field |

### 13.3 Error display styling

- Text: `text-xs text-red-500`
- Position: `mt-1` below the input
- Accessibility: `role="alert"` on error messages
- Input border: changes to `border-red-400` when field has an error
- Business Stage: all unselected option borders change to `border-red-300` on error

---

## 14. States and Statuses

### 14.1 Page-level states

| State | Trigger | Behavior |
|-------|---------|----------|
| **Loading** | Page mount, before draft check completes | Full-screen spinner (teal, centered) within AccessGate |
| **Access denied** | User lacks `strategy_builder` entitlement | Paywall screen with upgrade CTA |
| **Empty form** | No draft exists | All fields empty, no indicators |
| **Draft resumed (server)** | Existing draft found in Supabase | Fields prefilled, teal "Resuming saved draft" badge |
| **Draft resumed (local)** | No server draft, but localStorage draft exists | Fields prefilled, green "Resumed from local draft" badge |
| **Filling** | User is entering data | Autosave to localStorage every 1.5s after changes |
| **Draft saved** | Autosave completes | Green "Draft saved" badge appears |
| **Submitting** | User clicks CTA with valid form | Button shows spinner + "Creating...", button disabled |
| **Error** | Submission fails | Red error banner below form, button re-enabled |
| **Success** | Strategy project created | Navigate to `/strategy/{id}/questionnaire` |

### 14.2 Strategy project statuses

`Observed from code`

| Status | Meaning |
|--------|---------|
| `draft` | User started intake but hasn't submitted yet (server-side draft) |
| `in_progress` | User submitted intake, strategy generation is active or questionnaire is in progress |
| `completed` | Strategy has been fully generated |

### 14.3 Field-level states

| State | Visual |
|-------|--------|
| Default | Gray border (border-border) |
| Focused | Coral border + coral ring at 20% opacity |
| Error | Red border (border-red-400) + error text below |
| Filled + valid | Gray border (no positive indicator) |
| Disabled | Not currently implemented — all fields remain editable |

---

## 15. Functional Requirements

### FR-1: Authentication enforcement
The page must only be accessible to authenticated users. Unauthenticated users are handled by the middleware/auth layer before reaching this page.

### FR-2: Entitlement gating
The page content is wrapped in an AccessGate that checks for the `strategy_builder` entitlement. Users without it see a paywall. The entitlement check is performed via `GET /api/user/access`.

### FR-3: Draft loading on mount
On page load, the system must check for an existing draft strategy project (status = "draft") for the current user. If found, prefill all form fields. If not found, check localStorage for a saved draft. This must complete before the form is shown (loading state shown during check).

### FR-4: Autosave to localStorage
Form changes must be debounced (1.5 seconds) and saved to localStorage. This provides protection against accidental tab closure, browser crashes, or network loss.

### FR-5: Form validation
All five fields (plus conditional custom industry) must be validated per the rules in Section 13. Validation must occur on blur for individual fields and on submit for all fields simultaneously.

### FR-6: Strategy project creation
On valid submission, the system must either:
- Update an existing draft project to `in_progress` status, OR
- Create a new strategy project record with `in_progress` status
The system must then navigate to `/strategy/{id}/questionnaire`.

### FR-7: Duplicate submission prevention
The CTA must be disabled during submission. The `isCreating` flag must prevent re-entry into the submission function.

### FR-8: Error recovery
If submission fails, the error must be displayed, form data must be preserved, and the user must be able to retry without re-entering data.

### FR-9: Active navigation state
Both the top nav and sidebar must show "Strategy Builder" as the active item when on this page.

### FR-10: Responsive layout
The three-zone layout (sidebar + form + value panel) must gracefully adapt to tablet and mobile viewports. The sidebar hides on mobile. The value panel stacks below the form on smaller screens.

---

## 16. Non-Functional Requirements

### NFR-1: Performance
- Page should be interactive within 2 seconds on a 4G connection
- Draft loading should not block rendering for more than 1 second
- Autosave should not cause visible UI lag

### NFR-2: Accessibility
- All form fields must have associated labels
- Radio group must use proper radio input semantics (not just styled divs)
- Error messages must use `role="alert"` for screen reader announcement
- Color must not be the sole indicator of state (error borders are supplemented by text)
- Focus states must be visible
- The page must be navigable by keyboard

### NFR-3: Data integrity
- Form data must not be silently lost under any circumstance
- localStorage serves as a client-side safety net independent of server persistence
- Failed submissions must not corrupt existing draft data

### NFR-4: Security
- All server-side operations must verify the user's authentication
- The API must enforce row-level security — users can only access their own drafts
- Input must be sanitized before persistence (trim whitespace, validate against allowed values)

---

## 17. Data Requirements

### 17.1 Data captured by intake form

| Field | DB Column | Type | Constraints | Purpose |
|-------|-----------|------|-------------|---------|
| Business Name | `business_name` / `title` | string | Required, 2–100 chars | Identifies the business, used in strategy title |
| Industry | `industry` | string | Required, from enum list | Primary segmentation for AI |
| Custom Industry | `custom_industry` | string | nullable | Captures industries not in the predefined list |
| Business Stage | `business_stage` | enum | `idea`, `mvp_early`, `revenue_generating` | Determines strategic framework selection |
| Main Challenge | `main_challenge` | text | Required, min 10 chars | Free-text pain point for AI personalization |
| Goal | `primary_goal` | string | Required, from enum list | Directional focus for strategy output |

### 17.2 System-generated fields

| Field | DB Column | Type | Set When |
|-------|-----------|------|----------|
| ID | `id` | UUID | On record creation |
| User ID | `user_id` | UUID (FK) | On record creation, from auth |
| Status | `status` | enum | `draft` on save, `in_progress` on submit |
| Description | `description` | text | Computed: "Industry: X \| Stage: Y \| Challenge: Z \| Goal: W" |
| Created at | `created_at` | timestamp | On record creation |
| Updated at | `updated_at` | timestamp | On every update |

### 17.3 Data flow

```
Intake Form → API → strategy_projects table → Questionnaire page → AI Generation → Strategy Deck
```

The intake data flows through the entire strategy pipeline. It is referenced during:
- Questionnaire step (contextualizes questions)
- AI generation (seeds the strategy prompt)
- Strategy deck output (appears in executive summary and framing)
- PDF export (business name in header)

---

## 18. Backend / System Behavior

### 18.1 Draft management API

`Observed from code`

**GET /api/strategy/draft**
- Authenticated endpoint
- Returns the most recent `status='draft'` project for the current user
- Used on page load to check for resumable drafts

**POST /api/strategy/draft**
- Authenticated endpoint
- Accepts partial form data (snake_case fields)
- If a draft exists: updates it
- If no draft exists: creates one with `status='draft'`
- Validates field values against allowed lists server-side

**POST /api/strategy/start**
- Authenticated endpoint
- Accepts either `{ draft_id }` to transition existing draft, or full form payload for direct creation
- Validates all required fields are present
- Sets `status='in_progress'`
- Returns `{ strategy_id }` for client navigation

### 18.2 Persistence strategy

The page uses a **three-tier persistence model:**

1. **React state** — immediate, in-memory, lost on page close
2. **localStorage** — debounced writes (1.5s), survives refresh/crash, cleared on successful server save
3. **Supabase (server)** — authoritative record, draft saved via API, survives device/browser changes

Load priority on mount: Server draft > localStorage draft > empty form.

### 18.3 Credit consumption

`Inferred from product model`

The intake page itself does not consume a strategy credit. A credit is likely consumed when the AI strategy generation is triggered (at the `/strategy/{id}/generating` step). The intake page should not decrement credits.

---

## 19. Error Handling

| Error Scenario | Behavior |
|----------------|----------|
| User not authenticated | Middleware redirects to login (never reaches page) |
| User lacks entitlement | AccessGate shows paywall screen |
| Draft load fails (network) | Falls back to localStorage; if both fail, shows empty form |
| Validation fails on submit | All field errors shown, form data preserved, button re-enabled |
| API submission fails (network) | Red error banner: "Failed to start strategy. Please try again." Form data preserved. |
| API submission fails (server error) | Red error banner with server error message. Form data preserved. |
| API returns unexpected response | Generic error: "An unexpected error occurred. Please try again." |
| localStorage unavailable | Silent failure — autosave simply does not persist. No user-visible error. |
| Session expires during form fill | Next API call returns 401. Error shown. User must re-authenticate. |

**Missing error handling (product gap):**
- `Inferred requirement` No explicit handling for the scenario where a user's credits are exhausted before they complete the questionnaire
- `Inferred requirement` No explicit "session about to expire" warning

---

## 20. Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| User has multiple draft projects | System loads the most recent one (ordered by `updated_at` desc) |
| User starts intake, leaves, returns days later | Draft should still be loadable from server or localStorage |
| User submits on slow connection | Loading state persists; no timeout visible in current implementation |
| User double-clicks the CTA | `isCreating` flag prevents duplicate submission |
| User pastes a 200-character business name | Hard `maxLength=100` on input prevents overpaste |
| User types challenge < 10 chars and submits | Validation error shown: "Please write at least 10 characters" |
| Industry set to "Other", user clears custom field, submits | Validation error on `customIndustry` |
| Industry changed from "Other" to a listed option | `customIndustry` field hidden, value cleared |
| User fills form then loses internet | localStorage has last autosave; form data preserved in React state; submission will fail with recoverable error |
| Two browser tabs open on same page | Both read the same draft; last-write-wins on save; potential for minor conflicts |
| User on Professional plan with 0 credits remaining | Intake page still loads (AccessGate checks entitlement, not credits). Credit check presumably happens later in the flow. |

---

## 21. Analytics / Tracking Recommendations

`Inferred requirement — no analytics instrumentation observed in current code`

The following events would provide actionable product intelligence:

| Event | Properties | Purpose |
|-------|------------|---------|
| `strategy_intake_viewed` | user_id, has_draft, draft_source | Measure top-of-funnel reach |
| `strategy_intake_field_started` | field_name | Identify which fields cause hesitation |
| `strategy_intake_field_completed` | field_name, time_spent | Identify friction points |
| `strategy_intake_draft_resumed` | source (server/local), draft_age | Measure return behavior |
| `strategy_intake_validation_error` | field_name, error_type | Identify validation friction |
| `strategy_intake_submitted` | industry, business_stage, goal, time_to_complete | Measure conversion and user segmentation |
| `strategy_intake_submit_failed` | error_type | Monitor reliability |
| `strategy_intake_abandoned` | last_field_completed, time_on_page | Identify drop-off points |
| `strategy_intake_paywall_shown` | — | Measure gating impact |
| `strategy_intake_paywall_cta_clicked` | cta_type (pricing/dashboard) | Measure upgrade intent |

---

## 22. Success Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Intake completion rate** | % of page visitors who submit the form | > 70% (since users are already authenticated and subscribed) |
| **Time to completion** | Median time from page load to submission | < 3 minutes |
| **Draft resume rate** | % of returning users who complete a previously started draft | > 50% |
| **Field drop-off rate** | % of users who start but abandon at each field | < 10% per field |
| **Validation error rate** | % of submissions that trigger validation errors | < 20% |
| **Submission success rate** | % of form submissions that result in a created strategy project | > 99% |
| **Downstream completion** | % of intake submissions that proceed through full questionnaire | Track as funnel metric |

---

## 23. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| Supabase Auth | Infrastructure | User authentication and session management |
| Supabase Database | Infrastructure | `strategy_projects` table for persistence |
| AccessGate + `/api/user/access` | Internal service | Entitlement checking |
| Subscription/payment system | Internal service | Determines whether user has `strategy_builder` entitlement |
| Strategy questionnaire page | Downstream feature | `/strategy/{id}/questionnaire` must exist and accept the created project |
| AI strategy generation | Downstream feature | Intake data feeds into AI prompt construction |
| Next.js routing | Framework | Dashboard layout, middleware auth, route handling |

---

## 24. Assumptions

### Confirmed by observation
- The page is part of an existing, functional authenticated product
- The dashboard shell (top nav + sidebar) is shared across all authenticated pages
- Supabase is the auth and database provider
- The strategy flow has at least 5 screens (new, questionnaire, generating, result, review)
- The Strategy Builder requires a Professional plan or higher (or standalone purchase)
- Strategy credits exist as a concept and are associated with plans

### Inferred (not directly confirmed by UI)
- The 39 questions mentioned in the hero copy are actually implemented in the questionnaire
- The AI generation produces exactly 15 sections as promised
- Credit consumption happens at generation time, not at intake
- The `description` field in `strategy_projects` is used downstream and not just for display
- Only one active draft per user is supported at a time
- The questionnaire page reads the intake data from the same `strategy_projects` row
- PDF export is available from the result/review screens

---

## 25. Open Questions

| # | Question | Impact | Suggested Resolution |
|---|----------|--------|---------------------|
| 1 | What happens if a user with 0 remaining credits reaches the end of the questionnaire? | Could waste user's time on a 39-question form with no payoff | Add credit check at intake or at questionnaire start, with clear messaging |
| 2 | Should the intake support saving to server before final submission? | Currently, the "Save Draft" API exists but the page only auto-saves to localStorage | Consider adding an explicit "Save & Continue Later" button |
| 3 | Is the `description` field format (pipe-delimited) consumed by the AI, or is it just for admin display? | Affects whether format changes would break downstream | Audit AI prompt construction to confirm |
| 4 | Should users be able to edit intake data after starting the questionnaire? | Users may realize they entered incorrect info mid-flow | Define whether `/strategy/{id}` allows editing intake fields |
| 5 | What is the maximum number of strategy projects a user can have? | Affects draft management and UI for listing strategies | Define limit or add archiving/deletion |
| 6 | Are the industry and goal lists used to branch AI behavior, or are they metadata only? | Affects how carefully these lists need to be maintained | Confirm with AI prompt engineering team |
| 7 | Should the page show a progress indicator for the overall strategy flow? | Would set expectations for the 39-question journey ahead | Consider a step indicator: "Step 1 of 8" (intake + 7 sections) |
| 8 | What analytics are currently instrumented on this page? | Need to know baseline before adding recommendations | Audit current analytics setup |
| 9 | How should the page behave for Agency plan users creating strategies for clients? | May need a "client name" field or project labeling | Define agency workflow requirements |
| 10 | Is there a maximum draft age after which drafts should expire? | Stale drafts with outdated business context may produce poor strategies | Define TTL or add a "Start fresh" option alongside resume |

---

## 26. Recommended Next-Step Scope

Based on this analysis, the following work streams would improve the feature:

1. **Server-side draft autosave** — Currently, server drafts are only created on explicit submission. Adding debounced server-side autosave (via the existing `/api/strategy/draft` POST) would prevent data loss across devices.

2. **Credit awareness** — Display the user's remaining strategy credits on the intake page. Prevent starting a strategy if credits are exhausted, with a clear upgrade path.

3. **Progress indicator** — Add a subtle progress bar or step indicator showing where the intake sits in the overall strategy flow (Step 1 of 8).

4. **Analytics instrumentation** — Implement the tracking events from Section 21 to measure funnel performance and identify optimization opportunities.

5. **Explicit "Save & Continue Later" action** — Add a secondary CTA that saves the draft to the server and confirms with the user, for those who want to return later.

6. **Agency workflow adaptation** — For Agency plan users, consider adding a "Client/Project Name" field or a way to label whose strategy this is.

7. **Intake editability** — Allow users to return to the intake and edit their answers from the questionnaire or result pages without losing questionnaire progress.

---

## What Is Clearly Defined by the Current UI

- The page route (`/strategy/new`) and its position within the dashboard shell
- The exact navigation structure (top nav and sidebar links with labels)
- The active state behavior for "Strategy Builder" in both nav elements
- The hero section copy: pill label, heading, and supporting paragraph with specific numbers
- The form card structure: title, subtitle, five fields with exact labels and types
- The industry list (14 curated options + "Other" with conditional input)
- The business stage options (3 stages with labels, descriptions, and values)
- The goal list (8 options, no "Other")
- The right-side value panel: title, 6 benefit items with icons and descriptions, 3 trust items
- The CTA label ("Start Strategy Builder") and its enabled/disabled/loading visual states
- The entitlement gating model (Professional plan required)
- The field validation approach (blur + submit) and specific error messages
- The draft persistence model (localStorage autosave + server draft loading)
- The downstream navigation target (`/strategy/{id}/questionnaire`)
- The visual system: Oswald headings, Inter body, coral accent, navy primary, teal trust/icons

---

## What Still Needs Product Clarification

- Whether the 39 questions / 7 sections / 15-section deck numbers are accurate to the current implementation
- The credit consumption model — when exactly a credit is deducted and what happens at 0
- Whether server-side draft autosave should be implemented (currently only localStorage)
- Multi-device draft sync behavior and conflict resolution
- The intended behavior for Agency users creating strategies on behalf of clients
- Whether intake data can be edited after the questionnaire has begun
- Maximum number of strategy projects per user and lifecycle management (archiving, deletion)
- Whether the industry and goal selections directly influence AI output or serve as metadata
- The expected behavior when a user's subscription expires mid-strategy (mid-questionnaire or mid-generation)
- Accessibility audit status — whether the current implementation meets WCAG 2.1 AA
- Analytics requirements and current instrumentation baseline
- Mobile-specific UX considerations beyond responsive layout (e.g., mobile keyboard behavior for textarea fields)
