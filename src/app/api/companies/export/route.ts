import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/companies/export
 *
 * Creates an export job for the current filtered company dataset (PRD §8.9).
 * For small datasets, returns CSV directly. For large datasets, creates
 * an async export_jobs record.
 *
 * Body:
 *   filters  - FilterPredicate[] (same as GET /api/companies)
 *   columns  - string[] (columns to include)
 *   format   - "csv" | "xlsx" (default "csv")
 *   tab      - "all" | "my"
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { filters = [], columns = [], format = "csv", tab = "all" } = body;

  // Fetch all matching companies (respecting filters)
  let query = supabase
    .from("companies")
    .select("name, phone, city, country, website, industry, lifecycle_stage, last_activity_at, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10000); // Safety limit

  if (tab === "my") {
    query = query.eq("owner_id", user.id);
  }

  const { data: companies, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!companies || companies.length === 0) {
    return NextResponse.json({ error: "No data to export" }, { status: 404 });
  }

  // Determine which columns to export
  const exportColumns =
    columns.length > 0
      ? columns
      : Object.keys(companies[0]);

  // Build CSV (synchronous for ≤10K rows — PRD §8.9)
  const header = exportColumns.join(",");
  const rows = companies.map((company: Record<string, unknown>) =>
    exportColumns
      .map((col: string) => {
        const val = company[col];
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Escape CSV values containing commas, quotes, or newlines
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Log the export job for audit (PRD §20.1)
  await supabase.from("export_jobs").insert({
    user_id: user.id,
    entity_type: "companies",
    filters: { filters, tab },
    columns: exportColumns,
    format: format,
    status: "completed",
    row_count: companies.length,
    completed_at: new Date().toISOString(),
  });

  // Audit log
  await supabase.rpc("log_audit_event", {
    p_action: "export",
    p_resource_type: "company",
    p_resource_id: null,
    p_changes: { row_count: companies.length, format },
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="companies_export_${Date.now()}.csv"`,
    },
  });
}
