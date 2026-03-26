# PRD: Strategy Builder Intake Experience

## 1. Feature Overview
The `Strategy Builder` intake page at `/strategy/new` appears to be the entry point into an AI-assisted business strategy workflow inside the authenticated Advertising Unplugged product. Its purpose is to collect foundational business inputs from the user, frame the value of the strategy process, and move the user into a more comprehensive guided strategy experience.

This page is not presented as a generic form. It is positioned as the start of a structured strategic process that transforms user answers into a multi-section strategy deliverable.

## 2. Product Context
**Observed from UI**
- The page exists inside an authenticated application shell.
- There is a top navigation bar with product-level destinations.
- There is a left dashboard sidebar with logged-in product areas.
- `Strategy Builder` is the active section in the sidebar.
- The page is part of a broader product ecosystem that includes Templates, Growth Challenge, Community, Settings, Billing, and Dashboard-related areas.

**Inferred from UI**
- This feature is one module in a larger membership or SaaS-style business platform.
- The page is likely intended for logged-in customers who are using strategic planning tools, not anonymous visitors.
- The screen is likely the first step in a larger multi-step strategy workflow.

## 3. Problem Statement
Users need a guided way to turn business context into a usable growth or brand strategy without hiring a traditional strategist or going through a slow consulting process.

This page appears to solve the problem of "getting started" with strategy creation by:
- reducing ambiguity around what the user needs to provide
- collecting structured business context early
- making the value of the resulting strategy explicit
- framing strategy generation as faster and more accessible than traditional consulting

## 4. Goal of the Page
The immediate goal of this page is to get the user to begin the strategy creation process by submitting foundational business information.

Secondary goals appear to be:
- reassure the user that the process is high value
- make the effort feel manageable
- increase confidence that the output will be personalized and actionable
- reduce drop-off at the start of the flow

## 5. Intended Users
**Inferred from UI**
Likely users include:
- founders
- small business owners
- consultants
- marketers
- operators building or refining a brand/growth strategy

Likely business maturity levels are explicitly represented in the UI:
- idea stage businesses
- MVP / early-stage businesses
- revenue-generating businesses

This suggests the product is designed for a fairly broad range of entrepreneurial users rather than a narrow enterprise persona.

## 6. What Is Explicitly Visible in the Current UI
- Page context is authenticated dashboard UI.
- Left sidebar items:
  - Dashboard
  - Templates
  - Strategy Builder
  - Growth Challenge
  - Community
  - Settings
  - Billing
  - Log out
- Top navigation items:
  - Templates
  - Strategy Builder
  - Growth Challenge
  - Community
  - Pricing
  - Dashboard
  - Log out
- Active area:
  - Strategy Builder
- Eyebrow/pill:
  - `AI Strategy Builder`
- Main title:
  - `Create Your Strategy`
- Supporting copy references:
  - 39 strategic questions
  - 7 sections
  - AI-generated 15-section strategy deck
  - replacing weeks of consulting work with a guided questionnaire
- Intake card title:
  - `Let's get started`
- Intake card subtitle:
  - `Tell us about your business to begin.`
- Visible fields:
  - Business Name
  - Industry
  - Business Stage
  - Main Challenge
  - Goal
- Visible business stage options:
  - Idea Stage
  - MVP / Early Stage
  - Revenue Generating
- Right-side panel title:
  - `What you get`
- Right-side benefit items:
  - AI-Powered Analysis
  - 15 Strategic Sections
  - Ready in Minutes
  - Data-Driven
  - Fully Editable
  - Actionable Next Steps
- Trust/proof content:
  - Built on 15+ years of strategy consulting experience
  - Powered by analysis of 1,000+ successful brand strategies
  - Used by entrepreneurs across 30+ countries

## 7. Inferred Product Intent
**Inferred from UI**
The product intent appears to be:
- capture enough business context to personalize a strategy-generation flow
- segment users by business maturity and goals
- create a sense of credibility before asking for deeper input
- position the feature as a premium but accessible substitute for consulting
- gather the first layer of data before moving the user into additional strategy questions

The reference to "39 strategic questions across 7 sections" strongly suggests that this page is not the full experience, but the beginning of a larger questionnaire or wizard.

## 8. Information Architecture
### Top Navigation
**Observed**
The top nav presents broader product destinations and account-level actions.

