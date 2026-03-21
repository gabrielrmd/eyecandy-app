import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Brain,
  LayoutTemplate,
  Trophy,
  CreditCard,
  Plus,
  BookOpen,
  Flame,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: string;
  href?: string;
}

function StatCard({ icon, label, value, subtitle, color, href }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-4 font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {content}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed" || status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === "failed" || status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <AlertCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      <Loader2 className="h-3 w-3" />
      In Progress
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";

  // Fetch real data in parallel - use maybeSingle and handle errors gracefully
  const [
    strategiesResult,
    templatesResult,
    challengeResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("strategy_projects")
      .select("id, title, status, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("template_responses")
      .select("id", { count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("challenge_enrollments")
      .select("id, status, weeks_completed, enrollment_date")
      .eq("user_id", user.id)
      .order("enrollment_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  // All strategies for the "My Strategies" section
  const allStrategies = strategiesResult.data ?? [];

  // Strategy stats - handle empty/error gracefully
  const strategyCount = strategiesResult.count ?? 0;
  const inProgressCount =
    allStrategies.filter((s) => s.status === "in_progress").length;
  const strategySubtitle =
    strategyCount === 0
      ? "Create your first strategy"
      : `${inProgressCount} in progress`;

  // Template stats - handle empty/error gracefully
  const templatesUsed = templatesResult.count ?? 0;
  const templateSubtitle =
    templatesUsed === 0
      ? "Start using templates"
      : `of 42 available`;

  // Challenge stats - uses actual schema columns
  const enrollment = challengeResult.data;
  let challengeValue = "0%";
  let challengeSubtitle = "Not enrolled yet";
  if (enrollment) {
    const weeksCompleted = enrollment.weeks_completed ?? 0;
    const totalWeeks = 12;
    const pct =
      totalWeeks > 0 ? Math.round((weeksCompleted / totalWeeks) * 100) : 0;
    challengeValue = `${pct}%`;
    const statusLabel =
      enrollment.status === "completed"
        ? "Completed"
        : enrollment.status === "in_progress"
          ? `Week ${weeksCompleted + 1} of ${totalWeeks}`
          : "Not started";
    challengeSubtitle = statusLabel;
  }

  // Subscription stats - handle empty/error gracefully
  const subscription = subscriptionResult.data;
  let planLabel = "Free";
  let planSubtitle = "Upgrade anytime";
  if (subscription) {
    const planStr = String(subscription.plan ?? "free");
    planLabel = planStr.charAt(0).toUpperCase() + planStr.slice(1);
    if (subscription.current_period_end) {
      const renewDate = new Date(subscription.current_period_end);
      planSubtitle = `Renews ${renewDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else {
      planSubtitle = "Active";
    }
  }

  // Recent activity from real data - handle errors gracefully
  const { data: recentStrategies } = await supabase
    .from("strategy_projects")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentTemplates } = await supabase
    .from("template_responses")
    .select("id, template_id, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  // Optionally fetch template names for display
  const templateIds = (recentTemplates ?? [])
    .map((t) => t.template_id)
    .filter(Boolean);
  let templateNameMap: Record<string, string> = {};
  if (templateIds.length > 0) {
    const { data: templateCatalog } = await supabase
      .from("template_catalog")
      .select("id, name")
      .in("id", templateIds);
    if (templateCatalog) {
      templateNameMap = Object.fromEntries(
        templateCatalog.map((tc) => [tc.id, tc.name])
      );
    }
  }

  // Build activity feed
  interface ActivityItem {
    icon: React.ReactNode;
    iconBg: string;
    text: string;
    time: string;
    sortDate: Date;
    href?: string;
  }

  const activities: ActivityItem[] = [];

  (recentStrategies ?? []).forEach((s) => {
    activities.push({
      icon: <Brain className="h-4 w-4 text-indigo-600" />,
      iconBg: "bg-indigo-100",
      text: `Created "${s.title ?? "Untitled"}" strategy`,
      time: formatRelativeTime(new Date(s.created_at)),
      sortDate: new Date(s.created_at),
      href: `/strategy/${s.id}/result`,
    });
  });

  (recentTemplates ?? []).forEach((t) => {
    const templateName =
      templateNameMap[t.template_id] ?? "Template";
    activities.push({
      icon: <LayoutTemplate className="h-4 w-4 text-emerald-600" />,
      iconBg: "bg-emerald-100",
      text: `Updated "${templateName}" template`,
      time: formatRelativeTime(new Date(t.updated_at)),
      sortDate: new Date(t.updated_at),
    });
  });

  // Sort by most recent, limit to 5
  activities.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  const topActivities = activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s an overview of your advertising strategy workspace.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Brain className="h-5 w-5 text-indigo-600" />}
            label="Active Strategies"
            value={String(strategyCount)}
            subtitle={strategySubtitle}
            color="#eef2ff"
            href="#my-strategies"
          />
          <StatCard
            icon={<LayoutTemplate className="h-5 w-5 text-emerald-600" />}
            label="Templates Used"
            value={String(templatesUsed)}
            subtitle={templateSubtitle}
            color="#ecfdf5"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-600" />}
            label="Challenge Progress"
            value={challengeValue}
            subtitle={challengeSubtitle}
            color="#fffbeb"
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5 text-rose-600" />}
            label="Subscription"
            value={planLabel}
            subtitle={planSubtitle}
            color="#fff1f2"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="mb-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/strategy/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create New Strategy
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4" />
              Browse Templates
            </Link>
            <Link
              href="/challenge"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-gray-50"
            >
              <Flame className="h-4 w-4" />
              {enrollment ? "Continue Challenge" : "Join Challenge"}
            </Link>
          </div>
        </div>

        {/* My Strategies */}
        <div className="mb-10" id="my-strategies">
          <h2 className="mb-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
            My Strategies
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {allStrategies.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {allStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {strategy.title ?? "Untitled Strategy"}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <StatusBadge status={strategy.status} />
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(new Date(strategy.created_at))}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/strategy/${strategy.id}/result`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--navy)] transition-colors hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                  <Brain className="h-6 w-6 text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  No strategies yet
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Create your first AI-powered brand strategy to get started.
                </p>
                <Link
                  href="/strategy/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--coral)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Strategy
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-oswald)] text-lg font-semibold text-[var(--navy)]">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {topActivities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {topActivities.map((activity, idx) => {
                  const inner = (
                    <>
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.text}
                        </p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </>
                  );

                  if (activity.href) {
                    return (
                      <Link
                        key={idx}
                        href={activity.href}
                        className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                      >
                        {inner}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-400">
                  No activity yet. Create a strategy or use a template to get
                  started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
