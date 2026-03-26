# PRD v2: Strategy Builder Intake Experience
## Founder-Ready Specification

**Product:** Advertising Unplugged
**Feature:** Strategy Builder — Intake Page (`/strategy/new`)
**Version:** 2.0 (answers open questions from v1 using verified codebase context)
**Date:** 2026-03-26
**Status:** Implemented, documenting for refinement

---

## 1. Scope Boundaries

### In scope
- The intake page at `/strategy/new`
- Form collection, validation, persistence, and submission
- Draft save/resume behavior
- Navigation to the questionnaire step
- Access gating and entitlement checks
- Value panel and trust content
- Responsive layout within the authenticated shell

### Out of scope
- The 39-question questionnaire (`/strategy/{id}/questionnaire`)
- AI strategy generation (`/strategy/{id}/generating`)
- Strategy result display and editing (`/strategy/{id}/result`, `/strategy/{id}/review`)
- PDF export
- Pricing page and checkout flow
- Credit consumption and balance management
- Admin/analytics dashboards
- White-label agency customization

### Scope decision rationale
This document covers only the intake entry point. The downstream strategy flow (questionnaire, generation, result) is a separate product surface with different requirements. Changes to the intake should not require changes downstream unless the data model changes.

---

## 2. User Stories

### US-1: First-time strategy creation
**As a** subscribed user visiting Strategy Builder for the first time,
**I want to** understand what the tool does and what I'll receive,
**So that** I feel confident investing time in the 39-question process.

**Acceptance criteria:**
- [ ] Hero section explains the process: 39 questions, 7 sections, 15-section strategy deck
- [ ] Value panel displays 6 benefits with descriptions
- [ ] Trust block shows 3 credibility statements
- [ ] All content is visible without scrolling on desktop (above the fold)

**Priority:** P0 — Critical

---

### US-2: Submit business intake
**As a** subscribed user,
**I want to** enter my business name, industry, stage, challenge, and goal,
**So that** the system can create a personalized strategy project and begin the questionnaire.

**Acceptance criteria:**
- [ ] All 5 fields are present with correct labels and input types
- [ ] Business Name: text input, required, 2–100 chars, placeholder "e.g., Acme Corp"
- [ ] Industry: select dropdown with 14 options + "Other" (reveals custom text input)
- [ ] Business Stage: radio-card selector with 3 options (Idea, MVP/Early, Revenue Generating)
- [ ] Main Challenge: textarea, required, min 10 chars, placeholder describes the prompt
- [ ] Goal: select dropdown with 8 options
- [ ] CTA button: "Start Strategy Builder" with arrow icon
- [ ] On valid submission: strategy project created in Supabase, user navigated to `/strategy/{id}/questionnaire`

**Priority:** P0 — Critical

---

### US-3: Field validation
**As a** user filling out the form,
**I want to** see clear errors when my input is incomplete or invalid,
**So that** I can fix issues before submitting.

**Acceptance criteria:**
- [ ] Validation triggers on field blur (after first interaction with that field)
- [ ] Validation triggers on all fields simultaneously on submit attempt
- [ ] Each field shows its specific error message below the input
- [ ] Error inputs have red borders (`border-red-400`)
- [ ] Business Stage radio cards show red borders when unselected + error state
- [ ] Error messages use `role="alert"` for accessibility
- [ ] Character counter shown for Business Name (`{n}/100`) and Main Challenge (`{n}/500`)
- [ ] Main Challenge counter turns amber when exceeding 500 (soft limit, not enforced)
- [ ] Form data is never lost due to validation failure

**Priority:** P0 — Critical

---

### US-4: Draft persistence and resume
**As a** user who started but didn't finish the intake,
**I want to** return later and find my answers still there,
**So that** I don't have to re-enter everything.

