"use client";

import {
  BarChart3,
  Eye,
  MousePointerClick,
  Mail,
  Send,
  Calendar,
  Share2,
  Plus,
  Filter,
  Users,
} from "lucide-react";

interface MetricRollup {
  entity_type: string;
  entity_id: string;
  metric_name: string;
  bucket_start?: string;
  value: number;
}

interface EmailDraftSummary {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  sent_at: string | null;
}

interface Props {
  landingPageMetrics: MetricRollup[];
  emailMetrics: MetricRollup[];
  emailDraftSummaries: EmailDraftSummary[];
  dashboardTitle: string;
  dashboardAccessLevel: string;
}

function MetricCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
        {value}
      </p>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}

function EmptyWidget({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[var(--navy)]">{title}</h3>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="mb-3 h-10 w-10 text-gray-200" />
        <p className="text-sm text-gray-400">No data to show</p>
        <p className="mt-1 text-xs text-gray-300">
          Data will appear once events are tracked
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsClient({
  landingPageMetrics,
  emailMetrics,
  emailDraftSummaries,
  dashboardTitle,
  dashboardAccessLevel,
}: Props) {

  // Aggregate landing page metrics by page
  const lpByPage = new Map<
    string,
    {
      views: number;
      submissions: number;
      cta_views: number;
      cta_clicks: number;
      entrances: number;
      exits: number;
      bounces: number;
    }
  >();

  for (const m of landingPageMetrics) {
    if (!lpByPage.has(m.entity_id)) {
      lpByPage.set(m.entity_id, {
        views: 0,
        submissions: 0,
        cta_views: 0,
        cta_clicks: 0,
        entrances: 0,
        exits: 0,
        bounces: 0,
      });
    }
    const entry = lpByPage.get(m.entity_id)!;
    switch (m.metric_name) {
      case "page_view":
        entry.views += m.value;
        break;
      case "form_submission":
        entry.submissions += m.value;
        break;
      case "cta_view":
        entry.cta_views += m.value;
        break;
      case "cta_click":
        entry.cta_clicks += m.value;
        break;
      case "entrance":
        entry.entrances += m.value;
        break;
      case "exit":
        entry.exits += m.value;
        break;
      case "bounce":
        entry.bounces += m.value;
        break;
    }
  }

  const lpRows = Array.from(lpByPage.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.views - a.views);

  // Aggregate email totals from drafts
  const emailTotals = emailDraftSummaries.reduce(
    (acc, d) => ({
      sent: acc.sent + d.total_sent,
      opened: acc.opened + d.total_opened,
      clicked: acc.clicked + d.total_clicked,
    }),
    { sent: 0, opened: 0, clicked: 0 }
  );

  const clickRate =
    emailTotals.sent > 0
      ? ((emailTotals.clicked / emailTotals.sent) * 100).toFixed(1)
      : "0";

  const openRate =
    emailTotals.sent > 0
      ? ((emailTotals.opened / emailTotals.sent) * 100).toFixed(1)
      : "0";

  // Aggregate email metrics by day for time-series display
  const emailByDay = new Map<string, { sent: number; opened: number; clicked: number }>();
  for (const m of emailMetrics) {
    const day = m.bucket_start?.split("T")[0] ?? "unknown";
    if (!emailByDay.has(day)) {
      emailByDay.set(day, { sent: 0, opened: 0, clicked: 0 });
    }
    const entry = emailByDay.get(day)!;
    switch (m.metric_name) {
      case "email_sent":
        entry.sent += m.value;
        break;
      case "email_opened":
        entry.opened += m.value;
        break;
      case "email_clicked":
        entry.clicked += m.value;
        break;
    }
  }

  const emailDayRows = Array.from(emailByDay.entries())
    .map(([day, data]) => ({ day, ...data }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const hasLandingPageData = lpRows.length > 0;
  const hasEmailData = emailTotals.sent > 0 || emailDayRows.length > 0;

  const accessLabel =
    dashboardAccessLevel === "everyone_can_edit"
      ? "Everyone can edit"
      : dashboardAccessLevel === "everyone_can_view"
        ? "Everyone can view"
        : "Restricted";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Dashboard header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--navy)]">
              {dashboardTitle}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-3.5 w-3.5" />
              Assigned: {accessLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              <Plus className="h-4 w-4" />
              Add content
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="h-3.5 w-3.5" />
            Quick filters
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Advanced filters
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Calendar className="h-3 w-3" />
              In the last 30 days
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              Compared To | Previous 30 days
            </span>
          </div>
        </div>

        {/* Email Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Sent"
            value={emailTotals.sent.toLocaleString()}
            icon={<Send className="h-5 w-5 text-blue-600" />}
            color="#eff6ff"
            subtitle="Total emails sent"
          />
          <MetricCard
            label="Opened"
            value={emailTotals.opened.toLocaleString()}
            icon={<Eye className="h-5 w-5 text-emerald-600" />}
            color="#ecfdf5"
            subtitle={`${openRate}% open rate`}
          />
          <MetricCard
            label="Clicked"
            value={emailTotals.clicked.toLocaleString()}
            icon={<MousePointerClick className="h-5 w-5 text-amber-600" />}
            color="#fffbeb"
            subtitle={`${clickRate}% click rate`}
          />
          <MetricCard
            label="Campaigns"
            value={String(emailDraftSummaries.length)}
            icon={<Mail className="h-5 w-5 text-rose-600" />}
            color="#fff1f2"
            subtitle="Emails sent in period"
          />
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Landing pages by most total views */}
          {hasLandingPageData ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-[var(--navy)]">
                Landing pages by most total views
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Page
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        Views
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        Submissions
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        Rate
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        CTA Views
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        CTA Clicks
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                        CTA Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lpRows.slice(0, 10).map((row) => {
                      const subRate =
                        row.views > 0
                          ? ((row.submissions / row.views) * 100).toFixed(1)
                          : "0";
                      const ctaRate =
                        row.cta_views > 0
                          ? ((row.cta_clicks / row.cta_views) * 100).toFixed(1)
                          : "0";
                      return (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {row.id.slice(0, 8)}...
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {row.views.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {row.submissions.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {subRate}%
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {row.cta_views.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {row.cta_clicks.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-sm text-gray-600">
                            {ctaRate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyWidget title="Landing pages by most total views" />
          )}

          {/* Landing page views & submissions chart placeholder */}
          <EmptyWidget title="Landing page total views and form submissions" />

          {/* Email engagement over time */}
          {hasEmailData && emailDayRows.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[var(--navy)]">
                Email sent, opened, and clicks by send date
              </h3>
              <div className="space-y-2">
                {emailDayRows.slice(-14).map((row) => {
                  const maxVal = Math.max(row.sent, 1);
                  return (
                    <div key={row.day} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs text-gray-400">
                        {new Date(row.day).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex flex-1 gap-1">
                        <div
                          className="h-4 rounded-sm bg-blue-400"
                          style={{ width: `${(row.sent / maxVal) * 100}%` }}
                          title={`Sent: ${row.sent}`}
                        />
                        <div
                          className="h-4 rounded-sm bg-emerald-400"
                          style={{ width: `${(row.opened / maxVal) * 100}%` }}
                          title={`Opened: ${row.opened}`}
                        />
                        <div
                          className="h-4 rounded-sm bg-amber-400"
                          style={{ width: `${(row.clicked / maxVal) * 100}%` }}
                          title={`Clicked: ${row.clicked}`}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> Sent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Opened
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Clicked
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyWidget title="Email sent, opened, and clicks by send date" />
          )}

          {/* Marketing email sent totals */}
          {hasEmailData ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[var(--navy)]">
                Marketing email sent totals with engagement rates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-blue-700">
                    {emailTotals.sent.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-500">Sent</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4 text-center">
                  <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-emerald-700">
                    {emailTotals.opened.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-500">Opened</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4 text-center">
                  <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-amber-700">
                    {emailTotals.clicked.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-500">Clicked</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-4 text-center">
                  <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-rose-700">
                    {clickRate}%
                  </p>
                  <p className="text-xs text-rose-500">Click Rate</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyWidget title="Marketing email sent totals with engagement rates" />
          )}
        </div>
      </div>
    </div>
  );
}
