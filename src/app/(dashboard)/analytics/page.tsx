import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Compute date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDate = thirtyDaysAgo.toISOString();
  const endDate = now.toISOString();
  // Fetch landing page rollups
  const { data: landingPageMetrics } = await supabase
    .from("metric_rollups")
    .select("entity_type, entity_id, metric_name, value")
    .eq("user_id", user.id)
    .eq("entity_type", "landing_page")
    .eq("granularity", "daily")
    .gte("bucket_start", startDate)
    .lte("bucket_end", endDate);

  // Fetch email rollups
  const { data: emailMetrics } = await supabase
    .from("metric_rollups")
    .select("entity_type, entity_id, metric_name, bucket_start, value")
    .eq("user_id", user.id)
    .eq("entity_type", "campaign")
    .eq("granularity", "daily")
    .gte("bucket_start", startDate)
    .lte("bucket_end", endDate);

  // Fetch email draft totals for the summary cards
  const { data: emailDrafts } = await supabase
    .from("marketing_email_drafts")
    .select("total_sent, total_opened, total_clicked, sent_at")
    .eq("user_id", user.id)
    .eq("status", "sent")
    .gte("sent_at", startDate);

  // Fetch dashboards
  const { data: dashboards } = await supabase
    .from("dashboards")
    .select("id, title, access_level")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  const dashboard = dashboards?.[0] ?? null;

  return (
    <AnalyticsClient
      landingPageMetrics={landingPageMetrics ?? []}
      emailMetrics={emailMetrics ?? []}
      emailDraftSummaries={emailDrafts ?? []}
      dashboardTitle={dashboard?.title ?? "Marketing Performance Overview"}
      dashboardAccessLevel={dashboard?.access_level ?? "everyone_can_edit"}
    />
  );
}
