import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const STRATEGY_SECTIONS = [
  {
    id: "brand-identity",
    title: "Brand Identity",
    prompt:
      "Define the brand identity including brand essence, personality, core values, tone of voice, and visual identity principles. Explain how these elements work together to create a cohesive brand experience.",
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    prompt:
      "Provide a detailed market analysis including market size estimation, key trends, growth drivers, potential threats, and opportunities. Reference relevant industry dynamics for the brand's sector.",
  },
  {
    id: "competitive-positioning",
    title: "Competitive Positioning",
    prompt:
      "Analyze the competitive landscape. Define a positioning statement, create a competitive matrix, identify key differentiators, and outline how to defend against competitive threats.",
  },
  {
    id: "target-audience",
    title: "Target Audience Deep Dive",
    prompt:
      "Create detailed target audience profiles including demographics, psychographics, pain points, motivations, buying behavior, preferred channels, and customer personas. Include at least 2 distinct personas.",
  },
  {
    id: "value-proposition",
    title: "Unique Value Proposition",
    prompt:
      "Develop a unique value proposition framework including the core value proposition statement, value proposition canvas (customer jobs, pains, gains), and how the UVP differentiates from competitors.",
  },
  {
    id: "messaging-framework",
    title: "Messaging Framework",
    prompt:
      "Build a comprehensive messaging framework including the brand story, elevator pitch, key messages for each audience segment, tagline options, and messaging do's and don'ts.",
  },
  {
    id: "visual-strategy",
    title: "Visual Strategy",
    prompt:
      "Define the visual strategy including color psychology recommendations, typography guidelines, imagery style, layout principles, and how visual elements should adapt across different channels and touchpoints.",
  },
  {
    id: "channel-strategy",
    title: "Channel Strategy",
    prompt:
      "Create a comprehensive marketing channels strategy with a channel priority matrix, budget allocation per channel, expected ROI, and specific tactical recommendations for each channel.",
  },
  {
    id: "content-pillars",
    title: "Content Pillars",
    prompt:
      "Define 4-6 content pillars with descriptions, example topics for each, content formats best suited to each pillar, and a content mix ratio. Explain how pillars map to audience needs and business goals.",
  },
  {
    id: "campaign-ideas",
    title: "Campaign Ideas",
    prompt:
      "Propose 4-6 creative campaign ideas with objectives, target audience, key messages, channels, timeline, expected outcomes, and success metrics for each campaign.",
  },
  {
    id: "metrics-kpis",
    title: "Metrics & KPIs",
    prompt:
      "Define the analytics and measurement framework including north star metric, KPI dashboard with targets, reporting cadence, attribution model, and tools recommendations.",
  },
  {
    id: "budget-allocation",
    title: "Budget Allocation",
    prompt:
      "Provide a recommended budget allocation framework across channels, campaigns, and time periods. Include percentage breakdowns, expected ROI per channel, and guidelines for budget optimization.",
  },
  {
    id: "90-day-roadmap",
    title: "90-Day Roadmap",
    prompt:
      "Create a phased 90-day implementation roadmap broken into Phase 1 (Days 1-30), Phase 2 (Days 31-60), and Phase 3 (Days 61-90) with specific action items, milestones, and deliverables for each phase.",
  },
  {
    id: "risk-mitigation",
    title: "Risk Mitigation",
    prompt:
      "Identify key risks with likelihood and impact ratings. Provide mitigation strategies for each risk and contingency plans for the top scenarios that could derail the strategy.",
  },
  {
    id: "next-steps",
    title: "Next Steps",
    prompt:
      "Outline the immediate next steps to begin executing this strategy. Include quick wins for the first week, key decisions that need to be made, resources required, and a prioritized action checklist.",
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
- Use markdown formatting for structure (headings, bullet points, bold text)
- Every section MUST end with two special subsections:
  1. "## Key Takeaways" - 4-6 bullet points summarizing the most important insights
  2. "## Recommended Actions" - 4-6 specific, actionable next steps`;

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
Industry/Description: ${project.description || "Not specified"}${responsesContext}`;

    const anthropic = new Anthropic({ apiKey });

    // Build the sections list for the prompt
    const sectionsPrompt = STRATEGY_SECTIONS.map(
      (s, i) =>
        `${i + 1}. Section ID: "${s.id}" | Title: "${s.title}"\n   Instructions: ${s.prompt}`
    ).join("\n\n");

    // Generate ALL 15 sections in a single API call
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a complete 15-section marketing strategy for the following brand.

Project Context:
${projectContext}

Generate ALL of the following sections. Each section should be 400-600 words with markdown formatting (headings, bullet points, bold text, tables where appropriate).

CRITICAL: Every section MUST include these two subsections at the end:
- "## Key Takeaways" with 4-6 bullet points
- "## Recommended Actions" with 4-6 action items

${sectionsPrompt}

IMPORTANT: Respond ONLY with a valid JSON object in this exact format (no markdown code fences, no extra text):
{"sections": [{"id": "brand-identity", "title": "Brand Identity", "content": "markdown content here..."}, {"id": "market-analysis", "title": "Market Analysis", "content": "markdown content here..."}, ...]}

Make sure to include all 15 sections in order. Each "content" field should contain the full markdown-formatted section content including the Key Takeaways and Recommended Actions subsections.`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const rawText =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    // Parse the JSON response
    let generatedSections: Array<{
      id: string;
      title: string;
      content: string;
      status: "complete" | "error";
      qualityScore: number;
    }> = [];

    try {
      // Try to extract JSON from the response (handle possible markdown fences)
      let jsonText = rawText.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");
      }
      const parsed = JSON.parse(jsonText);
      const sections = parsed.sections || [];

      generatedSections = STRATEGY_SECTIONS.map((expected) => {
        const found = sections.find(
          (s: { id: string; title: string; content: string }) =>
            s.id === expected.id
        );

        if (found && found.content) {
          const content = found.content;
          // Simple quality heuristic based on content length and structure
          const wordCount = content.split(/\s+/).length;
          const hasHeadings = /^#{1,3}\s/m.test(content);
          const hasBullets = /^[-*]\s/m.test(content);
          const hasKeyTakeaways = /key takeaway/i.test(content);
          const hasRecommendedActions = /recommended action/i.test(content);
          let qualityScore = 70;
          if (wordCount > 200) qualityScore += 10;
          if (wordCount > 400) qualityScore += 5;
          if (hasHeadings) qualityScore += 3;
          if (hasBullets) qualityScore += 3;
          if (hasKeyTakeaways) qualityScore += 4;
          if (hasRecommendedActions) qualityScore += 4;
          qualityScore = Math.min(qualityScore, 99);

          return {
            id: expected.id,
            title: expected.title,
            content,
            status: "complete" as const,
            qualityScore,
          };
        }

        return {
          id: expected.id,
          title: expected.title,
          content:
            "This section could not be generated. Please try regenerating.",
          status: "error" as const,
          qualityScore: 0,
        };
      });
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", parseErr);
      // Fallback: treat entire response as a single section and mark rest as error
      generatedSections = STRATEGY_SECTIONS.map((expected, idx) => {
        if (idx === 0 && rawText.length > 100) {
          return {
            id: expected.id,
            title: expected.title,
            content: rawText,
            status: "complete" as const,
            qualityScore: 75,
          };
        }
        return {
          id: expected.id,
          title: expected.title,
          content: "Failed to parse AI response. Please try regenerating.",
          status: "error" as const,
          qualityScore: 0,
        };
      });
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
