"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileDown,
  Presentation,
  Share2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Megaphone,
  PenTool,
  Globe,
  Mail,
  Search,
  DollarSign,
  LineChart,
  Lightbulb,
  Route,
  Shield,
  Rocket,
  Copy,
  Check,
} from "lucide-react";

interface StrategySection {
  id: string;
  title: string;
  icon: typeof Target;
  qualityScore: number;
  content: string;
}

const SECTIONS: StrategySection[] = [
  {
    id: "exec-summary",
    title: "Executive Summary",
    icon: Sparkles,
    qualityScore: 96,
    content: `## Executive Summary

Your business sits at a compelling intersection of AI technology and marketing strategy, addressing a genuine gap in the market: the need for affordable, professional-grade brand strategy for growth-stage SMEs.

### Key Findings

- **Market Opportunity**: The AI marketing tools market is projected to reach $107.5B by 2028, with SME adoption accelerating rapidly.
- **Competitive Advantage**: Your unique combination of strategy + templates + AI in a single platform differentiates you from both traditional agencies and point solutions like Canva or HubSpot.
- **Growth Potential**: With a current base of 4,200+ strategies generated and 92% satisfaction, the foundation for rapid scaling is strong.

### Strategic Priorities (Next 90 Days)

1. **Increase freemium-to-paid conversion** from 3% to 8% through improved onboarding and value demonstration
2. **Double organic traffic** through targeted content marketing and SEO optimisation
3. **Launch referral programme** to leverage high satisfaction scores for word-of-mouth growth
4. **Establish thought leadership** on LinkedIn to build brand authority in the AI strategy space

### Projected Impact

| Metric | Current | 90-Day Target |
|--------|---------|---------------|
| Monthly Signups | 200 | 500 |
| Paid Conversion | 3% | 8% |
| MRR | $45K | $120K |
| NPS | 72 | 78 |`,
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    icon: BarChart3,
    qualityScore: 93,
    content: `## Market Analysis

### Industry Overview

The AI-powered marketing technology sector is experiencing unprecedented growth. SMEs are increasingly seeking alternatives to expensive agency retainers, creating a significant opportunity for AI-driven strategy platforms.

### Market Size & Growth

- **Total Addressable Market (TAM)**: $107.5B globally by 2028
- **Serviceable Addressable Market (SAM)**: $12.3B (SME segment)
- **Serviceable Obtainable Market (SOM)**: $180M (English-speaking markets, current product scope)

### Key Market Trends

1. **AI Democratisation**: Tools previously available only to enterprises are becoming accessible to SMEs
2. **DIY Brand Building**: Founders increasingly want to understand and own their strategy, not just outsource it
3. **Platform Consolidation**: Businesses prefer integrated platforms over point solutions
4. **Outcome-Based Pricing**: Shift from hourly/retainer models to value-based and subscription pricing

### Market Gaps Identified

- No existing platform combines AI strategy generation with executable templates
- Most AI marketing tools focus on content creation, not strategic planning
- Agencies provide strategy but at 10-50x the cost with longer timelines`,
  },
  {
    id: "target-audience",
    title: "Target Audience Profiles",
    icon: Users,
    qualityScore: 94,
    content: `## Target Audience Profiles

### Primary Persona: "Strategic Sarah"

- **Role**: Marketing Manager or Head of Marketing at a growth-stage SME
- **Age**: 30-40
- **Company Size**: 15-100 employees, $1M-$10M revenue
- **Pain Points**: Expected to deliver agency-quality strategy on a fraction of the budget; lacks time for deep strategic work
- **Motivation**: Wants to prove marketing ROI to leadership and build a scalable marketing function
- **Channels**: LinkedIn, marketing podcasts, industry newsletters

### Secondary Persona: "Founder Frank"

- **Role**: CEO/Founder of an early-stage startup
- **Age**: 28-45
- **Company Size**: 2-15 employees, pre-revenue to $1M
- **Pain Points**: Wearing too many hats; knows marketing matters but doesn't know where to start
- **Motivation**: Wants a clear, actionable marketing plan without the learning curve
- **Channels**: Twitter/X, startup communities, Product Hunt

### Buying Triggers

- Just raised funding and need to scale marketing
- Hired first marketing person who needs a strategic framework
- Existing marketing efforts aren't generating sufficient ROI
- Preparing for a major product launch or market expansion`,
  },
  {
    id: "competitive-position",
    title: "Competitive Positioning",
    icon: Target,
    qualityScore: 91,
    content: `## Competitive Positioning

### Positioning Statement

For growth-stage SMEs who need professional brand strategy but can't afford traditional agencies, our platform is the only AI-powered strategy builder that combines deep strategic frameworks with executable marketing templates, delivering in hours what agencies take weeks to produce.

### Competitive Matrix

| Feature | You | Canva | HubSpot | Agencies |
|---------|-----|-------|---------|----------|
| AI Strategy Generation | Yes | No | Limited | No |
| Marketing Templates | 41+ | Design only | Limited | Custom |
| Brand Strategy | Deep | Surface | Module | Deep |
| Price Point | $49-199/mo | $13-30/mo | $800+/mo | $5K-50K/mo |
| Time to Value | Hours | Minutes | Weeks | Months |
| Personalisation | AI-driven | Generic | Configurable | High |

### Key Differentiators

1. **Speed**: 24-hour strategy vs. 6-8 week agency engagement
2. **Depth**: 15-section strategic framework, not just tactical templates
3. **Affordability**: 95% cheaper than equivalent agency work
4. **Actionability**: Every strategic recommendation links to an executable template`,
  },
  {
    id: "brand-strategy",
    title: "Brand Strategy",
    icon: PenTool,
    qualityScore: 97,
    content: `## Brand Strategy

### Brand Essence

**"Clarity Over Noise"** — In a world of marketing complexity, you provide the signal through the static.

### Brand Architecture

- **Brand Promise**: Professional strategy made accessible
- **Brand Personality**: Bold, Clear, Empowering
- **Brand Voice**: Confident but not arrogant; expert but not condescending; ambitious but grounded

### Visual Identity Recommendations

- Maintain the Navy/Coral/Teal palette — it conveys professionalism (navy) with energy (coral) and trust (teal)
- Ensure consistent application across all touchpoints
- Develop a micro-animation language for the AI generation experience

### Messaging Framework

| Audience | Key Message | Supporting Point |
|----------|-------------|-----------------|
| Founders | "Your marketing strategy, not an agency's" | Full ownership and understanding of your strategy |
| Marketers | "From strategy to execution in one platform" | No more translating strategy decks into action |
| Investors | "AI-powered GTM infrastructure for SMEs" | Scalable, data-driven, measurable |`,
  },
  {
    id: "value-prop",
    title: "Value Proposition Framework",
    icon: Lightbulb,
    qualityScore: 92,
    content: `## Value Proposition Framework

### Core Value Proposition

**Professional brand strategy in 24 hours, not 24 weeks.**

### Value Proposition Canvas

**Customer Jobs:**
- Build a coherent marketing strategy
- Execute marketing activities consistently
- Prove marketing ROI to stakeholders
- Scale marketing as the company grows

**Pains:**
- Can't afford agency fees ($5K-50K/month)
- Don't have time for deep strategic work
- Past marketing efforts lacked strategic foundation
- Inconsistent brand presence across channels

**Gains:**
- Confidence in marketing direction
- Clear, actionable next steps
- Professional-grade deliverables
- Measurable results framework

### Pricing Value Alignment

| Tier | Price | Value Delivered | Target |
|------|-------|----------------|--------|
| Starter | $49/mo | Strategy builder + 10 templates | Solo founders |
| Professional | $99/mo | Full platform + AI suggestions | Growing teams |
| Business | $199/mo | Team access + priority generation | Scaling companies |`,
  },
  {
    id: "content-strategy",
    title: "Content Strategy",
    icon: Megaphone,
    qualityScore: 95,
    content: `## Content Strategy

### Content Pillars

1. **Education**: Teach SMEs how to think strategically about marketing
2. **Inspiration**: Share success stories and transformation narratives
3. **Tools & Frameworks**: Provide actionable templates and frameworks
4. **Industry Insights**: AI and marketing trend analysis

### Content Calendar (Weekly Cadence)

| Day | Content Type | Channel | Topic Focus |
|-----|-------------|---------|-------------|
| Monday | Blog Post | Website/SEO | Educational deep-dive |
| Tuesday | LinkedIn Post | LinkedIn | Quick strategy tip |
| Wednesday | Email Newsletter | Email | Curated insights + template spotlight |
| Thursday | LinkedIn Post | LinkedIn | Case study or data point |
| Friday | Video/Carousel | LinkedIn + Twitter | Framework breakdown |

### SEO Content Strategy

- Target 50 long-tail keywords related to "marketing strategy for small business"
- Create pillar pages for each of the 7 template categories
- Build topic clusters around core themes: brand strategy, growth marketing, marketing templates
- Target featured snippets with structured how-to content`,
  },
  {
    id: "channel-strategy",
    title: "Channel Strategy",
    icon: Globe,
    qualityScore: 90,
    content: `## Channel Strategy

### Channel Priority Matrix

| Channel | Priority | Investment | Expected ROI |
|---------|----------|------------|-------------|
| LinkedIn Organic | High | 10 hrs/week | 3-5x |
| Google Ads (Search) | High | $3,000/mo | 4-6x |
| SEO / Content | High | 15 hrs/week | 8-12x (6mo) |
| Email Marketing | High | 5 hrs/week | 10-15x |
| Twitter/X | Medium | 3 hrs/week | 2-3x |
| Product Hunt | Medium | Periodic | High burst |
| Facebook Ads | Low | Paused | Previously poor |
| Partnerships | Medium | 5 hrs/week | 5-8x |

### Channel-Specific Recommendations

**LinkedIn (Primary)**
- Post 5x/week with a mix of personal founder stories, data insights, and tactical tips
- Engage in 3-5 relevant groups daily
- Launch LinkedIn newsletter for direct subscriber access

**Google Ads**
- Focus on high-intent keywords: "marketing strategy template", "brand strategy generator", "AI marketing plan"
- Implement RLSA for retargeting website visitors
- A/B test landing pages monthly`,
  },
  {
    id: "email-strategy",
    title: "Email Marketing Plan",
    icon: Mail,
    qualityScore: 94,
    content: `## Email Marketing Plan

### Email Program Architecture

**1. Welcome Sequence (7 emails over 14 days)**
- Day 0: Welcome + quick win template
- Day 1: Platform tour + strategy builder intro
- Day 3: Educational content — "5 Signs Your Marketing Lacks Strategy"
- Day 5: Case study — customer transformation story
- Day 7: Feature spotlight — AI suggestions
- Day 10: Social proof + testimonials
- Day 14: Upgrade prompt with limited-time offer

**2. Weekly Newsletter**
- Curated marketing insights
- Template of the week spotlight
- Quick strategy tip
- Community highlights

**3. Behavioral Triggers**
- Started but didn't finish strategy → nudge sequence
- Completed strategy → template recommendations
- Inactive 14+ days → re-engagement sequence
- Approaching plan limits → upgrade prompt

### Key Metrics to Track

| Metric | Target |
|--------|--------|
| Open Rate | 35%+ |
| Click Rate | 5%+ |
| Welcome → Paid Conversion | 12% |
| Unsubscribe Rate | < 0.3% |`,
  },
  {
    id: "seo-strategy",
    title: "SEO & Search Strategy",
    icon: Search,
    qualityScore: 88,
    content: `## SEO & Search Strategy

### Current Assessment

Based on your inputs, there is significant opportunity to capture organic search traffic around marketing strategy and template-related keywords.

### Keyword Strategy

**High-Priority Keywords (Monthly Search Volume)**
- "marketing strategy template" — 8,100
- "brand strategy framework" — 3,600
- "marketing plan for small business" — 6,600
- "AI marketing tools" — 4,400
- "content calendar template" — 12,100

### Technical SEO Priorities

1. Ensure all template pages have unique meta descriptions
2. Implement structured data (FAQ, HowTo) on educational content
3. Optimise Core Web Vitals — target all "Good" scores
4. Build internal linking structure between templates and blog content
5. Create XML sitemap for all template and strategy pages

### Link Building Strategy

- Guest posts on marketing industry publications (2/month)
- Create shareable data studies and infographics
- Build template directory listings
- Partner with marketing educators for co-created content`,
  },
  {
    id: "budget-allocation",
    title: "Budget Allocation",
    icon: DollarSign,
    qualityScore: 93,
    content: `## Budget Allocation

### Recommended Monthly Budget: $8,500

Based on your stated budget range of $5,000-$10,000/month, here is the recommended allocation:

### Budget Breakdown

| Category | Monthly Budget | % of Total | Purpose |
|----------|---------------|-----------|---------|
| Google Ads | $3,000 | 35% | Lead generation |
| Content Creation | $2,000 | 24% | Blog, video, social assets |
| Tools & Software | $800 | 9% | Analytics, email, SEO tools |
| Freelance Support | $1,500 | 18% | Content writer, designer |
| Testing & Experiments | $700 | 8% | New channel tests |
| Community & Events | $500 | 6% | Sponsorships, meetups |

### Budget Phasing (90 Days)

**Month 1: Foundation** — Focus 60% on content creation and SEO foundation
**Month 2: Acceleration** — Shift to 50% paid acquisition as content gains traction
**Month 3: Optimisation** — Reallocate based on channel performance data

### Expected Returns

- **Month 1**: 50 new signups from paid, 30 from organic
- **Month 2**: 80 from paid, 60 from organic
- **Month 3**: 100 from paid, 100 from organic
- **Blended CAC Target**: $35-50`,
  },
  {
    id: "kpi-framework",
    title: "KPI Framework",
    icon: LineChart,
    qualityScore: 95,
    content: `## KPI Framework

### North Star Metric

**Monthly Active Strategies Created** — This metric captures both acquisition (new users) and engagement (users finding value).

### KPI Dashboard

| Category | KPI | Current | 30-Day | 60-Day | 90-Day |
|----------|-----|---------|--------|--------|--------|
| Acquisition | Monthly Signups | 200 | 280 | 380 | 500 |
| Conversion | Free → Paid | 3% | 5% | 6.5% | 8% |
| Revenue | MRR | $45K | $62K | $88K | $120K |
| Engagement | Strategy Completion Rate | 65% | 72% | 78% | 82% |
| Retention | Monthly Churn | 8% | 7% | 6% | 5% |
| Satisfaction | NPS | 72 | 74 | 76 | 78 |

### Reporting Cadence

- **Daily**: Signups, active users, revenue
- **Weekly**: Channel performance, conversion rates, engagement metrics
- **Monthly**: Full KPI review, budget optimisation, strategy adjustment
- **Quarterly**: Strategic review, goal setting, competitive analysis`,
  },
  {
    id: "growth-roadmap",
    title: "Growth Roadmap",
    icon: Route,
    qualityScore: 91,
    content: `## Growth Roadmap

### Phase 1: Foundation (Days 1-30)

- [ ] Launch SEO content programme (8 blog posts)
- [ ] Optimise Google Ads campaigns with new landing pages
- [ ] Implement welcome email sequence
- [ ] Set up analytics dashboard with all KPIs
- [ ] Begin LinkedIn content cadence (5x/week)
- [ ] Audit and improve onboarding flow for free users

### Phase 2: Acceleration (Days 31-60)

- [ ] Launch referral programme
- [ ] Publish first data study / original research
- [ ] Expand to 2 additional content distribution channels
- [ ] Implement behavioral email triggers
- [ ] A/B test pricing page
- [ ] Begin partnership outreach (5 potential partners)

### Phase 3: Optimisation (Days 61-90)

- [ ] Analyse channel performance and reallocate budget
- [ ] Launch customer success programme for paid users
- [ ] Create case studies from early adopters
- [ ] Implement advanced personalisation in onboarding
- [ ] Prepare Series A marketing materials
- [ ] Plan Phase 2 strategy (months 4-6)`,
  },
  {
    id: "risk-mitigation",
    title: "Risk Mitigation",
    icon: Shield,
    qualityScore: 89,
    content: `## Risk Mitigation

### Identified Risks & Mitigation Strategies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI quality inconsistency | Medium | High | Implement quality scoring and human review for low scores |
| Competitor launches similar AI tool | High | Medium | Accelerate feature development; deepen template library moat |
| Google Ads CPC increases | Medium | Medium | Diversify to organic channels; build email list aggressively |
| Team capacity constraints | High | High | Prioritise freelancer hiring; consider fractional CMO |
| Low paid conversion persists | Medium | High | Implement 5 conversion experiments per month |

### Contingency Plans

**If paid conversion stays below 5% after 45 days:**
- Conduct 10 user interviews to understand conversion blockers
- Test alternative pricing models (annual discount, lifetime deal)
- Implement in-app upgrade prompts at key value moments

**If organic growth is slower than projected:**
- Increase Google Ads budget by 30%
- Launch Product Hunt campaign for burst traffic
- Accelerate partnership programme

**If churn exceeds 10%:**
- Implement proactive churn prevention alerts
- Launch customer success check-in programme
- Survey churned users to identify root causes`,
  },
  {
    id: "action-plan",
    title: "90-Day Action Plan",
    icon: Rocket,
    qualityScore: 97,
    content: `## 90-Day Action Plan

### Week 1-2: Quick Wins
- [ ] Fix top 3 website conversion issues identified in audit
- [ ] Launch optimised Google Ads campaigns
- [ ] Set up full analytics tracking (events, goals, attribution)
- [ ] Begin daily LinkedIn posting
- [ ] Draft and schedule first 4 blog posts

### Week 3-4: Build Systems
- [ ] Implement email welcome sequence
- [ ] Create content production workflow
- [ ] Design and launch referral programme
- [ ] Produce first customer case study
- [ ] Set up weekly KPI reporting dashboard

### Week 5-8: Scale What Works
- [ ] Double down on top-performing content topics
- [ ] Expand Google Ads to new keyword groups
- [ ] Launch partnership pilot with 2 partners
- [ ] Publish original research / data study
- [ ] Begin A/B testing pricing and onboarding

### Week 9-12: Optimise & Plan
- [ ] Comprehensive channel performance review
- [ ] Reallocate budget to highest-ROI channels
- [ ] Create 3 additional case studies
- [ ] Prepare Phase 2 strategic plan
- [ ] Compile results for Series A marketing narrative

### Success Criteria

By Day 90, you should have:
- **500 monthly signups** (up from 200)
- **8% paid conversion** (up from 3%)
- **$120K MRR** (up from $45K)
- **A repeatable, scalable marketing engine** ready for the next phase of growth`,
  },
];

