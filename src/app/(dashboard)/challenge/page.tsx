import Link from "next/link";
import {
  Rocket,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Star,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Trophy,
  Users,
  BarChart3,
} from "lucide-react";
import curriculum from "@/data/curriculum.json";

const PHASES = [
  {
    number: 1,
    title: "Foundation",
    subtitle: "Know Your Brand",
    weeks: "Weeks 1-3",
    icon: Target,
    color: "bg-navy",
    description:
      "Audit your current position, define your baseline metrics, and understand your competitive landscape.",
  },
  {
    number: 2,
    title: "Strategy",
    subtitle: "Plan Your Growth",
    weeks: "Weeks 4-6",
    icon: Zap,
    color: "bg-coral",
    description:
      "Build your brand identity, develop your content strategy, and create your marketing roadmap.",
  },
  {
    number: 3,
    title: "Execution",
    subtitle: "Launch & Build",
    weeks: "Weeks 7-9",
    icon: Rocket,
    color: "bg-teal",
    description:
      "Execute your strategy across channels, launch campaigns, and build your marketing engine.",
  },
  {
    number: 4,
    title: "Optimization",
    subtitle: "Scale & Refine",
    weeks: "Weeks 10-12",
    icon: TrendingUp,
    color: "bg-emerald-600",
    description:
      "Analyze results, optimize performance, and build systems for sustainable growth.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Founder, GreenLeaf Studios",
    quote:
      "The 90-Day Challenge completely transformed how I approach marketing. I went from spending hours guessing to having a clear, data-driven strategy. Our leads increased by 340% in 3 months.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Marketing Director, TechNova",
    quote:
      "As a B2B SaaS company, we struggled with our positioning. The structured weekly tasks and templates gave us the clarity we needed. Our conversion rate doubled by week 8.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "CEO, Bloom & Co",
    quote:
      "I've hired agencies before, but nothing compared to the hands-on learning and execution from this challenge. I now understand my marketing deeply, not just the vanity metrics.",
    rating: 5,
  },
];

const FAQ = [
  {
    q: "How much time do I need per week?",
    a: "Each week requires 8-12 hours of focused work. You can spread this across the week however works best for your schedule.",
  },
  {
    q: "Do I need marketing experience?",
    a: "No! The challenge is designed for entrepreneurs and founders who want to build strategic marketing skills from the ground up. Each week includes educational content and templates.",
  },
  {
    q: "What if I fall behind?",
    a: "Life happens. You can pause and resume at any time. The curriculum is self-paced, though we recommend maintaining weekly momentum for best results.",
  },
  {
    q: "What tools or software do I need?",
    a: "All templates and frameworks are included. You'll use our platform plus free tools like Google Analytics and social media accounts you already have.",
  },
  {
    q: "Is there a community or support?",
    a: "Yes! Every participant joins our private community where you can share progress, ask questions, and connect with other challengers.",
  },
];

export default function ChallengePage() {
  const weeks = curriculum.curriculum.weeks;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-navy">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(77,184,196,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-coral/20 px-3 py-1 text-xs font-medium text-coral">
              <Trophy className="h-3.5 w-3.5" />
              12-Week Guided Programme
            </div>
            <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              90-Day Growth Challenge
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              {curriculum.curriculum.description}
            </p>
            <p className="mt-2 text-sm font-medium text-teal">
              {curriculum.curriculum.philosophy}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal" />
                {curriculum.curriculum.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal" />
                {curriculum.curriculum.totalHours} hours total
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-teal" />
                1,200+ completions
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-teal" />
                4 phases
              </span>
            </div>

            <Link
              href="/challenge/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-coral px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-coral/90"
            >
              Enroll Now — It&apos;s Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Phase cards */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy">
          4 Phases to Transform Your Marketing
        </h2>
        <p className="mt-2 text-muted-foreground">
          A structured journey from audit to optimization.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.number}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${phase.color} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Phase {phase.number} &middot; {phase.weeks}
                </div>
                <h3 className="font-[family-name:var(--font-oswald)] text-base font-semibold text-foreground">
                  {phase.title}
                </h3>
                <p className="text-xs font-medium text-teal">
                  {phase.subtitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {phase.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12-week curriculum */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy">
            12-Week Curriculum
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every week is structured with learning, hands-on tasks, and a clear
            deliverable.
          </p>

          <div className="mt-8 space-y-3">
            {weeks.map((week) => (
              <div
                key={week.weekNumber}
                className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-teal/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 font-[family-name:var(--font-oswald)] text-sm font-bold text-navy">
                    W{week.weekNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-coral">
                        Phase {week.phase}: {week.phaseTitle}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-foreground">
                      {week.weekTitle}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {week.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {week.tasks.length} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {week.estimatedHours}h estimated
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy">
            Success Stories
          </h2>
          <p className="mt-2 text-muted-foreground">
            Hear from entrepreneurs who transformed their marketing.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center font-[family-name:var(--font-oswald)] text-2xl font-bold text-navy">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 space-y-4">
            {FAQ.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-background p-4"
              >
                <h3 className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-foreground">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/challenge/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-coral px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-coral/90"
            >
              Start the 90-Day Challenge
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Free to enroll. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
