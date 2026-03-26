import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

/**
 * POST /api/admin/users/[id]/entitlements — Grant an entitlement
 * Body: { entitlement, source_product_id?, expires_at?, notes? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  try {
    const body = await request.json();
    const { entitlement, source_product_id, expires_at, notes } = body;

    const validEntitlements = [
      "templates",
      "strategy_builder",
      "circle",
      "agency",
      "consulting",
    ];

    if (!entitlement || !validEntitlements.includes(entitlement)) {
      return NextResponse.json(
        {
          error: `Invalid entitlement. Must be one of: ${validEntitlements.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Expire any existing active entitlement of same type
    await supabase
      .from("user_entitlements")
      .update({ status: "expired" })
      .eq("user_id", id)
      .eq("entitlement", entitlement)
      .eq("status", "active");

    // Create new entitlement
    const { data, error } = await supabase
      .from("user_entitlements")
      .insert({
        user_id: id,
        entitlement,
        status: "active",
        source_product_id: source_product_id || null,
        expires_at: expires_at || null,
        granted_by: "admin",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entitlement: data }, { status: 201 });
  } catch (err) {
    console.error("Admin grant entitlement error:", err);
    return NextResponse.json(
      { error: "Failed to grant entitlement" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]/entitlements — Revoke an entitlement
 * Body: { entitlement }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (isErrorResponse(auth)) return auth;
  const { supabase } = auth;
  const { id } = await params;

  try {
    const body = await request.json();
    const { entitlement } = body;

    if (!entitlement) {
      return NextResponse.json(
        { error: "Entitlement type required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_entitlements")
      .update({ status: "canceled" })
      .eq("user_id", id)
      .eq("entitlement", entitlement)
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ revoked: true });
  } catch (err) {
    console.error("Admin revoke entitlement error:", err);
    return NextResponse.json(
      { error: "Failed to revoke entitlement" },
      { status: 500 }
    );
  }
}