export default function StrategyResultPage() {
  const params = useParams();
  const strategyId = params.id as string;

  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSection = SECTIONS[activeSectionIdx];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-border p-4">
            <Link
              href="/strategy/new"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-base font-semibold text-navy">
              Your Strategy
            </h2>
            <p className="text-xs text-muted-foreground">
              15 sections generated
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const isActive = idx === activeSectionIdx;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-coral/10 font-medium text-coral"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {section.title}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      section.qualityScore >= 95
                        ? "bg-emerald-100 text-emerald-700"
                        : section.qualityScore >= 90
                          ? "bg-teal/10 text-teal"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {section.qualityScore}%
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
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  activeSection.qualityScore >= 95
                    ? "bg-emerald-100 text-emerald-700"
                    : activeSection.qualityScore >= 90
                      ? "bg-teal/10 text-teal"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                Quality: {activeSection.qualityScore}%
              </span>
              <span className="text-xs text-muted-foreground">
                Section {activeSectionIdx + 1} of {SECTIONS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : "Share"}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                <Presentation className="h-3.5 w-3.5" />
                PPTX
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-coral/30 px-3 py-1.5 text-xs font-medium text-coral transition-colors hover:bg-coral/5">
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
          <article className="prose prose-sm max-w-none prose-headings:font-[family-name:var(--font-space-grotesk)] prose-headings:text-navy prose-h2:text-2xl prose-h3:text-lg prose-p:text-foreground prose-strong:text-foreground prose-table:text-sm prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-li:text-foreground">
            {/* Simple markdown-like rendering */}
            {activeSection.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="mt-0 mb-4">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="mt-6 mb-2">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.startsWith("| ")) {
                // Skip table rendering in simple mode, show as pre
                return null;
              }
              if (line.startsWith("- [")) {
                const checked = line.startsWith("- [x]");
                const text = line.replace(/- \[.\] /, "");
                return (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mt-1 h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                );
              }
              if (line.startsWith("- **")) {
                const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                if (match) {
                  return (
                    <div key={i} className="flex items-start gap-2 py-0.5 pl-4">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                      <span className="text-sm">
                        <strong className="text-foreground">{match[1]}</strong>
                        {match[2] && (
                          <span className="text-muted-foreground">
                            : {match[2]}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                }
              }
              if (line.startsWith("- ")) {
                return (
                  <div key={i} className="flex items-start gap-2 py-0.5 pl-4">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
                    <span className="text-sm text-foreground">
                      {line.replace("- ", "")}
                    </span>
                  </div>
                );
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="font-semibold text-foreground">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (line.trim() === "") {
                return <div key={i} className="h-2" />;
              }
              // Bold text within line
              const parts = line.split(/(\*\*.+?\*\*)/g);
              return (
                <p key={i} className="text-sm leading-relaxed text-foreground">
                  {parts.map((part, j) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            })}
          </article>

          {/* Section navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() =>
                setActiveSectionIdx((prev) => Math.max(0, prev - 1))
              }
              disabled={activeSectionIdx === 0}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Section
            </button>
            <button
              onClick={() =>
                setActiveSectionIdx((prev) =>
                  Math.min(SECTIONS.length - 1, prev + 1)
                )
              }
              disabled={activeSectionIdx === SECTIONS.length - 1}
              className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next Section
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
