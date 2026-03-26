import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/analytics/metrics
 *
 * Dashboard widget data endpoint (PRD §12.3–12.8).
 * Queries pre-aggregated metric_rollups for time-windowed metrics
 * with optional comparison period.
 *
 * Query params:
 *   entity_type   - "landing_page" | "campaign" (required)
 *   metric_names  - Comma-separated metric names (required)
 *   start_date    - ISO date string (required)
 *   end_date      - ISO date string (required)
 *   compare_start - ISO date string (optional, for comparison window)
 *   compare_end   - ISO date string (optional)
 *   entity_id     - Filter to specific entity (optional)
 *   granularity   - "hourly" | "daily" | "weekly" | "monthly" (default "daily")
 *   group_by      - Group results by entity_id (optional, "entity_id")
 *   order_by      - "value_desc" | "value_asc" (default "value_desc")
 *   limit         - Max results when grouped (default 10)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;

  const entityType = params.get("entity_type");
  const metricNamesRaw = params.get("metric_names");
  const startDate = params.get("start_date");
  const endDate = params.get("end_date");
  const compareStart = params.get("compare_start");
  const compareEnd = params.get("compare_end");
  const entityId = params.get("entity_id");
  const granularity = params.get("granularity") ?? "daily";
  const groupBy = params.get("group_by");
  const orderBy = params.get("order_by") ?? "value_desc";
  const limit = Math.min(100, parseInt(params.get("limit") ?? "10", 10));

  if (!entityType || !metricNamesRaw || !startDate || !endDate) {
    return NextResponse.json(
      { error: "entity_type, metric_names, start_date, and end_date are required" },
      { status: 400 }
    );
  }

  const metricNames = metricNamesRaw.split(",").map((s) => s.trim());

  // ─── Primary window query ─────────────────────────────────────
  let primaryQuery = supabase
    .from("metric_rollups")
    .select("entity_type, entity_id, metric_name, bucket_start, bucket_end, value")
    .eq("user_id", user.id)
    .eq("entity_type", entityType)
    .eq("granularity", granularity)
    .in("metric_name", metricNames)
    .gte("bucket_start", startDate)
    .lte("bucket_end", endDate);

  if (entityId) {
    primaryQuery = primaryQuery.eq("entity_id", entityId);
  }

  primaryQuery = primaryQuery.order("value", {
    ascending: orderBy === "value_asc",
  });

  if (groupBy === "entity_id") {
    primaryQuery = primaryQuery.limit(limit);
  }

  const { data: primaryData, error: primaryError } = await primaryQuery;

  if (primaryError) {
    return NextResponse.json({ error: primaryError.message }, { status: 500 });
  }

  // ─── Comparison window query (PRD §12.5) ──────────────────────
  let comparisonData = null;
  if (compareStart && compareEnd) {
    let compQuery = supabase
      .from("metric_rollups")
      .select("entity_type, entity_id, metric_name, bucket_start, bucket_end, value")
      .eq("user_id", user.id)
      .eq("entity_type", entityType)
      .eq("granularity", granularity)
      .in("metric_name", metricNames)
      .gte("bucket_start", compareStart)
      .lte("bucket_end", compareEnd);

    if (entityId) {
      compQuery = compQuery.eq("entity_id", entityId);
    }

    const { data: compData } = await compQuery;
    comparisonData = compData ?? [];
  }

  // Determine has_data flag (PRD §12.6)
  const hasData = (primaryData?.length ?? 0) > 0;

  return NextResponse.json({
    primary: primaryData ?? [],
    comparison: comparisonData,
    has_data: hasData,
  });
}
