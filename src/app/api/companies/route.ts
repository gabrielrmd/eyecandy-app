import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FilterPredicate } from "@/lib/types/crm";

/**
 * GET /api/companies
 *
 * Server-side search, filter, sort, and pagination for the Companies list.
 * Supports "All companies" and "My companies" tabs (PRD §8.3–8.8, §8.13).
 *
 * Query params:
 *   page       - Page number (default 1)
 *   per_page   - Items per page (default 25, max 100)
 *   search     - Full-text search on company name
 *   tab        - "all" | "my" (default "all")
 *   sort_field  - Column to sort by
 *   sort_dir    - "asc" | "desc"
 *   filters    - JSON-encoded FilterPredicate[]
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
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const perPage = Math.min(100, Math.max(1, parseInt(params.get("per_page") ?? "25", 10)));
  const search = params.get("search")?.trim() ?? "";
  const tab = params.get("tab") ?? "all";
  const sortField = params.get("sort_field") ?? "created_at";
  const sortDir = params.get("sort_dir") === "asc" ? true : false;

  // Parse filters
  let filters: FilterPredicate[] = [];
  try {
    const raw = params.get("filters");
    if (raw) filters = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid filters JSON" }, { status: 400 });
  }

  // Allowed sort columns (prevent arbitrary column injection)
  const allowedSortColumns = new Set([
    "name", "created_at", "updated_at", "last_activity_at",
    "city", "country", "industry", "lifecycle_stage", "phone",
  ]);
  const safeSortField = allowedSortColumns.has(sortField) ? sortField : "created_at";

  // Build query
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("companies")
    .select(
      "id, name, owner_id, phone, city, country, website, industry, description, employee_count, lifecycle_stage, last_activity_at, custom_properties, created_at, updated_at, user_profiles!companies_owner_id_fkey(id, company_name, avatar_url)",
      { count: "exact" }
    )
    .eq("user_id", user.id);

  // Tab scope (PRD §8.13)
  if (tab === "my") {
    query = query.eq("owner_id", user.id);
  }

  // Search (PRD §8.3)
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // Apply filters (PRD §8.4)
  for (const f of filters) {
    // Sanitize field name — only allow known columns
    const safeFields = new Set([
      "name", "phone", "city", "country", "industry", "lifecycle_stage",
      "website", "employee_count", "created_at", "last_activity_at",
    ]);
    if (!safeFields.has(f.field)) continue;

    switch (f.operator) {
      case "eq":
        query = query.eq(f.field, f.value);
        break;
      case "neq":
        query = query.neq(f.field, f.value);
        break;
      case "contains":
        query = query.ilike(f.field, `%${f.value}%`);
        break;
      case "gt":
        query = query.gt(f.field, f.value);
        break;
      case "lt":
        query = query.lt(f.field, f.value);
        break;
      case "gte":
        query = query.gte(f.field, f.value);
        break;
      case "lte":
        query = query.lte(f.field, f.value);
        break;
      case "is_empty":
        query = query.is(f.field, null);
        break;
      case "is_not_empty":
        query = query.not(f.field, "is", null);
        break;
      case "in":
        if (Array.isArray(f.value)) {
          query = query.in(f.field, f.value);
        }
        break;
    }
  }

  // Sort (PRD §8.5)
  query = query.order(safeSortField, { ascending: sortDir });

  // Pagination (PRD §8.8)
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    total_count: count ?? 0,
    page,
    per_page: perPage,
    has_more: (count ?? 0) > from + perPage,
  });
}