**Acceptance criteria:**
- [ ] Form autosaves to localStorage every 1.5 seconds after changes
- [ ] On page load, system checks for server-side draft (Supabase, `status='draft'`) first
- [ ] If server draft exists: prefill form, show "Resuming saved draft" indicator (teal)
- [ ] If no server draft but localStorage draft exists: prefill form, show "Resumed from local draft" indicator (green)
- [ ] If no draft: show empty form
- [ ] "Draft saved" indicator appears after autosave
- [ ] localStorage is cleared after successful server save or submission
- [ ] Draft loading shows a spinner until complete (no flash of empty form)

**Priority:** P1 — High

---

### US-5: Subscription gating
**As a** user without a Professional plan or Strategy Builder access,
**I want to** see a clear paywall explaining what I need,
**So that** I understand how to unlock the feature.

**Acceptance criteria:**
- [ ] AccessGate checks `strategy_builder` entitlement via `GET /api/user/access`
- [ ] While checking: centered teal spinner
- [ ] If no access: paywall screen with lock icon, "Professional Plan Required" heading
- [ ] Paywall has two CTAs: "View Plans & Pricing" (→ `/pricing`) and "Back to Dashboard" (→ `/dashboard`)
- [ ] If access granted: intake page renders normally

**Priority:** P0 — Critical

---

### US-6: Duplicate submission prevention
**As a** user who clicks the CTA,
**I want** the system to prevent accidental double submissions,
**So that** I don't create duplicate strategy projects.

**Acceptance criteria:**
- [ ] CTA button is disabled during submission
- [ ] Button shows spinner + "Creating..." during submission
- [ ] `handleStartStrategy` exits early if already creating
- [ ] On failure: button re-enabled, error shown, form data preserved

**Priority:** P0 — Critical

---

### US-7: Responsive layout
**As a** user on tablet or mobile,
**I want** the page to be usable on smaller screens,
**So that** I can start a strategy from any device.

**Acceptance criteria:**
- [ ] Desktop (lg+): sidebar + form + value panel in three-column layout
- [ ] Tablet: sidebar hidden, form and value panel stack vertically
- [ ] Mobile: single column, top nav collapses to hamburger, value panel below form
- [ ] All form fields remain usable at all breakpoints
- [ ] No horizontal scrolling at any viewport width

**Priority:** P1 — High

---

### US-8: Navigation active state
**As a** user on the Strategy Builder page,
**I want** the navigation to show where I am,
**So that** I have clear wayfinding within the product.

**Acceptance criteria:**
- [ ] Top nav: "Strategy Builder" shows `bg-white/15 text-white` active state
- [ ] Sidebar: "Strategy Builder" shows `bg-coral/10 text-coral` active state
- [ ] Active state triggers when pathname starts with `/strategy`
- [ ] No other nav items appear active simultaneously

**Priority:** P2 — Medium

---

## 3. Detailed Validation Rules

| Field | Required | Min | Max | Type | Error Message | Notes |
|-------|----------|-----|-----|------|---------------|-------|
| Business Name | Yes | 2 (trimmed) | 100 (hard) | text | "Business name is required." / "...at least 2 characters." / "...100 characters or fewer." | `maxLength` enforced on input element |
| Industry | Yes | — | — | select | "Please select an industry." | 14 options + "Other" |
| Custom Industry | Yes (when "Other") | 2 (trimmed) | — | text | "Please specify your industry (at least 2 characters)." | Only validated when visible |
| Business Stage | Yes | — | — | radio | "Please select a business stage." | 3 options, card-style |
| Main Challenge | Yes | 10 (trimmed) | 500 (soft) | textarea | "Main challenge is required." / "...at least 10 characters." | Counter turns amber past 500 |
| Goal | Yes | — | — | select | "Please select a goal." | 8 options, no "Other" |

### Validation timing
- **On blur:** Single field validated after user leaves it (only if field has been "touched")
- **On submit:** All fields validated simultaneously, all errors shown
- **On change (post-touch):** If a field was previously touched or submit was attempted, revalidation on every change

---

## 4. Option Sets (Confirmed from Codebase)

