import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

/**
 * GET /api/admin/users — List all users with entitlements and credits
 * Supports ?search=, ?role=, ?tier=, ?page=, ?limit=
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;

  const url = request.nextUrl;
  const search = url.searchParams.get("search") || "";
  const roleFilter = url.searchParams.get("role") || "";
  const tierFilter = url.searchParams.get("tier") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  try {
    // Build the query for user profiles with auth email
    let query = supabase
      .from("user_profiles")
      .select(
        `id, company_name, industry, role, onboarding_completed,
         last_login_at, created_at, updated_at`,
        { count: "exact" }
      );

    // Role filter
    if (roleFilter && ["user", "admin", "moderator"].includes(roleFilter)) {
      query = query.eq("role", roleFilter);
    }

    // Pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: profiles, count, error } = await query;

    if (error) {
      console.error("Admin users list error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ users: [], total: 0, page, limit });
    }

    // Get auth user emails for these profiles
    // We need to fetch from auth.users — but via RPC or admin API
    // Since we're using anon key with RLS, we'll get emails from Supabase auth admin
    // For now, we'll fetch emails by querying the auth metadata
    const userIds = profiles.map((p) => p.id);

    // Fetch entitlements for all these users
    const { data: entitlements } = await supabase
      .from("user_entitlements")
      .select("user_id, entitlement, status, expires_at, source_product_id")
      .in("user_id", userIds)
      .eq("status", "active");

    // Fetch credits for all these users
    const { data: credits } = await supabase
      .from("strategy_credits")
      .select("user_id, credits_remaining, credits_total, credits_used, unlimited")
      .in("user_id", userIds);

    // Group entitlements and credits by user
    const entitlementsByUser = new Map<string, typeof entitlements>();
    for (const e of entitlements ?? []) {
      const list = entitlementsByUser.get(e.user_id) ?? [];
      list.push(e);
      entitlementsByUser.set(e.user_id, list);
    }

    const creditsByUser = new Map<string, (typeof credits extends (infer T)[] | null ? T : never)>();
    for (const c of credits ?? []) {
      creditsByUser.set(c.user_id, c);
    }

    // Derive tier name from entitlements (same logic as entitlements.ts)
    function deriveTier(userEntitlements: typeof entitlements): string {
      if (!userEntitlements || userEntitlements.length === 0) return "Free";
      const has = (type: string) =>
        userEntitlements.some((e) => e.entitlement === type && e.status === "active");
      if (has("agency")) return "Agency";
      if (has("circle") && has("strategy_builder") && has("templates")) return "Professional";
      if (has("templates") && has("strategy_builder")) return "Templates + Strategy";
      if (has("templates")) return "Essentials";
      if (has("strategy_builder")) return "Strategy Builder";
      return "Free";
    }

    // Build user objects
    const users = profiles.map((profile) => {
      const userEnts = entitlementsByUser.get(profile.id) ?? [];
      const userCredits = creditsByUser.get(profile.id);
      return {
        ...profile,
        email: null as string | null, // will be populated below if possible
        entitlements: userEnts,
        credits: userCredits ?? {
          credits_remaining: 0,
          credits_total: 0,
          credits_used: 0,
          unlimited: false,
        },
        tierName: profile.role === "admin" ? "Admin (Full Access)" : deriveTier(userEnts),
      };
    });

    // Try to get emails — Supabase anon key can't access auth.users,
    // but we can use the admin listUsers if service role key is available
    // We'll handle this client-side or use a workaround
    // For now, emails will need to be fetched via a separate mechanism
    // or stored in user_profiles (which they currently aren't)

    // Filter by search if provided (search on company_name, id)
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        (u) =>
          u.company_name?.toLowerCase().includes(searchLower) ||
          u.id.toLowerCase().includes(searchLower)
      );
    }

    // Filter by tier if provided
    if (tierFilter) {
      filteredUsers = filteredUsers.filter(
        (u) => u.tierName.toLowerCase().includes(tierFilter.toLowerCase())
      );
    }

    return NextResponse.json({
      users: filteredUsers,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("Admin users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users — Create a new user
 * Body: { email, password, company_name?, industry?, role? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { email, password, company_name, industry, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["user", "admin", "moderator"];
    const userRole = role && validRoles.includes(role) ? role : "user";

    // Create user via Supabase Auth
    // Note: This uses the anon key — for admin user creation,
    // we sign up the user. The auth trigger will create the profile.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: company_name || null,
        },
      },
    });

    if (authError) {
      // Check for duplicate email
      if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Update the profile with additional fields
    // The auth trigger creates a basic profile, we update it here
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        company_name: company_name || null,
        industry: industry || null,
        role: userRole,
      })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
    }

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          company_name,
          industry,
          role: userRole,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Admin create user error:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
