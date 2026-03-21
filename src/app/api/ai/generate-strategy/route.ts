import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const STRATEGY_SECTIONS = [
  {
    id: "exec-summary",
    title: "Executive Summary",
    prompt:
      "Write a comprehensive executive summary for this brand's marketing strategy. Include the brand's mission, key objectives, target market overview, and strategic priorities. Make it compelling enough for C-suite stakeholders.",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    prompt:
      "Provide a detailed market analysis including market size estimation, key trends, growth drivers, potential threats, and opportunities. Reference relevant industry dynamics for the brand's sector.",
  },
  {
    id: "brand-positioning",
    title: "Brand Positioning",
    prompt:
      "Define the brand positioning strategy including positioning statement, brand archetype, unique selling proposition, brand personality traits, tone of voice guidelines, and competitive differentiation. Create a clear brand positioning map.",
  },
];

const SYSTEM_PROMPT = `You are Gabriel Adrian Eremia, a brand strategist with 15+ years experience in Eastern European markets. Generate detailed, actionable marketing strategy content.

When generating strategy sections, follow these principles:
- Be specific and actionable, not generic
- Include concrete metrics and KPIs where relevant
- Reference real market dynamics and trends
- Provide frameworks and templates that can be immediately applied
- Write in a professional but accessible tone
- Each section should be 400-600 words
- Use markdown formatting for structure (headings, bullet points, bold text)`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        {
          error:
            "AI service is not configured. Please set ANTHROPIC_API_KEY.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { strategy_project_id, questionnaire_responses } = body;

    if (!strategy_project_id) {
      return NextResponse.json(
        { error: "strategy_project_id is required" },
        { status: 400 }
      );
    }

    // Fetch the strategy project to get context
    const { data: project, error: projectError } = await supabase
      .from("strategy_projects")
      .select("*")
      .eq("id", strategy_project_id)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Strategy project not found" },
        { status: 404 }
      );
    }

    // Build context from questionnaire responses
    const responsesContext = questionnaire_responses
      ? `\n\nQuestionnaire Responses:\n${JSON.stringify(questionnaire_responses, null, 2)}`
      : "";

    const projectContext = `Brand/Business: ${project.title || "Unknown"}
Description: ${project.description || "No description provided"}
Industry: ${project.industry || "Not specified"}${responsesContext}`;

    const anthropic = new Anthropic({ apiKey });

    // Generate each section
    const generatedSections: Array<{
      id: string;
      title: string;
      content: string;
      status: "complete" | "error";
      qualityScore: number;
    }> = [];

    for (const section of STRATEGY_SECTIONS) {
      try {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Generate the "${section.title}" section for the following brand strategy project.

Project Context:
${projectContext}

Specific instructions for this section:
${section.prompt}

Write the section content now. Use markdown formatting.`,
            },
          ],
        });

        const textBlock = message.content.find(
          (block) => block.type === "text"
        );
        const content =
          textBlock && textBlock.type === "text"
            ? textBlock.text
            : "Failed to generate content.";

        // Simple quality heuristic based on content length and structure
        const wordCount = content.split(/\s+/).length;
        const hasHeadings = /^#{1,3}\s/m.test(content);
        const hasBullets = /^[-*]\s/m.test(content);
        let qualityScore = 70;
        if (wordCount > 200) qualityScore += 10;
        if (wordCount > 400) qualityScore += 5;
        if (hasHeadings) qualityScore += 5;
        if (hasBullets) qualityScore += 5;
        qualityScore = Math.min(qualityScore, 99);

        generatedSections.push({
          id: section.id,
          title: section.title,
          content,
          status: "complete",
          qualityScore,
        });
      } catch (sectionErr) {
        console.error(
          `Error generating section ${section.id}:`,
          sectionErr
        );
        generatedSections.push({
          id: section.id,
          title: section.title,
          content: "An error occurred while generating this section.",
          status: "error",
          qualityScore: 0,
        });
      }
    }

    // Update project status
    await supabase
      .from("strategy_projects")
      .update({ status: "completed" })
      .eq("id", strategy_project_id);

    return NextResponse.json({
      strategy_project_id,
      sections: generatedSections,
      status: "complete",
    });
  } catch (err) {
    console.error("Generate strategy error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
