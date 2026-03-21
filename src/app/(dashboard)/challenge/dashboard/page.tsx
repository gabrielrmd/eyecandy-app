"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Trophy,
  Calendar,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import curriculum from "@/data/curriculum.json";
import {
  getEnrollment,
  getChallengeProgress,
  markTaskComplete,
} from "@/app/actions/challenge";

interface CurriculumTask {
  id: string;
  title: string;
  estimatedMinutes: number;
}

interface Week {
  weekNumber: number;
  phase: number;
  phaseTitle: string;
  weekTitle: string;
  description: string;
  estimatedHours: number;
  tasks: CurriculumTask[];
}

export default function ChallengeDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set([1])
  );
  const [isPending, startTransition] = useTransition();

  const weeks: Week[] = curriculum.curriculum.weeks.map((w) => ({
    weekNumber: w.weekNumber,
    phase: w.phase,
    phaseTitle: w.phaseTitle,
    weekTitle: w.weekTitle,
    description: w.description,
    estimatedHours: w.estimatedHours,
    tasks: w.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      estimatedMinutes: t.estimatedMinutes,
    })),
  }));

  // Load enrollment and progress on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const enrollResult = await getEnrollment();

      if (enrollResult.error === "Unauthorized") {
        router.push("/login");
        return;
      }

      if (!enrollResult.enrollment) {
        router.push("/challenge");
        return;
      }

      const enrollment = enrollResult.enrollment;
      setEnrollmentId(enrollment.id);

      // Load progress
      const progressResult = await getChallengeProgress(enrollment.id);
      if (progressResult.progress) {
        const completed = new Set<string>();
        progressResult.progress.forEach((p) => {
          // Parse task completions from assignment_submission
          if (p.assignment_submission) {
            try {
              const taskMap = JSON.parse(p.assignment_submission) as Record<
                string,
                boolean
              >;
              Object.entries(taskMap).forEach(([taskId, isDone]) => {
                if (isDone) completed.add(taskId);
              });
            } catch {
              // Ignore parse errors
            }
          }
        });
        setCompletedTasks(completed);

        // Auto-expand the current week (first with incomplete tasks)
        const currentWeekNum = weeks.find((w) =>
          w.tasks.some((t) => !completed.has(t.id))
        )?.weekNumber;
        if (currentWeekNum) {
          setExpandedWeeks(new Set([currentWeekNum]));
        }
      }

      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) next.delete(weekNumber);
      else next.add(weekNumber);
      return next;
    });
  };

  const handleToggleTask = useCallback(
    (weekNumber: number, taskId: string) => {
      if (!enrollmentId) return;
      const isCurrentlyComplete = completedTasks.has(taskId);
      const newIsComplete = !isCurrentlyComplete;

      // Optimistic update
      setCompletedTasks((prev) => {
        const next = new Set(prev);
        if (newIsComplete) next.add(taskId);
        else next.delete(taskId);
        return next;
      });

      startTransition(async () => {
        const result = await markTaskComplete(
          enrollmentId,
          weekNumber,
          taskId,
          newIsComplete
        );
        if (result.error) {
          // Revert on error
          setCompletedTasks((prev) => {
            const next = new Set(prev);
            if (isCurrentlyComplete) next.add(taskId);
            else next.delete(taskId);
            return next;
          });
        }
      });
    },
    [enrollmentId, completedTasks]
  );

  // Compute stats
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedCount = completedTasks.size;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Current week (first week with incomplete tasks)
  const currentWeek =
    weeks.find((w) => w.tasks.some((t) => !completedTasks.has(t.id)))
      ?.weekNumber ?? 12;

  // Weeks fully completed
  const weeksFullyCompleted = weeks.filter((w) =>
    w.tasks.every((t) => completedTasks.has(t.id))
  ).length;

  // Next milestone
  const nextMilestoneWeek = weeks.find(
    (w) =>
      w.weekNumber >= currentWeek && w.tasks.some((t) => !completedTasks.has(t.id))
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your challenge dashboard...</span>
        </div>
      </div>
    );
  }

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
          <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] sm:text-3xl">
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
            <p className="mt-1 font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)]">
              {overallProgress}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tasks Done
            </div>
            <p className="mt-1 font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)]">
              {completedCount}/{totalTasks}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5" />
              Weeks Completed
            </div>
            <p className="mt-1 font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--coral)]">
              {weeksFullyCompleted}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Current Week
            </div>
            <p className="mt-1 font-[family-name:var(--font-oswald)] text-2xl font-bold text-teal">
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
              className="h-full rounded-full bg-gradient-to-r from-[var(--coral)] via-teal to-emerald-400 transition-all duration-700"
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
                  {
                    nextMilestoneWeek.tasks.filter(
                      (t) => !completedTasks.has(t.id)
                    ).length
                  }{" "}
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
            const weekCompleted = week.tasks.filter((t) =>
              completedTasks.has(t.id)
            ).length;
            const weekTotal = week.tasks.length;
            const weekProgress =
              weekTotal > 0
                ? Math.round((weekCompleted / weekTotal) * 100)
                : 0;
            const isCurrent = week.weekNumber === currentWeek;
            const isAllDone = weekCompleted === weekTotal;

            return (
              <div
                key={week.weekNumber}
                className={`overflow-hidden rounded-xl border bg-card transition-colors ${
                  isCurrent
                    ? "border-[var(--coral)]/30 shadow-sm"
                    : "border-border"
                }`}
              >
                {/* Week header */}
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-oswald)] text-xs font-bold ${
                      isAllDone
                        ? "bg-emerald-100 text-emerald-600"
                        : isCurrent
                          ? "bg-[var(--coral)]/10 text-[var(--coral)]"
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
                        <span className="rounded-full bg-[var(--coral)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--coral)]">
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
                          isAllDone ? "bg-emerald-400" : "bg-[var(--coral)]"
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
                      {week.tasks.map((task) => {
                        const isChecked = completedTasks.has(task.id);
                        return (
                          <label
                            key={task.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/30"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleToggleTask(week.weekNumber, task.id)
                              }
                              disabled={isPending}
                              className="mt-0.5 h-4 w-4 rounded border-border text-[var(--coral)] focus:ring-[var(--coral)]/20"
                            />
                            <div className="min-w-0 flex-1">
                              <span
                                className={`text-sm ${
                                  isChecked
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
                        );
                      })}
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