### Left Sidebar
**Observed**
The left sidebar presents logged-in workspace navigation. `Strategy Builder` is active, indicating the current page belongs to that product module.

### Main Content Area
**Observed**
The center of the page contains:
- introductory framing
- the core intake form

### Intake Form Card
**Observed**
A card-like section holds the structured form fields needed to begin.

### Right-Side Value Panel
**Observed**
A secondary panel reinforces benefits and trust signals during form completion.

**Inferred**
This panel is likely designed to reduce hesitation and increase completion by reminding users of the value they will receive.

## 9. Detailed UI Breakdown
### A. Product Shell
**Observed**
The page sits inside a stable product shell with both top and side navigation, suggesting this is part of a recurring user workflow rather than one-off onboarding.

### B. Introductory Header
**Observed**
The hero area uses:
- an eyebrow label to frame the feature as AI-powered
- a strong title
- explanatory copy focused on scale, structure, and outcome

**Purpose**
- orient the user
- communicate what this tool does
- reduce uncertainty before form completion

### C. Intake Card
**Observed**
The card begins with a friendly, lower-friction title: `Let's get started`.

**Purpose**
- lower the psychological barrier to starting
- make the form feel like the first step, not a heavy commitment
- collect the minimum viable business context needed to proceed

### D. Right-Side Value Panel
**Observed**
The panel summarizes what the user gets and why the system is trustworthy.

**Purpose**
- reinforce product value while the user is deciding whether to proceed
- clarify the breadth and usefulness of the output
- add authority through consulting and usage claims

## 10. Form/Input Specification
### Business Name
**Observed from UI**
- Label: `Business Name`
- Placeholder example appears to be similar to `e.g., Acme Corp`

**Likely purpose**
- identify the business the strategy is being created for
- personalize future outputs
- anchor the strategy to a specific company or project

**Business significance**
- helps contextualize strategy output
- may be used in generated documents or dashboards

### Industry
**Observed from UI**
- Label: `Industry`
- Appears to be a select/dropdown input

**Likely purpose**
- categorize the business context
- tailor strategic recommendations to the industry environment

**Business significance**
- may influence benchmarks, messaging approaches, and channel recommendations

### Business Stage
**Observed from UI**
- Label: `Business Stage`
- Visible options:
  - Idea Stage
  - MVP / Early Stage
  - Revenue Generating
- Each option includes supporting descriptive copy

**Likely purpose**
- identify maturity level
- shape the strategy according to current business stage

**Business significance**
- an idea-stage business likely needs validation and positioning
- an MVP business may need go-to-market refinement
- a revenue-generating business may need scaling, optimization, or retention strategy

### Main Challenge
**Observed from UI**
- Label: `Main Challenge`
- Appears to be a textarea
- Placeholder asks what the biggest challenge is right now

**Likely purpose**
- capture the primary pain point driving the strategy request
- identify the highest-priority strategic problem to solve

**Business significance**
- likely influences strategic prioritization and recommendations

### Goal
**Observed from UI**
- Label: `Goal`
- Appears to be a select/dropdown input

**Likely purpose**
- identify the user's primary desired outcome
- guide the system toward a directional objective

**Business significance**
- likely influences later questions and the weighting of recommendations

## 11. Likely Validation Requirements
**Inferred from UI**
The following validation rules are likely needed for a reliable experience:

- Business Name should be required
- Industry should be required
- Business Stage should require exactly one selection
- Main Challenge should be required and should encourage a meaningful answer rather than a blank or one-word entry
- Goal should be required

Additional likely validation expectations:
- whitespace-only answers should not count as valid
- Main Challenge likely benefits from a minimum character threshold
- Goal and Industry likely use controlled selections rather than free-form input
- the user likely should not advance without completing all required fields

## 12. User Flow
**Inferred from UI**
1. Logged-in user opens `Strategy Builder`
2. User lands on `/strategy/new`
3. User reads positioning copy explaining the value of the strategy process
4. User begins intake by entering business details
5. User selects industry and business stage
6. User describes the main challenge
7. User selects a primary goal
8. User submits or continues to the next step
9. The product likely transitions the user into the broader questionnaire referenced in the copy

This appears to be the beginning of a multi-step process, not the full strategy workflow.

## 13. Content Strategy
### Headline
**Observed**
`Create Your Strategy`

**Role**
- direct and outcome-oriented
- emphasizes ownership and action