### Industries (14 + Other)
| Value | Display |
|-------|---------|
| `SaaS` | SaaS |
| `E-commerce` | E-commerce |
| `Agency` | Agency |
| `Coaching / Consulting` | Coaching / Consulting |
| `Healthcare` | Healthcare |
| `Education` | Education |
| `Real Estate` | Real Estate |
| `Hospitality` | Hospitality |
| `Consumer Goods` | Consumer Goods |
| `Finance` | Finance |
| `Nonprofit` | Nonprofit |
| `Creator / Personal Brand` | Creator / Personal Brand |
| `Local Service Business` | Local Service Business |
| `Other` | Other (reveals custom text input) |

### Goals (8, no "Other")
| Value |
|-------|
| Get more customers |
| Clarify brand positioning |
| Improve marketing strategy |
| Increase revenue |
| Launch a new offer |
| Enter a new market |
| Improve retention |
| Build a go-to-market plan |

### Business Stages (3)
| Value | Label | Description |
|-------|-------|-------------|
| `idea` | Idea Stage | You have a concept but haven't launched yet. Still validating the market or building your first version. |
| `mvp_early` | MVP / Early Stage | You've launched something and have early users or customers, but you're still finding product-market fit. |
| `revenue_generating` | Revenue Generating | You have paying customers and consistent revenue. Now focused on growth, retention, or scaling. |

---

## 5. Answers to v1 Open Questions

| # | Question (from v1) | Answer (verified from codebase) |
|---|-------------------|-------------------------------|
| 1 | What is the exact CTA label and behavior? | "Start Strategy Builder" with ArrowRight icon. On click: validate all → create/update strategy project in Supabase → navigate to `/strategy/{id}/questionnaire`. Loading state shows spinner + "Creating..." |
| 2 | Is this page saved automatically or only on explicit continue? | Both. localStorage autosaves every 1.5s. Server draft created/updated via `POST /api/strategy/draft`. Final submission via `POST /api/strategy/start`. |
| 3 | Does the user create one strategy at a time or multiple? | Multiple projects supported. The `strategy_projects` table holds many per user. Draft resume loads the most recent `status='draft'` project. |
| 4 | Are Industry and Goal fixed option sets? | Yes. Industry is a fixed 14-option dropdown + "Other" with custom text. Goal is a fixed 8-option dropdown with no "Other". |
| 5 | Is Main Challenge used for branching logic? | It is stored as free text and passed to the AI generation pipeline. No evidence of branching logic — it influences AI output quality, not flow structure. |
| 6 | Does the next step begin the 39-question flow immediately? | Yes. After submission, the user goes directly to `/strategy/{id}/questionnaire` which contains the 39-question flow. |
| 7 | Can users leave and resume later? | Yes. Server-side drafts persist across sessions. localStorage provides a fallback for in-session recovery. |
| 8 | Is there a progress indicator? | Not on the intake page. The questionnaire page may have its own progress tracking (out of scope for this PRD). |
| 9 | Are there different downstream paths by business stage? | No branching in the intake or routing. Business stage is passed as context to the AI, which adjusts the strategy content accordingly. |

---

## 6. Dependencies

| Dependency | Type | Owner | Status | Impact if Missing |
|------------|------|-------|--------|-------------------|
| Supabase Auth | Infrastructure | Platform | Active | Page inaccessible — middleware redirects to login |
| `strategy_projects` table | Database | Backend | Active | Cannot create or resume drafts |
| `GET /api/user/access` | API | Backend | Active | AccessGate cannot check entitlements — page shows spinner indefinitely |
| `POST /api/strategy/draft` | API | Backend | Active | Server-side draft save fails — localStorage fallback still works |
| `POST /api/strategy/start` | API | Backend | Active | Cannot submit form — user stuck on intake page |
| `/strategy/{id}/questionnaire` | Page | Frontend | Active | Submission succeeds but navigation leads to 404 |
| Stripe subscription system | External | Payments | Active | Users cannot obtain `strategy_builder` entitlement |
| Next.js middleware | Framework | Platform | Active | Auth enforcement breaks |

