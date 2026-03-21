"use client";

import {
  Users,
  Brain,
  LayoutTemplate,
  Trophy,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
} from "lucide-react";

const stats = [
  { label: "Total Users", value: "0", icon: Users, change: "+0%" },
  { label: "Strategies Generated", value: "0", icon: Brain, change: "+0%" },
  { label: "Templates Used", value: "0", icon: LayoutTemplate, change: "+0%" },
  { label: "Challenge Enrollments", value: "0", icon: Trophy, change: "+0%" },
  { label: "Monthly Revenue", value: "€0", icon: DollarSign, change: "+0%" },
  { label: "Active Subscriptions", value: "0", icon: TrendingUp, change: "+0%" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[var(--coral)]" />
            <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)]">
              Admin Dashboard
            </h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Platform overview and management
          </p>
        </div>
        <span className="rounded-full bg-[var(--coral)]/10 px-3 py-1 text-xs font-semibold text-[var(--coral)]">
          Admin
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-green-600">
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <span className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)]">
                {stat.value}
              </span>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-[var(--coral)]" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">
            Activity will appear here once users start using the platform.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Manage Users", desc: "View and manage user accounts", icon: Users },
          { label: "Content Manager", desc: "Edit templates and challenge content", icon: LayoutTemplate },
          { label: "Analytics", desc: "View detailed platform analytics", icon: TrendingUp },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-start gap-3 rounded-xl border border-border bg-white p-5 text-left transition-colors hover:bg-muted"
          >
            <action.icon className="mt-0.5 h-5 w-5 text-[var(--teal)]" />
            <div>
              <h3 className="font-semibold text-sm">{action.label}</h3>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
