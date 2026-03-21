"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Flame,
  Trophy,
  Calendar,
  Clock,
  Star,
  Target,
  ArrowRight,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

interface Week {
  weekNumber: number;
  phase: number;
  phaseTitle: string;
  weekTitle: string;
  description: string;
  estimatedHours: number;
  tasks: Task[];
}

const WEEKS: Week[] = [
  {
    weekNumber: 1,
    phase: 1,
    phaseTitle: "Foundation",
    weekTitle: "Brand Audit & Baseline",
    description: "Establish a clear baseline of your current brand position and marketing effectiveness.",
    estimatedHours: 11,
    tasks: [
      { id: "t-1-1", title: "Complete the Marketing Audit Template", estimatedMinutes: 120, completed: true },
      { id: "t-1-2", title: "Document your current customer journey", estimatedMinutes: 90, completed: true },
      { id: "t-1-3", title: "Audit your website", estimatedMinutes: 120, completed: true },
      { id: "t-1-4", title: "Review last 3 months of marketing data", estimatedMinutes: 90, completed: true },
      { id: "t-1-5", title: "Analyze top 3 competitors", estimatedMinutes: 120, completed: false },
      { id: "t-1-6", title: "Interview 3 recent customers", estimatedMinutes: 90, completed: false },
      { id: "t-1-7", title: "Define 90-day success metrics", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 2,
    phase: 1,
    phaseTitle: "Foundation",
    weekTitle: "Customer Deep-Dive",
    description: "Build detailed customer personas and understand your audience's needs, pain points, and buying journey.",
    estimatedHours: 10,
    tasks: [
      { id: "t-2-1", title: "Build primary customer persona", estimatedMinutes: 90, completed: false },
      { id: "t-2-2", title: "Build secondary customer persona", estimatedMinutes: 90, completed: false },
      { id: "t-2-3", title: "Map the full buying journey", estimatedMinutes: 120, completed: false },
      { id: "t-2-4", title: "Identify top customer pain points", estimatedMinutes: 60, completed: false },
      { id: "t-2-5", title: "Research customer communities online", estimatedMinutes: 90, completed: false },
      { id: "t-2-6", title: "Create a customer feedback survey", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 3,
    phase: 1,
    phaseTitle: "Foundation",
    weekTitle: "Competitive Intelligence",
    description: "Deep-dive into your competitive landscape and identify strategic opportunities.",
    estimatedHours: 10,
    tasks: [
      { id: "t-3-1", title: "Complete Competitor Analysis Framework", estimatedMinutes: 120, completed: false },
      { id: "t-3-2", title: "Audit competitor websites and messaging", estimatedMinutes: 90, completed: false },
      { id: "t-3-3", title: "Analyze competitor social media presence", estimatedMinutes: 60, completed: false },
      { id: "t-3-4", title: "Sign up for competitor email lists", estimatedMinutes: 30, completed: false },
      { id: "t-3-5", title: "Identify competitive gaps and opportunities", estimatedMinutes: 90, completed: false },
      { id: "t-3-6", title: "Document your unique differentiation", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 4,
    phase: 2,
    phaseTitle: "Strategy",
    weekTitle: "Brand Identity & Messaging",
    description: "Define your brand voice, messaging framework, and core value proposition.",
    estimatedHours: 9,
    tasks: [
      { id: "t-4-1", title: "Define brand voice and tone", estimatedMinutes: 60, completed: false },
      { id: "t-4-2", title: "Create messaging framework", estimatedMinutes: 90, completed: false },
      { id: "t-4-3", title: "Write brand story", estimatedMinutes: 60, completed: false },
      { id: "t-4-4", title: "Develop tagline options", estimatedMinutes: 45, completed: false },
      { id: "t-4-5", title: "Create elevator pitch", estimatedMinutes: 30, completed: false },
      { id: "t-4-6", title: "Build brand messaging matrix", estimatedMinutes: 90, completed: false },
    ],
  },
  {
    weekNumber: 5, phase: 2, phaseTitle: "Strategy", weekTitle: "Content Strategy", description: "Plan your content pillars, calendar, and distribution strategy.", estimatedHours: 10,
    tasks: [
      { id: "t-5-1", title: "Define content pillars", estimatedMinutes: 60, completed: false },
      { id: "t-5-2", title: "Create monthly content calendar", estimatedMinutes: 120, completed: false },
      { id: "t-5-3", title: "Plan blog content strategy", estimatedMinutes: 90, completed: false },
      { id: "t-5-4", title: "Outline social media strategy", estimatedMinutes: 60, completed: false },
      { id: "t-5-5", title: "Set up content creation workflow", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 6, phase: 2, phaseTitle: "Strategy", weekTitle: "Marketing Plan & Budget", description: "Finalize your marketing plan, channel strategy, and budget allocation.", estimatedHours: 9,
    tasks: [
      { id: "t-6-1", title: "Finalize channel strategy", estimatedMinutes: 90, completed: false },
      { id: "t-6-2", title: "Create marketing budget", estimatedMinutes: 60, completed: false },
      { id: "t-6-3", title: "Set up marketing OKRs", estimatedMinutes: 45, completed: false },
      { id: "t-6-4", title: "Plan first campaign", estimatedMinutes: 90, completed: false },
      { id: "t-6-5", title: "Build marketing project timeline", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 7, phase: 3, phaseTitle: "Execution", weekTitle: "Launch & Build", description: "Start executing your strategy — launch campaigns, publish content, and build momentum.", estimatedHours: 12,
    tasks: [
      { id: "t-7-1", title: "Launch first content pieces", estimatedMinutes: 120, completed: false },
      { id: "t-7-2", title: "Set up email marketing flows", estimatedMinutes: 90, completed: false },
      { id: "t-7-3", title: "Optimize website for conversions", estimatedMinutes: 120, completed: false },
      { id: "t-7-4", title: "Begin social media campaign", estimatedMinutes: 60, completed: false },
      { id: "t-7-5", title: "Set up analytics tracking", estimatedMinutes: 90, completed: false },
    ],
  },
  {
    weekNumber: 8, phase: 3, phaseTitle: "Execution", weekTitle: "Paid Acquisition", description: "Set up and launch paid advertising campaigns.", estimatedHours: 10,
    tasks: [
      { id: "t-8-1", title: "Set up Google Ads account", estimatedMinutes: 60, completed: false },
      { id: "t-8-2", title: "Create ad copy and creatives", estimatedMinutes: 120, completed: false },
      { id: "t-8-3", title: "Build landing pages", estimatedMinutes: 120, completed: false },
      { id: "t-8-4", title: "Launch initial campaigns", estimatedMinutes: 60, completed: false },
      { id: "t-8-5", title: "Set up conversion tracking", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 9, phase: 3, phaseTitle: "Execution", weekTitle: "Community & Partnerships", description: "Build community engagement and explore strategic partnerships.", estimatedHours: 8,
    tasks: [
      { id: "t-9-1", title: "Identify 10 potential partners", estimatedMinutes: 60, completed: false },
      { id: "t-9-2", title: "Reach out to 5 partners", estimatedMinutes: 45, completed: false },
      { id: "t-9-3", title: "Set up community channel", estimatedMinutes: 60, completed: false },
      { id: "t-9-4", title: "Launch referral programme", estimatedMinutes: 90, completed: false },
      { id: "t-9-5", title: "Create first case study", estimatedMinutes: 120, completed: false },
    ],
  },
  {
    weekNumber: 10, phase: 4, phaseTitle: "Optimization", weekTitle: "Data & Analytics Review", description: "Analyze performance data and identify optimization opportunities.", estimatedHours: 9,
    tasks: [
      { id: "t-10-1", title: "Pull comprehensive analytics report", estimatedMinutes: 120, completed: false },
      { id: "t-10-2", title: "Analyze channel performance", estimatedMinutes: 90, completed: false },
      { id: "t-10-3", title: "Calculate CAC and LTV", estimatedMinutes: 60, completed: false },
      { id: "t-10-4", title: "Identify top-performing content", estimatedMinutes: 45, completed: false },
      { id: "t-10-5", title: "Create optimization roadmap", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 11, phase: 4, phaseTitle: "Optimization", weekTitle: "A/B Testing & Refinement", description: "Run experiments and refine your strategy based on data.", estimatedHours: 8,
    tasks: [
      { id: "t-11-1", title: "Set up A/B tests on landing pages", estimatedMinutes: 90, completed: false },
      { id: "t-11-2", title: "Test email subject lines", estimatedMinutes: 45, completed: false },
      { id: "t-11-3", title: "Optimize ad campaigns", estimatedMinutes: 90, completed: false },
      { id: "t-11-4", title: "Refine content strategy based on data", estimatedMinutes: 60, completed: false },
      { id: "t-11-5", title: "Update customer personas with new insights", estimatedMinutes: 60, completed: false },
    ],
  },
  {
    weekNumber: 12, phase: 4, phaseTitle: "Optimization", weekTitle: "Scale & Next Steps", description: "Consolidate gains, build systems for scale, and plan the next 90 days.", estimatedHours: 7,
    tasks: [
      { id: "t-12-1", title: "Document all marketing processes", estimatedMinutes: 90, completed: false },
      { id: "t-12-2", title: "Create marketing playbook", estimatedMinutes: 120, completed: false },
      { id: "t-12-3", title: "Set goals for next quarter", estimatedMinutes: 60, completed: false },
      { id: "t-12-4", title: "Celebrate your progress!", estimatedMinutes: 30, completed: false },
    ],
  },
];

export default function ChallengeDashboardPage() {
  const [weeks, setWeeks] = useState<Week[]>(WEEKS);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set([1])
  );

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) next.delete(weekNumber);
      else next.add(weekNumber);
      return next;
    });
  };

  const toggleTask = (weekNumber: number, taskId: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === weekNumber
          ? {
              ...w,
              tasks: w.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : w
      )
    );
  };

  // Compute stats
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = weeks.reduce(
    (sum, w) => sum + w.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  // Streak calculation (consecutive days with at least 1 completion)
  const streakDays = 4; // Placeholder

  // Current week (first week with incomplete tasks)
  const currentWeek =
    weeks.find((w) => w.tasks.some((t) => !t.completed))?.weekNumber ?? 1;

  // Next milestone
  const nextMilestoneWeek = weeks.find(
    (w) => w.weekNumber >= currentWeek && w.tasks.some((t) => !t.completed)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/challenge"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Challenge Overview
          </Link>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-navy sm:text-3xl">
            Your Challenge Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your progress through the 90-Day Growth Challenge.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Overall Progress
            </div>
            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-navy">
              {overallProgress}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tasks Done
            </div>
            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-navy">
              {completedTasks}/{totalTasks}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5" />
              Current Streak
            </div>
            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-coral">
              {streakDays} days
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Current Week
            </div>
            <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-teal">
              Week {currentWeek}
            </p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Challenge Progress
            </span>
            <span className="text-muted-foreground">
              {overallProgress}% complete
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-coral via-teal to-emerald-400 transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Next milestone */}
        {nextMilestoneWeek && (
          <div className="mb-8 rounded-xl border border-teal/20 bg-teal/5 p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-teal" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Next Milestone: Complete Week {nextMilestoneWeek.weekNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextMilestoneWeek.weekTitle} &mdash;{" "}
                  {nextMilestoneWeek.tasks.filter((t) => !t.completed).length}{" "}
                  tasks remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Week accordion */}
        <div className="space-y-3">
          {weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.weekNumber);
            const weekCompleted = week.tasks.filter((t) => t.completed).length;
            const weekTotal = week.tasks.length;
            const weekProgress = Math.round(
              (weekCompleted / weekTotal) * 100
            );
            const isCurrent = week.weekNumber === currentWeek;
            const isAllDone = weekCompleted === weekTotal;

            return (
              <div
                key={week.weekNumber}
                className={`overflow-hidden rounded-xl border bg-card transition-colors ${
                  isCurrent
                    ? "border-coral/30 shadow-sm"
                    : "border-border"
                }`}
              >
                {/* Week header */}
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-space-grotesk)] text-xs font-bold ${
                      isAllDone
                        ? "bg-emerald-100 text-emerald-600"
                        : isCurrent
                          ? "bg-coral/10 text-coral"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isAllDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      `W${week.weekNumber}`
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {week.weekTitle}
                      </h3>
                      {isCurrent && (
                        <span className="rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-medium text-coral">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Phase {week.phase}: {week.phaseTitle}
                      </span>
                      <span>
                        {weekCompleted}/{weekTotal} tasks
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isAllDone ? "bg-emerald-400" : "bg-coral"
                        }`}
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {/* Tasks */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3">
                    <p className="mb-3 text-xs text-muted-foreground">
                      {week.description}
                    </p>
                    <div className="space-y-2">
                      {week.tasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() =>
                              toggleTask(week.weekNumber, task.id)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-border text-coral focus:ring-coral/20"
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-sm ${
                                task.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.estimatedMinutes}m
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
