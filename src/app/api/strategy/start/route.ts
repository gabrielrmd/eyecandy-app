import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/strategy/start
 *
 * Accepts either:
 *   { draft_id: string } — transition an existing draft to in_progress
 *   { business_name, industry, ... } — create the project directly and start
 *
 * Returns { strategy_id } for client-side navigation.
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
    const { draft_id } = body;

    if (draft_id && typeof draft_id === "string") {
      // --- Flow 1: Transition an existing draft ---
      const { data: draft, error: fetchError } = await supabase
        .from("strategy_projects")
        .select("*")
        .eq("id", draft_id)
        .eq("user_id", user.id)
        .eq("status", "draft")
        .maybeSingle();

      if (fetchError) {
        console.error("Failed to fetch draft:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch draft" },
          { status: 500 }
        );
      }

      if (!draft) {
        return NextResponse.json(
          { error: "Draft not found or already started" },
          { status: 404 }
        );
      }

      // Validate required fields
      const missingFields: string[] = [];
      if (!draft.business_name?.trim()) missingFields.push("business_name");
      if (!draft.industry?.trim()) missingFields.push("industry");
      if (
        draft.industry === "Other" &&
        !draft.custom_industry?.trim()
      ) {
        missingFields.push("custom_industry");
      }
      if (!draft.business_stage) missingFields.push("business_stage");
      if (!draft.main_challenge) missingFields.push("main_challenge");
      if (!draft.primary_goal) missingFields.push("primary_goal");

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: "Incomplete intake form", missing_fields: missingFields },
          { status: 422 }
        );
      }

      const title = `${draft.business_name} Strategy`;

      const { data: project, error: updateError } = await supabase
        .from("strategy_projects")
        .update({
          status: "in_progress",
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draft_id)
        .eq("user_id", user.id)
        .select("id")
        .single();

      if (updateError || !project) {
        console.error("Failed to start strategy:", updateError);
        return NextResponse.json(
          { error: "Failed to start strategy project" },
          { status: 500 }
        );
      }

      return NextResponse.json({ strategy_id: project.id });
    }

    // --- Flow 2: Direct create from form data ---
    const {
      business_name,
      industry,
      custom_industry,
      business_stage,
      main_challenge,
      primary_goal,
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!business_name?.trim()) missingFields.push("business_name");
    if (!industry?.trim()) missingFields.push("industry");
    if (industry === "Other" && !custom_industry?.trim()) {
      missingFields.push("custom_industry");
    }
    if (!business_stage) missingFields.push("business_stage");
    if (!main_challenge?.trim()) missingFields.push("main_challenge");
    if (!primary_goal?.trim()) missingFields.push("primary_goal");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Incomplete intake form", missing_fields: missingFields },
        { status: 422 }
      );
    }

    const resolvedIndustry =
      industry === "Other" ? custom_industry?.trim() : industry;

    const description = [
      `Industry: ${resolvedIndustry}`,
      `Stage: ${business_stage}`,
      `Challenge: ${main_challenge.trim()}`,
      `Goal: ${primary_goal}`,
    ].join(" | ");

    const { data: project, error: insertError } = await supabase
      .from("strategy_projects")
      .insert({
        user_id: user.id,
        title: business_name.trim(),
        description,
        status: "in_progress",
        business_name: business_name.trim(),
        industry,
        custom_industry: custom_industry?.trim() || null,
        business_stage,
        main_challenge: main_challenge.trim(),
        primary_goal,
      })
      .select("id")
      .single();

    if (insertError || !project) {
      console.error("Failed to create strategy:", insertError);
      return NextResponse.json(
        { error: "Failed to create strategy project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ strategy_id: project.id });
  } catch (err) {
    console.error("Start strategy error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