---

## 7. Priority Matrix

| Priority | Items |
|----------|-------|
| **P0 — Must have** | Form fields and validation, CTA submission, strategy project creation, navigation to questionnaire, access gating, duplicate prevention, error handling |
| **P1 — Should have** | Draft persistence (localStorage + server), draft resume with indicator, responsive layout, character counters |
| **P2 — Nice to have** | Active nav states, draft saved indicator auto-dismiss, amber warning on challenge length |
| **P3 — Future** | Server-side autosave (debounced API calls), credit balance display, progress indicator, analytics instrumentation, agency workflow adaptation |

---

## 8. Data Model

### Strategy project record (on submission)

```
strategy_projects
├── id              UUID (auto)
├── user_id         UUID (FK → auth.users)
├── title           text          ← business_name
├── description     text          ← "Industry: X | Stage: Y | Challenge: Z | Goal: W"
├── status          text          ← "in_progress" on submit, "draft" on draft save
├── business_name   text
├── industry        text
├── custom_industry text (nullable)
├── business_stage  text          ← "idea" | "mvp_early" | "revenue_generating"
├── main_challenge  text
├── primary_goal    text
├── created_at      timestamptz
└── updated_at      timestamptz
```

### Persistence tiers

```
Tier 1: React state       → immediate, in-memory, lost on tab close
Tier 2: localStorage      → debounced 1.5s, survives refresh, cleared on server save
Tier 3: Supabase          → authoritative, survives device changes, via API
```

### Load priority on mount
```
Server draft (Supabase, status='draft', most recent)
  → localStorage draft
    → empty form
```

---

## 9. API Contracts

### GET /api/strategy/draft
**Purpose:** Check for existing user draft on page load
**Auth:** Required (returns 401 if unauthenticated)
**Response:**
```json
{ "draft": { ...strategy_project_row } }   // or { "draft": null }
```

### POST /api/strategy/draft
**Purpose:** Create or update a draft
**Auth:** Required
**Body:** Any subset of `{ business_name, industry, custom_industry, business_stage, main_challenge, primary_goal }`
**Behavior:** If draft exists for user → update. If not → create with `status: 'draft'`.
**Response:**
```json
{ "draft": { ...strategy_project_row } }
```

### POST /api/strategy/start
**Purpose:** Finalize intake and transition to in_progress
**Auth:** Required
**Body:** Either `{ draft_id }` (transition existing) or full form payload (direct create)
**Validation:** All required fields must be present. Returns 422 with `missing_fields` if incomplete.
**Response:**
```json
{ "strategy_id": "uuid" }
```

---

## 10. Error Handling Matrix

| Scenario | Detection | User Experience | Data Safety |
|----------|-----------|-----------------|-------------|
| Not authenticated | Middleware | Redirect to `/login` | N/A |
| No subscription | AccessGate | Paywall with upgrade CTA | N/A |
| Validation failure | Client-side | Field-level red errors, form preserved | No data lost |
| Network error on submit | API catch | Red banner: error message, button re-enabled | React state + localStorage preserved |
| Server error (500) | API response | Red banner: "Failed to create/start strategy" | React state + localStorage preserved |
| Session expired during fill | Next API call returns 401 | Error shown, user must re-login | localStorage has latest autosave |
| localStorage unavailable | Try/catch | Silent — autosave skipped, no error shown | Server draft still works |
| Duplicate submit | `isCreating` flag | Button disabled, spinner shown | Only one project created |

---

## 11. Acceptance Test Checklist

### Happy path
- [ ] Authenticated user with Professional plan sees the intake page
- [ ] All 5 fields render with correct labels, types, and placeholders
- [ ] Filling all fields enables the CTA button (coral background)
- [ ] Clicking CTA creates a strategy project and navigates to questionnaire
- [ ] Strategy project record exists in Supabase with correct data

