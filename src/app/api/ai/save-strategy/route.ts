import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { strategy_project_id, sections } = body;

    if (!strategy_project_id || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: "strategy_project_id and sections array required" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("strategy_projects")
      .select("id, title")
      .eq("id", strategy_project_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json(
        { error: "Strategy project not found" },
        { status: 404 }
      );
    }

    // Calculate average quality score
    const completedSections = sections.filter(
      (s: { status: string }) => s.status === "complete"
    );
    const avgScore =
      completedSections.length > 0
        ? completedSections.reduce(
            (sum: number, s: { qualityScore: number }) =>
              sum + s.qualityScore,
            0
          ) /
          completedSections.length /
          10
        : 0;

    // Delete any existing strategy for this project
    const { data: existingStrategy } = await supabase
      .from("strategies")
      .select("id")
      .eq("strategy_project_id", strategy_project_id)
      .maybeSingle();

    if (existingStrategy) {
      await supabase
        .from("strategy_sections")
        .delete()
        .eq("strategy_id", existingStrategy.id);
      await supabase
        .from("strategies")
        .delete()
        .eq("id", existingStrategy.id);
    }

    // Create strategy row
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .insert({
        strategy_project_id,
        user_id: user.id,
        title: project.title || "Strategy",
        generation_status: "completed",
        overall_quality_score: Math.round(avgScore * 10) / 10,
        generated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (strategyError || !strategy) {
      console.error("Failed to save strategy:", strategyError);
      // Still update project status
      await supabase
        .from("strategy_projects")
        .update({ status: "completed" })
        .eq("id", strategy_project_id);

      return NextResponse.json({
        saved: false,
        error: strategyError?.message || "Failed to create strategy record",
      });
    }

    // Insert all section rows
    const sectionRows = sections.map(
      (
        section: { id: string; title: string; content: string; qualityScore: number },
        idx: number
      ) => ({
        strategy_id: strategy.id,
        section_number: idx + 1,
        section_title: section.title,
        section_type: section.id,
        content: { markdown: section.content },
        quality_score: Math.round(section.qualityScore) / 10,
        generation_model: "claude-sonnet-4-20250514",
      })
    );

    const { error: sectionsError } = await supabase
      .from("strategy_sections")
      .insert(sectionRows);

    if (sectionsError) {
      console.error("Failed to save sections:", sectionsError);
    }

    // Update project status and link
    await supabase
      .from("strategy_projects")
      .update({
        status: "completed",
        generated_strategy_id: strategy.id,
      })
      .eq("id", strategy_project_id);

    return NextResponse.json({ saved: true, strategy_id: strategy.id });
  } catch (err) {
    console.error("Save strategy error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
