import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/admin";

/**
 * POST /api/admin/users/[id]/credits — Adjust credits
 * Body: { amount, reason?, unlimited? }
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
    const { amount, reason, unlimited } = body;

    // Handle unlimited toggle
    if (typeof unlimited === "boolean") {
      const { error } = await supabase
        .from("strategy_credits")
        .upsert(
          {
            user_id: id,
            unlimited,
            credits_remaining: unlimited ? 0 : (amount ?? 0),
            credits_total: unlimited ? 0 : (amount ?? 0),
            credits_used: 0,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        credits: { unlimited, credits_remaining: unlimited ? 0 : (amount ?? 0) },
      });
    }

    // Handle credit amount adjustment
    if (typeof amount !== "number" || amount === 0) {
      return NextResponse.json(
        { error: "Amount must be a non-zero number" },
        { status: 400 }
      );
    }

    // Get current balance
    const { data: existing } = await supabase
      .from("strategy_credits")
      .select("credits_remaining, credits_total, credits_used")
      .eq("user_id", id)
      .single();

    if (existing) {
      const newRemaining = Math.max(0, existing.credits_remaining + amount);
      const newTotal =
        amount > 0
          ? existing.credits_total + amount
          : existing.credits_total;

      await supabase
        .from("strategy_credits")
        .update({
          credits_remaining: newRemaining,
          credits_total: newTotal,
        })
        .eq("user_id", id);

      // Log transaction
      await supabase.from("credit_transactions").insert({
        user_id: id,
        amount,
        reason: reason || "admin_grant",
        balance_after: newRemaining,
      });

      return NextResponse.json({
        credits: {
          credits_remaining: newRemaining,
          credits_total: newTotal,
          credits_used: existing.credits_used,
        },
      });
    } else {
      // No credit record exists — create one
      const newRemaining = Math.max(0, amount);
      await supabase.from("strategy_credits").insert({
        user_id: id,
        credits_remaining: newRemaining,
        credits_total: newRemaining,
        credits_used: 0,
        unlimited: false,
      });

      await supabase.from("credit_transactions").insert({
        user_id: id,
        amount,
        reason: reason || "admin_grant",
        balance_after: newRemaining,
      });

      return NextResponse.json({
        credits: {
          credits_remaining: newRemaining,
          credits_total: newRemaining,
          credits_used: 0,
        },
      });
    }
  } catch (err) {
    console.error("Admin credits error:", err);
    return NextResponse.json(
      { error: "Failed to adjust credits" },
      { status: 500 }
    );
  }
}
