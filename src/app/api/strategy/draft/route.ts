import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRIES, GOALS } from "@/lib/strategy/constants";

const VALID_INDUSTRIES: readonly string[] = INDUSTRIES;
const VALID_GOALS: readonly string[] = GOALS;
const VALID_BUSINESS_STAGES = ["idea", "mvp_early", "revenue_generating"];

/**
 * GET /api/strategy/draft
 *
 * Fetch the current user's active draft (status='draft').
 * Returns the draft if found, or { draft: null } if no active draft exists.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: draft, error } = await supabase
      .from("strategy_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch draft:", error);
      return NextResponse.json(
        { error: "Failed to fetch draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft });
  } catch (err) {
    console.error("Get draft error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategy/draft
 *
 * Create or update a draft with intake form data.
 * Accepts snake_case field names matching the DB schema.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      business_name,
      industry,
      custom_industry,
      business_stage,
      main_challenge,
      primary_goal,
      current_step,
    } = body;

    // Validate fields that are provided
    const errors: string[] = [];

    if (business_name !== undefined) {
      if (
        typeof business_name !== "string" ||
        business_name.trim().length === 0
      ) {
        errors.push("business_name must be a non-empty string");
      } else if (business_name.trim().length > 100) {
        errors.push("business_name must be 100 characters or fewer");
      }
    }

    if (industry !== undefined) {
      if (
        typeof industry !== "string" ||
        !VALID_INDUSTRIES.includes(industry)
      ) {
        errors.push(
          `industry must be one of: ${VALID_INDUSTRIES.join(", ")}`
        );
      }
    }

    if (custom_industry !== undefined) {
      if (
        typeof custom_industry !== "string" ||
        custom_industry.trim().length > 100
      ) {
        errors.push(
          "custom_industry must be a string of 100 characters or fewer"
        );
      }
    }

    if (business_stage !== undefined) {
      if (
        typeof business_stage !== "string" ||
        !VALID_BUSINESS_STAGES.includes(business_stage)
      ) {
        errors.push(
          `business_stage must be one of: ${VALID_BUSINESS_STAGES.join(", ")}`
        );
      }
    }

    if (main_challenge !== undefined) {
      if (typeof main_challenge !== "string") {
        errors.push("main_challenge must be a string");
      }
    }

    if (primary_goal !== undefined) {
      if (
        typeof primary_goal !== "string" ||
        !VALID_GOALS.includes(primary_goal)
      ) {
        errors.push(
          `primary_goal must be one of: ${VALID_GOALS.join(", ")}`
        );
      }
    }

    if (current_step !== undefined) {
      if (typeof current_step !== "number" || current_step < 1) {
        errors.push("current_step must be a positive number");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    // Build the update payload with only provided fields
    const updatePayload: Record<string, unknown> = {};
    if (business_name !== undefined)
      updatePayload.business_name = business_name.trim();
    if (industry !== undefined) updatePayload.industry = industry;
    if (custom_industry !== undefined)
      updatePayload.custom_industry = custom_industry.trim();
    if (business_stage !== undefined)
      updatePayload.business_stage = business_stage;
    if (main_challenge !== undefined)
      updatePayload.main_challenge = main_challenge;
    if (primary_goal !== undefined) updatePayload.primary_goal = primary_goal;
    if (current_step !== undefined) updatePayload.current_step = current_step;

    // Also set a title from business_name for the strategy_projects table
    if (business_name !== undefined) {
      updatePayload.title = business_name.trim();
    }

    // Build description from all available fields
    const descParts: string[] = [];
    if (industry) descParts.push(`Industry: ${industry === "Other" && custom_industry ? custom_industry.trim() : industry}`);
    if (business_stage) descParts.push(`Stage: ${business_stage}`);
    if (main_challenge) descParts.push(`Challenge: ${main_challenge}`);
    if (primary_goal) descParts.push(`Goal: ${primary_goal}`);
    if (descParts.length > 0) {
      updatePayload.description = descParts.join(" | ");
    }

    // Check for an existing draft
    const { data: existingDraft } = await supabase
      .from("strategy_projects")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingDraft) {
      // Update existing draft
      const { data: draft, error } = await supabase
        .from("strategy_projects")
        .update({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDraft.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update draft:", error);
        return NextResponse.json(
          { error: "Failed to update draft" },
          { status: 500 }
        );
      }

      return NextResponse.json({ draft });
    } else {
      // Create new draft
      const { data: draft, error } = await supabase
        .from("strategy_projects")
        .insert({
          user_id: user.id,
          status: "draft",
          ...updatePayload,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create draft:", error);
        return NextResponse.json(
          { error: "Failed to create draft" },
          { status: 500 }
        );
      }

      return NextResponse.json({ draft }, { status: 201 });
    }
  } catch (err) {
    console.error("Save draft error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
