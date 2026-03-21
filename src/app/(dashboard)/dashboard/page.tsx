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
} from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}

function StatCard({ icon, label, value, subtitle, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    </div>
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

  // Fetch real data in parallel
  const [
    strategiesResult,
    templatesResult,
    challengeResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("strategy_projects")
      .select("id, status", { count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("template_responses")
      .select("id", { count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("challenge_enrollments")
      .select("id, current_day, total_days, enrolled_at")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  // Strategy stats
  const strategyCount = strategiesResult.count ?? 0;
  const inProgressCount =
    strategiesResult.data?.filter((s) => s.status === "in_progress").length ?? 0;
  const strategySubtitle =
    strategyCount === 0
      ? "Create your first strategy"
      : `${inProgressCount} in progress`;

  // Template stats
  const templatesUsed = templatesResult.count ?? 0;
  const templateSubtitle =
    templatesUsed === 0
      ? "Start using templates"
      : `of 42 available`;

  // Challenge stats
  const enrollment = challengeResult.data;
  let challengeValue = "--";
  let challengeSubtitle = "Not enrolled yet";
  if (enrollment) {
    const currentDay = enrollment.current_day ?? 0;
    const totalDays = enrollment.total_days ?? 30;
    const pct = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;
    challengeValue = `${pct}%`;
    challengeSubtitle = `Day ${currentDay} of ${totalDays}`;
  }

  // Subscription stats
  const subscription = subscriptionResult.data;
  let planLabel = "Free";
  let planSubtitle = "Upgrade anytime";
  if (subscription) {
    planLabel =
      subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
    if (subscription.current_period_end) {
      const renewDate = new Date(subscription.current_period_end);
      planSubtitle = `Renews ${renewDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else {
      planSubtitle = "Active";
    }
  }

  // Recent activity from real data
  const { data: recentStrategies } = await supabase
    .from("strategy_projects")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentTemplates } = await supabase
    .from("template_responses")
    .select("id, template_id, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(3);

  // Build activity feed
  interface ActivityItem {
    icon: React.ReactNode;
    iconBg: string;
    text: string;
    time: string;
    sortDate: Date;
  }

  const activities: ActivityItem[] = [];

  recentStrategies?.forEach((s) => {
    activities.push({
      icon: <Brain className="h-4 w-4 text-indigo-600" />,
      iconBg: "bg-indigo-100",
      text: `Created "${s.name}" strategy`,
      time: formatRelativeTime(new Date(s.created_at)),
      sortDate: new Date(s.created_at),
    });
  });

  recentTemplates?.forEach((t) => {
    const templateName = t.template_id
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
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
          <h1 className="text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
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
          <h2 className="mb-4 text-lg font-semibold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
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
              Join Challenge
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--navy)] font-[family-name:var(--font-space-grotesk)]">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {topActivities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {topActivities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.iconBg}`}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.text}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
