import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

/**
 * GET /api/admin/users/[id] — Get a single user with full details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch entitlements
    const { data: entitlements } = await supabase
      .from("user_entitlements")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    // Fetch credits
    const { data: credits } = await supabase
      .from("strategy_credits")
      .select("*")
      .eq("user_id", id)
      .single();

    // Fetch purchases
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    // Fetch subscription (legacy)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", id)
      .single();

    // Fetch strategy projects count
    const { count: strategyCount } = await supabase
      .from("strategy_projects")
      .select("id", { count: "exact" })
      .eq("user_id", id);

    // Derive tier name
    const activeEntitlements = (entitlements ?? []).filter(
      (e) => e.status === "active"
    );
    const has = (type: string) =>
      activeEntitlements.some((e) => e.entitlement === type);
    let tierName = "Free";
    if (profile.role === "admin") tierName = "Admin (Full Access)";
    else if (has("agency")) tierName = "Agency";
    else if (has("circle") && has("strategy_builder") && has("templates"))
      tierName = "Professional";
    else if (has("templates") && has("strategy_builder"))
      tierName = "Templates + Strategy";
    else if (has("templates")) tierName = "Essentials";
    else if (has("strategy_builder")) tierName = "Strategy Builder";

    return NextResponse.json({
      user: {
        ...profile,
        entitlements: entitlements ?? [],
        activeEntitlements,
        credits: credits ?? {
          credits_remaining: 0,
          credits_total: 0,
          credits_used: 0,
          unlimited: false,
        },
        purchases: purchases ?? [],
        subscription: subscription ?? null,
        strategyCount: strategyCount ?? 0,
        tierName,
      },
    });
  } catch (err) {
    console.error("Admin get user error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id] — Update a user's profile
 * Body: { company_name?, industry?, role?, onboarding_completed?, ... }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  try {
    const body = await request.json();

    // Whitelist allowed fields
    const allowedFields = [
      "company_name",
      "company_website",
      "industry",
      "team_size",
      "role_in_company",
      "bio",
      "country",
      "timezone",
      "phone",
      "role",
      "onboarding_completed",
      "preferred_language",
      "notification_email_marketing",
      "notification_ai_insights",
      "notification_community_updates",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Validate role if being changed
    if (updates.role) {
      const validRoles = ["user", "admin", "moderator"];
      if (!validRoles.includes(updates.role as string)) {
        return NextResponse.json(
          { error: "Invalid role. Must be: user, admin, or moderator" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("Admin update user error:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] — Deactivate a user
 * We don't hard-delete; we revoke entitlements and could mark the profile.
 * Hard delete from auth would cascade to user_profiles due to FK.
 * Query param ?hard=true for actual deletion (use with caution).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase, adminId } = auth;
  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === adminId) {
    return NextResponse.json(
      { error: "Cannot delete your own admin account" },
      { status: 400 }
    );
  }

  try {
    // Check user exists
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, role")
      .eq("id", id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hard = request.nextUrl.searchParams.get("hard") === "true";

    if (hard) {
      // Hard delete — remove the auth user, which cascades to user_profiles
      // and all related tables via ON DELETE CASCADE
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) {
        // If admin API not available (no service role key), fall back to soft delete
        console.error("Hard delete failed (likely no service role key):", error);
        return NextResponse.json(
          { error: "Hard delete requires service role key. Use soft delete instead." },
          { status: 400 }
        );
      }
      return NextResponse.json({ deleted: true, mode: "hard" });
    }

    // Soft delete — revoke all active entitlements and suspend credits
    await supabase
      .from("user_entitlements")
      .update({ status: "canceled" })
      .eq("user_id", id)
      .eq("status", "active");

    await supabase
      .from("strategy_credits")
      .update({ credits_remaining: 0, unlimited: false })
      .eq("user_id", id);

    // Optionally mark the profile as deactivated by setting a specific role
    // For now, we keep the user but revoke all access
    return NextResponse.json({
      deleted: false,
      deactivated: true,
      mode: "soft",
      message: "User access revoked. All entitlements canceled and credits zeroed.",
    });
  } catch (err) {
    console.error("Admin delete user error:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