### Supporting Copy
**Observed**
The copy references:
- 39 questions
- 7 sections
- 15-section output
- reduced consulting effort

**Role**
- frames the process as thorough but guided
- makes the value proposition concrete
- helps justify the user's effort

### Benefit Panel
**Observed**
Lists practical outputs and benefits.

**Role**
- translates the feature into outcomes the user can understand quickly
- reduces form abandonment by answering "what do I get?"

### Trust/Proof Statements
**Observed**
Consulting experience, number of strategies, and geographic breadth are highlighted.

**Role**
- increase credibility
- reduce skepticism about AI-generated strategy
- position the product as expert-backed rather than purely automated

## 14. Data Captured by This Step
**Observed + inferred**
This page captures foundational strategic context:
- business identity
- market/category context
- company maturity
- current pain point
- primary objective

This is likely the minimum dataset needed to:
- classify the business
- personalize later questions
- tune the strategy-generation process
- generate a more relevant final strategy deck

## 15. Likely System Behavior
**Inferred from UI**
The system likely:
- stores these answers as the opening section of a strategy record
- uses them to personalize later questions
- uses business stage and goal to shape the strategy path
- uses main challenge to prioritize certain recommendations
- associates this intake with the logged-in user
- allows the user to continue into the larger strategy workflow

It is also plausible that the system supports draft behavior so users can resume later, though that is not directly visible in the screenshot.

## 16. States the Experience Likely Needs
**Inferred from UI**
The feature likely needs the following states:

- initial empty state
  - first-time user sees blank form fields

- active completion state
  - user is filling out fields

- validation error state
  - required data missing or incomplete

- submit/loading state
  - user has initiated progression to the next step

- saved or resume state
  - prior answers are restored if the user returns later

- auth interruption state
  - if a logged-in session expires, the user may need to re-authenticate

- downstream continuation state
  - after this step is completed, the user moves deeper into the questionnaire

## 17. Edge Cases
**Inferred from UI**
Likely edge cases include:
- user leaves the form partially complete
- user refreshes before continuing
- user enters vague or extremely short challenge text
- user selects a business stage that does not align with the challenge entered
- user changes inputs after returning from a later step
- session expires mid-flow
- user has more than one strategy in progress
- user starts but never completes the strategy process
- goal and challenge are in tension, requiring later clarification

## 18. Success Metrics
**Inferred from product intent**
Relevant success measures likely include:
- percentage of users who start this intake after visiting the page
- completion rate of this first intake step
- progression rate to the next strategy section
- drop-off rate on this page
- time to complete initial intake
- quality/completeness of responses
- conversion from strategy start to completed strategy deck
- user satisfaction with strategy relevance downstream

## 19. Assumptions
- This page is the first step in a broader multi-step strategy workflow.
- There is a primary CTA below the fold that advances the user.
- The strategy process is personalized based on the entered information.
- The collected data is saved to the user's account.
- The system may support draft/resume behavior even though it is not visible here.
- The 39-question / 7-section process happens after or beyond this first intake card.

## 20. Open Questions
- What is the exact CTA label and behavior on submission?
- Is this page saved automatically or only on explicit continue?
- Does the user create one strategy at a time or multiple strategies?
- Are Industry and Goal fixed option sets, searchable lists, or hybrid fields?
- Is the Main Challenge field purely descriptive, or used to drive branching logic?
- Does the next step begin the 39-question flow immediately?
- Can users leave and resume later?
- Is there a progress indicator elsewhere in the flow?
- Are there different downstream paths by business stage?

## 21. What Is Clearly Defined by the Current UI
- The page is part of an authenticated product dashboard.
- It belongs to the `Strategy Builder` section.
- It is the start of a strategy-creation process.
- The experience is framed as AI-powered and strategically guided.
- The product promises a 15-section strategy deck.
- The process references 39 questions across 7 sections.
- The first step collects business identity, industry, stage, challenge, and goal.
- The UI actively uses trust and benefit messaging to support completion.

## 22. What Still Needs Product Clarification
- Exact submission mechanics and next-step flow
- save/draft/resume behavior
- detailed option sets for Industry and Goal
- branching logic after this step
- whether this is onboarding, reusable per project, or a one-time setup flow
- whether there are different experiences for different user segments
- how much of the strategy output is editable, regenerable, or modular