### Validation
- [ ] Submitting with empty Business Name shows "Business name is required."
- [ ] Business Name with 1 character shows min-length error on blur
- [ ] Submitting without Industry selection shows "Please select an industry."
- [ ] Selecting "Other" for Industry reveals custom input; leaving it empty shows error
- [ ] Submitting without Business Stage shows "Please select a business stage."
- [ ] Main Challenge with 5 characters shows min-length error
- [ ] Submitting without Goal shows "Please select a goal."
- [ ] All errors clear when the field is corrected

### Draft persistence
- [ ] Typing in any field triggers localStorage save within 2 seconds
- [ ] Refreshing the page restores form data from localStorage
- [ ] If a server draft exists, form is prefilled from server on page load
- [ ] "Resuming saved draft" indicator appears for server drafts
- [ ] "Resumed from local draft" indicator appears for localStorage drafts

### Access gating
- [ ] User without `strategy_builder` entitlement sees paywall
- [ ] Paywall shows "Professional Plan Required" with pricing CTA
- [ ] User with entitlement sees the full intake page

### Error handling
- [ ] Network failure on submit shows error banner, preserves form data
- [ ] Button returns to enabled state after error
- [ ] Clicking CTA again after error retries successfully

### Responsive
- [ ] Desktop: three-column layout (sidebar + form + value panel)
- [ ] Tablet: form and value panel stack, sidebar hidden
- [ ] Mobile: single column, hamburger nav, all content accessible

---

## 12. Recommended Next-Step Scope (Prioritized)

| # | Enhancement | Priority | Effort | Impact |
|---|------------|----------|--------|--------|
| 1 | Display remaining strategy credits on intake page | P1 | Small | Prevents user frustration at generation step |
| 2 | Server-side autosave (debounced POST to /api/strategy/draft) | P1 | Medium | Enables cross-device resume |
| 3 | "Save & Continue Later" explicit CTA | P2 | Small | Reduces anxiety about losing progress |
| 4 | Step indicator ("Step 1 of 8") | P2 | Small | Sets expectations for the full journey |
| 5 | Analytics instrumentation (view, field interaction, submit, abandon) | P2 | Medium | Enables data-driven optimization |
| 6 | Intake editability from questionnaire page | P3 | Medium | Lets users correct mistakes mid-flow |
| 7 | Agency client labeling (project name vs. business name) | P3 | Medium | Supports white-label use case |
| 8 | Draft expiration / "Start fresh" option | P3 | Small | Prevents stale drafts from degrading output |

---

## 13. What Is Clearly Defined

- Route, layout, and position within the authenticated product shell
- Exact navigation structure and active states
- Hero copy, value panel content, and trust statements
- All 5 form fields with types, labels, placeholders, options, and validation rules
- CTA label, states (enabled/disabled/loading), and submission behavior
- Draft persistence model (localStorage autosave + server draft resume)
- Access gating model (Professional plan, AccessGate component)
- Downstream navigation target (`/strategy/{id}/questionnaire`)
- API contracts for draft management and strategy start
- Data model and persistence strategy
- Error handling for all identified failure modes

---

## 14. What Still Needs Product Clarification

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | When exactly is a strategy credit consumed? | Users could complete the full questionnaire and then discover they have 0 credits |
| 2 | What happens if subscription expires mid-strategy? | User could lose access to in-progress work |
| 3 | Should there be a limit on concurrent strategy projects? | Unbounded project creation could lead to database bloat and confusion |
| 4 | Should intake data be editable after questionnaire begins? | Users may realize they entered wrong info at question 30 |
| 5 | Should Agency users see a different intake experience? | White-label use case may need client name, logo, or branding fields |
| 6 | What is the desired draft TTL? | A 6-month-old draft with "my biggest challenge is hiring" may no longer be relevant |
| 7 | Should the page show a "you have X credits remaining" indicator? | Manages expectations before committing to the flow |
| 8 | Is WCAG 2.1 AA compliance a formal requirement? | Affects testing scope and potential remediation work |
