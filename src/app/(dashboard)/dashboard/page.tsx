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
            value="3"
            subtitle="2 in progress"
            color="#eef2ff"
          />
          <StatCard
            icon={<LayoutTemplate className="h-5 w-5 text-emerald-600" />}
            label="Templates Used"
            value="12"
            subtitle="of 41 available"
            color="#ecfdf5"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-600" />}
            label="Challenge Progress"
            value="67%"
            subtitle="Day 20 of 30"
            color="#fffbeb"
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5 text-rose-600" />}
            label="Subscription"
            value="Pro"
            subtitle="Renews Apr 15"
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
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <Brain className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Created &quot;Q2 Brand Awareness&quot; strategy
                  </p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <LayoutTemplate className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Used &quot;Social Media Audit&quot; template
                  </p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Trophy className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Completed Day 20 of the 30-Day Challenge
                  </p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100">
                  <CreditCard className="h-4 w-4 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Upgraded to Professional plan
                  </p>
                  <p className="text-xs text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
