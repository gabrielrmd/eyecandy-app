import {
  ArrowRight,
  Check,
  Star,
  Users,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Brain,
  FileText,
  BarChart3,
  Palette,
  Handshake,
  Mail,
  ShoppingCart,
  MessageSquare,
  Award,
  Globe,
  ChevronRight,
  Play,
  Shield,
  CalendarDays,
  Sparkles,
  BookOpen,
  RefreshCw,
  Share2,
  Map,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const templateIcons: Record<string, React.ReactNode> = {
  content: <FileText className="w-7 h-7" />,
  social: <MessageSquare className="w-7 h-7" />,
  email: <Mail className="w-7 h-7" />,
  conversion: <ShoppingCart className="w-7 h-7" />,
  analytics: <BarChart3 className="w-7 h-7" />,
  brand: <Palette className="w-7 h-7" />,
  partnership: <Handshake className="w-7 h-7" />,
};

const templateCategories = [
  {
    id: "content",
    name: "Content Planning",
    count: 8,
    description:
      "Strategic content calendars, blog outlines, and planning frameworks",
  },
  {
    id: "social",
    name: "Social Media",
    count: 7,
    description:
      "Platform strategies, content kits, and engagement templates",
  },
  {
    id: "email",
    name: "Email Marketing",
    count: 6,
    description:
      "Nurture sequences, welcome series, and automation templates",
  },
  {
    id: "conversion",
    name: "Conversion & Sales",
    count: 7,
    description: "Sales pages, landing pages, and checkout optimization",
  },
  {
    id: "analytics",
    name: "Analytics & Reporting",
    count: 5,
    description:
      "Dashboard templates, KPI tracking, and performance reports",
  },
  {
    id: "brand",
    name: "Brand & Design",
    count: 4,
    description:
      "Brand guidelines, visual standards, and identity systems",
  },
  {
    id: "partnership",
    name: "Partnership & Growth",
    count: 4,
    description:
      "Partnership proposals, collaboration frameworks, and JV templates",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ===== HERO ===== */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[#1e2538] to-[#141824] text-white"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[var(--coral)] opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full bg-[var(--teal)] opacity-[0.08] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36 lg:py-44 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-[var(--teal)] backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Brand Strategy
            </p>
            <h1 className="font-[family-name:var(--font-oswald)] text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Professional Brand Strategy,{" "}
              <span className="bg-gradient-to-r from-[var(--coral)] to-[var(--coral-hover)] bg-clip-text text-transparent">
                Powered by AI.
              </span>{" "}
              Delivered in 24&nbsp;Hours.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Stop struggling with generic marketing advice. Get a personalized,
              data-driven strategy tailored to your business with AI-powered
              insights and our proven 41-template toolkit.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--coral)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--coral)]/25 transition-all hover:bg-[var(--coral-hover)] hover:shadow-xl hover:shadow-[var(--coral)]/30 hover:-translate-y-0.5"
              >
                Start Free Assessment
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/5"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </a>
            </div>

            {/* Trust Signals */}
            <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>
                  <strong className="text-white">4.9&#9733;</strong> From 200+
                  reviews
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Users className="w-4 h-4 text-[var(--teal)]" />
                <span>
                  <strong className="text-white">2,400+</strong> Strategies
                  generated
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-4 h-4 text-[var(--coral)]" />
                <span>
                  <strong className="text-white">24 hrs</strong> Average
                  delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEMS ===== */}
      <section id="problems" className="bg-off-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              The Marketing Clarity Gap
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Most entrepreneurs face three critical gaps in their marketing
              approach
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Problem 1 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[var(--coral)]/30 hover:-translate-y-1">
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[var(--coral)]/10 p-3 text-[var(--coral)]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Education Without Execution
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                You know the theory&mdash;content marketing, SEO, social
                media&mdash;but struggle to apply it consistently to YOUR
                business.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[var(--teal)]/30 hover:-translate-y-1">
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[var(--teal)]/10 p-3 text-[var(--teal)]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Strategy Without Personalization
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Generic frameworks don&rsquo;t address your unique market
                position, budget constraints, or growth stage.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[var(--navy)]/20 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-[var(--navy)]/10 p-3 text-[var(--navy)]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Community Without Credibility
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Marketing communities abound, but backing your decisions with
                proven strategies and peer accountability is rare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              From Strategy to Execution in 3&nbsp;Steps
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A proven framework that delivers results
            </p>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {/* Step 1 */}
            <div className="relative text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--coral)] to-[var(--coral-hover)] text-white shadow-lg shadow-[var(--coral)]/20 lg:mx-0">
                <span className="font-[family-name:var(--font-oswald)] text-xl font-bold">
                  01
                </span>
              </div>
              {/* Connector line (desktop only) */}
              <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-[var(--coral)]/40 to-[var(--teal)]/40 lg:block" />
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Answer, We&rsquo;ll Build
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Complete our 39-question AI Strategy Builder&mdash;designed by
                marketing experts to extract your unique positioning, audience
                insights, and growth goals.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--coral)]">
                <Clock className="w-4 h-4" />
                15-20 minutes
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--teal)] to-[var(--teal-hover)] text-white shadow-lg shadow-[var(--teal)]/20 lg:mx-0">
                <span className="font-[family-name:var(--font-oswald)] text-xl font-bold">
                  02
                </span>
              </div>
              <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-[var(--teal)]/40 to-[var(--navy)]/40 lg:block" />
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                AI Generates Instantly
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Our AI engine synthesizes your answers into a comprehensive
                15-section strategy deck covering positioning, messaging,
                channel mix, content pillars, and 90-day roadmap.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--teal)]">
                <Zap className="w-4 h-4" />
                Real-time
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[#232842] text-white shadow-lg shadow-[var(--navy)]/20 lg:mx-0">
                <span className="font-[family-name:var(--font-oswald)] text-xl font-bold">
                  03
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Execute &amp; Refine
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Use our 41 interactive templates to operationalize your
                strategy. Track progress, refine tactics, and measure
                what&rsquo;s working with built-in analytics.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
                <BarChart3 className="w-4 h-4" />
                Ongoing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI STRATEGY BUILDER ===== */}
      <section
        id="strategy-builder"
        className="bg-off-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Text content */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--teal)]">
                Core Feature
              </p>
              <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
                The AI Strategy Builder
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Your personalized marketing strategy, powered by artificial
                intelligence and grounded in 15+ years of strategic marketing
                experience.
              </p>

              <ul className="mt-10 space-y-5">
                {[
                  {
                    icon: <Brain className="w-5 h-5" />,
                    text: "39 Expert Questions covering positioning, audience, competition, and goals",
                  },
                  {
                    icon: <FileText className="w-5 h-5" />,
                    text: "15-Section Strategy Deck with actionable frameworks and tactics",
                  },
                  {
                    icon: <Sparkles className="w-5 h-5" />,
                    text: "AI-Powered Suggestions refine your answers in real-time",
                  },
                  {
                    icon: <Share2 className="w-5 h-5" />,
                    text: "Export & Share your strategy as PDF, PPTX, or web link",
                  },
                  {
                    icon: <Map className="w-5 h-5" />,
                    text: "90-Day Roadmap with weekly milestones and KPIs",
                  },
                  {
                    icon: <RefreshCw className="w-5 h-5" />,
                    text: "Live Updates iterate and regenerate as your business evolves",
                  },
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)]">
                      {feature.icon}
                    </span>
                    <span className="text-gray-700 leading-relaxed">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <a
                  href="#pricing"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[var(--coral)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--coral)]/20 transition-all hover:bg-[var(--coral-hover)] hover:-translate-y-0.5"
                >
                  Try the Strategy Builder
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Visual mock */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-[var(--navy)] to-[#232842] p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-[var(--coral)]" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-4 w-1/2 rounded bg-white/10" />
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="h-24 rounded-lg bg-[var(--teal)]/20 border border-[var(--teal)]/30" />
                    <div className="h-24 rounded-lg bg-[var(--coral)]/20 border border-[var(--coral)]/30" />
                  </div>
                  <div className="h-32 rounded-lg bg-white/5 border border-white/10" />
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 rounded-xl bg-white px-5 py-3 shadow-lg border border-gray-100">
                <p className="text-sm font-semibold text-[var(--navy)]">
                  Strategy Generated
                </p>
                <p className="text-xs text-gray-500">
                  15 sections &bull; 90-day roadmap
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEMPLATE TOOLKIT ===== */}
      <section id="templates" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              41 Interactive Marketing Templates
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Purpose-built for your strategy execution
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templateCategories.map((category) => (
              <div
                key={category.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[var(--teal)]/30 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[var(--teal)]/10 p-3 text-[var(--teal)] transition-colors group-hover:bg-[var(--teal)] group-hover:text-white">
                  {templateIcons[category.id]}
                </div>
                <h3 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--navy)]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--teal)]">
                  {category.count} templates
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/templates"
              className="group inline-flex items-center gap-2 text-base font-semibold text-[var(--teal)] transition-colors hover:text-[var(--coral)]"
            >
              Explore All Templates
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== 90-DAY GROWTH CHALLENGE ===== */}
      <section
        id="growth-challenge"
        className="relative overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[#1e2538] to-[#141824] py-24 text-white sm:py-32"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--teal)] opacity-[0.05] blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--teal)]">
                Accountability Program
              </p>
              <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight sm:text-4xl">
                The 90-Day Growth Challenge
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Transform strategy into measurable results with our structured,
                community-backed challenge
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  "12-Week Curriculum with daily tasks and weekly themes",
                  "Live Group Coaching sessions twice per week",
                  "Community Accountability with peer feedback and support",
                  "Done-For-You Templates for rapid implementation",
                  "Weekly Check-ins with progress tracking",
                  "Lifetime Access to all content and templates",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <Check className="w-5 h-5 shrink-0 text-[var(--teal)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <a
                  href="#pricing"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[var(--teal)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[var(--teal)]/20 transition-all hover:bg-[var(--teal-hover)] hover:-translate-y-0.5"
                >
                  Enroll in Next Cohort
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {[
                { weeks: "Week 1-2", title: "Foundation", color: "coral" },
                { weeks: "Week 3-4", title: "Positioning", color: "teal" },
                {
                  weeks: "Week 5-6",
                  title: "Audience Research",
                  color: "coral",
                },
                {
                  weeks: "Week 7-8",
                  title: "Channel Strategy",
                  color: "teal",
                },
                {
                  weeks: "Week 9-10",
                  title: "Content Execution",
                  color: "coral",
                },
                {
                  weeks: "Week 11-12",
                  title: "Scale & Optimize",
                  color: "teal",
                },
              ].map((phase, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      phase.color === "coral"
                        ? "bg-[var(--coral)]/20 text-[var(--coral)]"
                        : "bg-[var(--teal)]/20 text-[var(--teal)]"
                    }`}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/50">
                      {phase.weeks}
                    </p>
                    <p className="font-[family-name:var(--font-oswald)] text-lg font-bold">
                      {phase.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING PREVIEW ===== */}
      <section id="pricing" className="bg-off-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your growth stage
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Template Toolkit */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Template Toolkit
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Perfect for solo marketers and small teams
              </p>
              <div className="mt-6">
                <span className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
                  &euro;19
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "41 interactive templates",
                  "Template library & search",
                  "Export (PDF, XLSX)",
                  "Email support",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 shrink-0 text-[var(--teal)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup?plan=template-toolkit"
                className="mt-8 block rounded-xl border-2 border-[var(--navy)] py-3 text-center text-sm font-semibold text-[var(--navy)] transition-all hover:bg-[var(--navy)] hover:text-white"
              >
                Get Started
              </a>
            </div>

            {/* Starter Strategy */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Starter Strategy
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                For entrepreneurs ready to level up
              </p>
              <div className="mt-6">
                <span className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
                  &euro;149
                </span>
                <span className="text-gray-500">/one-time</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "AI Strategy Builder (39 Q's)",
                  "15-section strategy deck",
                  "90-day roadmap",
                  "Strategy exports",
                  "1 month template access",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 shrink-0 text-[var(--teal)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup?plan=starter-strategy"
                className="mt-8 block rounded-xl border-2 border-[var(--navy)] py-3 text-center text-sm font-semibold text-[var(--navy)] transition-all hover:bg-[var(--navy)] hover:text-white"
              >
                Start Strategy
              </a>
            </div>

            {/* Professional -- MOST POPULAR */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[var(--coral)] bg-white p-8 shadow-xl ring-1 ring-[var(--coral)]/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--coral)] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Professional
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                The complete platform for growing businesses
              </p>
              <div className="mt-6">
                <span className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
                  &euro;499
                </span>
                <span className="text-gray-500">/year</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Everything in Starter",
                  "Unlimited template access",
                  "90-Day Growth Challenge",
                  "Priority email support",
                  "Strategy refinements (3x)",
                  "Community access",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 shrink-0 text-[var(--coral)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup?plan=professional"
                className="mt-8 block rounded-xl bg-[var(--coral)] py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[var(--coral)]/20 transition-all hover:bg-[var(--coral-hover)]"
              >
                Get Professional
              </a>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <h3 className="font-[family-name:var(--font-oswald)] text-xl font-bold text-[var(--navy)]">
                Enterprise
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                For teams and franchise networks
              </p>
              <div className="mt-6">
                <span className="font-[family-name:var(--font-oswald)] text-4xl font-bold text-[var(--navy)]">
                  &euro;2,999
                </span>
                <span className="text-gray-500">/year</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Everything in Professional",
                  "5-20 team seats",
                  "1-on-1 strategy sessions",
                  "Custom template creation",
                  "Dedicated support",
                  "API access",
                ].map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 shrink-0 text-[var(--teal)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="mt-8 block rounded-xl border-2 border-[var(--navy)] py-3 text-center text-sm font-semibold text-[var(--navy)] transition-all hover:bg-[var(--navy)] hover:text-white"
              >
                Contact Sales
              </a>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            All paid plans include a 14-day money-back guarantee. No questions
            asked.
          </p>
        </div>
      </section>

      {/* ===== CREDIBILITY ===== */}
      <section id="credibility" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              Backed by Expertise You Can Trust
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Created by a strategist recognized by the world&rsquo;s leading
              marketing awards
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                number: "2,400+",
                label: "Strategies Built",
                icon: <TrendingUp className="w-6 h-6" />,
              },
              {
                number: "4.9\u2605",
                label: "Average Rating",
                icon: <Star className="w-6 h-6" />,
              },
              {
                number: "45%",
                label: "Avg. Revenue Growth",
                icon: <BarChart3 className="w-6 h-6" />,
              },
              {
                number: "30+",
                label: "Countries with Active Users",
                icon: <Globe className="w-6 h-6" />,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-off-white p-6 text-center"
              >
                <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-xl bg-[var(--teal)]/10 p-2.5 text-[var(--teal)]">
                  {stat.icon}
                </div>
                <p className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
                  {stat.number}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Credentials */}
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "15+ Years Crafting Strategies",
                description:
                  "Gabriel Adrian Eremia brings deep expertise in brand positioning, growth marketing, and strategic planning. Every framework in Advertising Unplugged is battle-tested across 100+ brands.",
                icon: <Award className="w-6 h-6" />,
              },
              {
                title: "Forbes Romania Contributor",
                description:
                  "Recognized for insights on marketing innovation and business growth. Featured speaker on leadership and strategic marketing in Eastern Europe\u2019s most influential business publication.",
                icon: <BookOpen className="w-6 h-6" />,
              },
              {
                title: "Cannes & Effie Recognition",
                description:
                  "Marketing campaigns developed with our methodologies have been recognized at the world\u2019s most prestigious award shows, validating our approach to strategic excellence.",
                icon: <Star className="w-6 h-6" />,
              },
            ].map((cred, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-off-white p-8"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[var(--coral)]/10 p-3 text-[var(--coral)]">
                  {cred.icon}
                </div>
                <h3 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--navy)]">
                  {cred.title}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-600">
                  {cred.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        id="testimonials"
        className="bg-off-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of entrepreneurs growing with confidence
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                quote:
                  "Advertising Unplugged gave me clarity I\u2019d been missing for 3 years. The strategy is precise, actionable, and delivered exactly when I needed it. Already seeing 35% growth in qualified leads.",
                author: "Ana Popescu",
                title: "CEO, Tech Startup, Romania",
              },
              {
                quote:
                  "As a franchise owner managing 8 locations, having a unified strategy has been a game-changer. The templates saved us weeks of internal meetings and debates.",
                author: "Mihai Cristescu",
                title: "Franchise Owner, East EU",
              },
              {
                quote:
                  "I\u2019ve invested in dozens of courses and frameworks. This is the first one that actually feels personalized to MY business. The 90-day challenge kept me accountable and got real results.",
                author: "Cristina Ionescu",
                title: "Coach & Consultant, Romania",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-gray-700 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--teal)] text-sm font-bold text-white">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--navy)]">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight text-[var(--navy)] sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know before getting started
            </p>
          </div>

          <div className="mt-16 divide-y divide-gray-200">
            {[
              {
                q: "How long does it take to get my strategy?",
                a: "Your AI-powered strategy is generated instantly after you complete the 39-question builder. Most users get their full 15-section strategy deck within 2-5 minutes of submission.",
              },
              {
                q: "Can I refine my strategy after it\u2019s created?",
                a: "Absolutely. Professional and Enterprise plans include strategy refinements. You can regenerate sections, adjust answers, and get updated strategies as your business evolves.",
              },
              {
                q: "What if I\u2019m not a marketer? Can I still use this?",
                a: "Yes! The AI Strategy Builder asks questions any business owner can answer\u2014about your goals, audience, and competitive position. No marketing jargon required. All templates are self-explanatory.",
              },
              {
                q: "Is the 90-Day Challenge included in all plans?",
                a: "The 90-Day Growth Challenge is included in Professional and Enterprise plans. Template Toolkit and Starter Strategy users can purchase it separately for \u20ac299.",
              },
              {
                q: "Can I export my strategy and templates?",
                a: "Yes. Export strategies as PDF or PPTX. Export template data as XLSX or PDF. Professional and Enterprise plans also get a sharable web link for team collaboration.",
              },
              {
                q: "What about team access?",
                a: "Template Toolkit and Starter Strategy are single-user. Professional plan allows 1-3 team members. Enterprise supports 5-20 seats with full collaboration features and separate team dashboards.",
              },
              {
                q: "Do you offer a refund if I\u2019m not satisfied?",
                a: "Yes. All Starter Strategy, Professional, and Enterprise purchases come with a 14-day money-back guarantee. No questions asked. We\u2019re confident you\u2019ll see value immediately.",
              },
              {
                q: "Is my data secure? What about privacy?",
                a: "Your data is encrypted and stored in EU data centers via Supabase. We never sell or share your data. Full GDPR compliance. Read our detailed privacy policy for specifics.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay. Payments are processed securely through Stripe.",
              },
              {
                q: "Can I change my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan anytime. Your new pricing will be reflected on your next billing cycle. No penalties or hidden fees.",
              },
            ].map((faq, i) => (
              <details key={i} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-left font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)] transition-colors hover:text-[var(--coral)] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-4 leading-relaxed text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section
        id="cta"
        className="relative overflow-hidden bg-gradient-to-br from-[var(--coral)] via-[var(--coral)] to-[var(--coral-hover)] py-24 text-white sm:py-32"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0tMTgtMThjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Stop Guessing. Start Growing.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Get your personalized brand strategy powered by AI in the next 24
            hours. Join 2,400+ entrepreneurs who&rsquo;ve turned clarity into
            results.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-[var(--coral)] shadow-lg transition-all hover:bg-gray-50 hover:-translate-y-0.5"
            >
              Start Free Assessment
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
            >
              See Pricing Plans
            </a>
          </div>

          <p className="mt-8 text-sm text-white/60">
            No credit card required &bull; Results in 24 hours &bull; 14-day
            guarantee
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
