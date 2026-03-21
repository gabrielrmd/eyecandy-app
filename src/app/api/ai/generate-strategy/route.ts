import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Gabriel's 15-section methodology with question mappings
const STRATEGY_SECTIONS = [
  {
    id: "brand-story-origin",
    title: "Brand Story & Origin",
    questions: [1, 2, 3, 4, 5],
    prompt: `Write the Brand Story & Origin section. Using Q1 (reason for creation), Q2 (market problem), Q3 (differentiation), Q4 (core values), and Q5 (what consumers would lose), craft a compelling brand narrative that connects the founder's motivation to the market opportunity. Structure as: origin story, the problem worth solving, the founding insight, and the values that guide everything. This is the emotional heart of the strategy.`,
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    questions: [2, 8, 16, 17, 18, 19, 20],
    prompt: `Write the Market Analysis section. Using Q2 (market problem), Q8 (consumer barriers), Q16 (competitors), Q17 (differentiation from competitors), Q18 (what competitors do well), Q19 (competitor mistakes), and Q20 (market trends), provide a thorough analysis of the market landscape. Include: market dynamics, key barriers to entry and growth, trend analysis with implications, and a clear assessment of where the opportunity space lies. Use tables for trend mapping.`,
  },
  {
    id: "target-audience-profile",
    title: "Target Audience Profile",
    questions: [6, 7, 8, 9, 10, 27, 28, 32],
    prompt: `Write the Target Audience Profile section. Using Q6 (ideal consumer), Q7 (needs/frustrations solved), Q8 (category barriers), Q9 (info sought before buying), Q10 (info-seeking behavior), Q27 (Jobs-To-Be-Done examples), Q28 (path to purchase), and Q32 (life moments), build detailed audience profiles. Include: demographic sketch, psychographic depth, behavioral patterns, information consumption habits, and key life moments that trigger category relevance. Create at least 2 distinct personas with names and scenarios.`,
  },
  {
    id: "brand-positioning-statement",
    title: "Brand Positioning Statement",
    questions: [1, 2, 3, 5, 17, 24],
    prompt: `Write the Brand Positioning Statement section. Synthesize Q1 (origin reason), Q2 (market problem), Q3 (differentiation), Q5 (consumer loss), Q17 (competitive differentiation), Q24 (archetype), plus insights from Brand Story and Market Analysis sections already generated, into a crystal-clear positioning statement. Use the format: "For [target], [BRAND] is the [category] that [key benefit] because [reason to believe]." Then expand with positioning rationale, competitive white space analysis, and positioning guard rails (what the brand should never claim).`,
  },
  {
    id: "competitive-analysis-matrix",
    title: "Competitive Analysis Matrix",
    questions: [3, 16, 17, 18, 19, 20],
    prompt: `Write the Competitive Analysis Matrix section. Using Q3 (brand differentiation), Q16 (competitor list), Q17 (concrete differentiators), Q18 (competitor strengths to learn from), Q19 (competitor mistakes to avoid), and Q20 (market trends), create a structured competitive analysis. Include: a comparison matrix table (brand vs. top 3-5 competitors across key dimensions), strength/weakness mapping, competitive threat assessment, and strategic implications. Identify the most dangerous competitor and the most vulnerable one.`,
  },
  {
    id: "brand-archetype-personality",
    title: "Brand Archetype & Personality",
    questions: [21, 22, 23, 24, 25, 26],
    prompt: `Write the Brand Archetype & Personality section. Using Q21 (brand adjectives), Q22 (primary emotion), Q23 (tone of voice), Q24 (chosen archetype), Q25 (rejected archetype), and Q26 (desired emotional reaction), define the brand's human character. Include: archetype deep dive (why this archetype fits, how it manifests in brand behavior), personality trait spectrum, emotional territory map, and a "brand as a person" narrative. Explain why the rejected archetype was excluded and what that reveals about the brand's identity boundaries.`,
  },
  {
    id: "brand-values-mission",
    title: "Brand Values & Mission",
    questions: [1, 2, 4, 5, 34, 36],
    prompt: `Write the Brand Values & Mission section. Using Q1 (creation reason), Q2 (market problem), Q4 (core values), Q5 (what consumers lose), Q34 (brand evolution direction), and Q36 (desired consumer perception in 5 years), articulate the brand's values system and mission. Include: mission statement, vision statement, values hierarchy (primary vs. supporting values), how each value translates into observable brand behaviors, and a values-to-action framework showing how these values should influence daily business decisions.`,
  },
  {
    id: "jobs-to-be-done-framework",
    title: "Jobs-To-Be-Done Framework",
    questions: [7, 8, 27, 28, 30, 32],
    prompt: `Write the Jobs-To-Be-Done Framework section. Using Q7 (needs/frustrations), Q8 (category barriers), Q27 (JTBD examples provided by client), Q28 (path to purchase), Q30 (purchase convincers), and Q32 (life moments), build a comprehensive JTBD analysis. Include: functional jobs, emotional jobs, social jobs for each scenario provided. Create a JTBD table with columns: Job Statement | Context/Trigger | Current Solution | Pain Level | Opportunity Score. Identify the highest-opportunity jobs and explain how the brand uniquely fulfills them.`,
  },
  {
    id: "customer-journey-map",
    title: "Customer Journey Map",
    questions: [9, 10, 28, 29, 30, 31, 32],
    prompt: `Write the Customer Journey Map section. Using Q9 (info sought), Q10 (info-seeking behavior), Q28 (path from need to purchase), Q29 (where customers are lost), Q30 (purchase convincers), Q31 (awareness-stage messaging), and Q32 (life moments), create a detailed journey map. Include stages: Trigger/Awareness, Research/Consideration, Evaluation, Purchase Decision, Post-Purchase. For each stage, map: customer actions, touchpoints, emotions, pain points, and brand opportunities. Highlight the critical drop-off points from Q29 and prescribe specific interventions.`,
  },
  {
    id: "tone-of-voice-guidelines",
    title: "Tone of Voice Guidelines",
    questions: [21, 22, 23, 24],
    prompt: `Write the Tone of Voice Guidelines section. Using Q21 (brand adjectives), Q22 (primary emotion), Q23 (tone preferences), Q24 (archetype), plus the brand personality and positioning already established, create actionable tone of voice guidelines. Include: voice attributes (3-4 dimensions each with a spectrum, e.g., "Formal ←→ Casual: We sit at 7/10 toward casual"), do's and don'ts table with example phrases, tone variations by channel (social media, website, email, advertising), and 3-5 "before/after" rewrites showing how generic copy becomes on-brand copy.`,
  },
  {
    id: "visual-identity-direction",
    title: "Visual Identity Direction",
    questions: [21, 22, 24],
    prompt: `Write the Visual Identity Direction section. Using Q21 (brand adjectives), Q22 (primary emotion), Q24 (archetype), plus the personality and positioning already established, provide strategic direction for visual identity. Include: recommended color psychology (primary, secondary, accent colors with hex codes and rationale), typography direction (serif vs. sans-serif, weight, personality), imagery style (photography style, illustration approach, mood), layout principles, and how visual elements should shift across touchpoints. Include a visual identity principles table.`,
  },
  {
    id: "mood-board",
    title: "Mood Board",
    questions: [21, 24],
    prompt: `Write the Mood Board direction section. Using Q21 (brand adjectives), Q24 (archetype), plus the visual identity direction, describe in rich detail the mood board concept. Include: overall mood/atmosphere description, 8-10 specific image descriptions that should appear on the mood board (e.g., "Close-up of weathered hands crafting leather — communicates authenticity and craftsmanship"), texture and material references, color palette visualization, typography specimens to seek, and lifestyle/aspirational imagery direction. This section guides a designer to create the actual mood board.`,
  },
  {
    id: "communication-strategy",
    title: "Communication Strategy",
    questions: [9, 10, 20, 29, 30, 31, 37, 38],
    prompt: `Write the Communication Strategy section. Using Q9 (info consumers seek), Q10 (info-seeking behavior), Q20 (market trends), Q29 (customer drop-off points), Q30 (purchase convincers), Q31 (awareness messaging), Q37 (interest triggers), and Q38 (receptivity timing), build a comprehensive communication strategy. Include: key message hierarchy (primary, secondary, tertiary), channel strategy matrix (channel | audience segment | message type | frequency | KPI), content pillars (4-6 pillars with descriptions), seasonal/timing considerations based on Q37 and Q38, and a media mix recommendation.`,
  },
  {
    id: "growth-roadmap",
    title: "Growth Roadmap",
    questions: [33, 34, 35, 36, 37],
    prompt: `Write the Growth Roadmap section. Using Q33 (3-year vision), Q34 (brand evolution direction), Q35 (unlimited budget priorities), Q36 (desired 5-year perception), and Q37 (interest triggers), create a phased growth roadmap. Include: Phase 1 — Foundation (Months 1-6), Phase 2 — Acceleration (Months 7-12), Phase 3 — Scale (Year 2-3). For each phase, specify: strategic priorities, key initiatives, resource requirements, success metrics, and risk factors. Include a visual timeline representation using markdown. Address the "unlimited budget" items from Q35 as aspirational milestones.`,
  },
  {
    id: "action-plan",
    title: "Action Plan",
    questions: [],
    prompt: `Write the Action Plan section. Synthesize ALL previous 14 sections into a concrete, prioritized action plan. Include: Top 10 immediate actions (next 30 days) with owner/responsibility suggestions, quick wins (high impact, low effort), strategic bets (high impact, high effort), a prioritization matrix table (Action | Impact | Effort | Priority | Timeline), resource requirements summary, estimated budget ranges where applicable, and a "Start / Stop / Continue" framework summarizing what the brand should start doing, stop doing, and continue doing. End with a powerful closing statement that ties back to the brand's origin story and mission.`,
  },
];

const SYSTEM_PROMPT = `You are Gabriel Adrian Eremia, a brand strategist with 15+ years of experience building transformational brand strategies for Romanian and Eastern European SMEs, startups, and franchise operations. Your approach is grounded in deep consumer psychology (Jungian archetypes), behavioral economics (Jobs-To-Be-Done framework), and practical business reality.

Your core philosophy: Great brands are built on authenticity, clarity of purpose, and deep understanding of what customers truly need (not just want). You avoid buzzwords and generic advice. Every recommendation must be rooted in the client's specific market context, competitive landscape, and customer psychology.

When generating strategy sections:
- Lead with insight, not fluff
- Every claim must be defensible from the questionnaire data
- Use specific examples (real brands, real customer scenarios)
- Structure for executive clarity and actionability
- Write in clear, jargon-free language
- Include clear thinking about trade-offs
- Each section should be 500-800 words with rich markdown formatting
- Include tables, bullet lists, bold key phrases
- End each section with "## Key Takeaways" (4-6 bullets) and "## Recommended Actions" (4-6 items)`;

function getQuestionText(qNum: number): string {
  const questions: Record<number, string> = {
    1: "What was the real reason you created [BRAND]?",
    2: "What major market problem do you intend to solve?",
    3: "How is [BRAND] different from the rest of the players?",
    4: "What are the 3 core values of the [BRAND] brand?",
    5: "If [BRAND] ceased to exist tomorrow, what would consumers lose?",
    6: "How would you describe the ideal consumer of the [BRAND] brand?",
    7: "What need, frustration or major difficulty do your products solve?",
    8: "What are people's biggest barriers regarding [CATEGORY]?",
    9: "What type of information do consumers seek before buying?",
    10: "What is the usual information-seeking behavior of consumers?",
    11: "What are [BRAND]'s hero products?",
    12: "What elements in product formulation are truly unique?",
    13: "What clear evidence can we use to strengthen credibility?",
    14: "Are there production aspects that competition cannot copy?",
    15: "What promises should [BRAND] NEVER make?",
    16: "Who are the relevant direct and indirect competitors?",
    17: "What concretely differentiates [BRAND] from these competitors?",
    18: "What do competitors do well that [BRAND] can learn from?",
    19: "What do competitors do wrong that should be avoided?",
    20: "What trends do you observe in the [CATEGORY] market?",
    21: "If [BRAND] were a person, what 3-5 adjectives would describe them?",
    22: "What primary emotion do we want the brand to convey?",
    23: "What type of tone of voice do you consider appropriate?",
    24: "Which Jungian archetype best represents [BRAND]?",
    25: "What archetype does NOT fit the brand at all?",
    26: "What emotional reaction should the brand trigger?",
    27: "Please provide 3-5 real examples of Jobs-To-Be-Done",
    28: "What is the typical path from need to purchase?",
    29: "Where are potential customers most often lost?",
    30: "What convinces them most to complete the purchase?",
    31: "What type of message works best in the awareness stage?",
    32: "At what life moments do people most often think about [CATEGORY]?",
    33: "Where do you see [BRAND] in 3 years?",
    34: "In what direction do you want the brand to evolve?",
    35: "If budget were not a limit, what would you immediately change about the brand?",
    36: "What would you like consumers to say about [BRAND] in 5 years?",
    37: "What events or changes trigger interest in products?",
    38: "When are people most receptive to brand messages?",
    39: "[OPEN] Is there anything else you consider important that hasn't been covered?",
  };
  return questions[qNum] || `Question ${qNum}`;
}

function buildQuestionnaireContext(
  responses: Record<string, string>,
  questionNumbers: number[]
): string {
  if (!responses || questionNumbers.length === 0) return "";

  const relevantResponses = questionNumbers
    .map((qNum) => {
      const key = `q${qNum}`;
      const answer = responses[key] || responses[String(qNum)];
      if (answer) {
        return `Q${qNum}: "${getQuestionText(qNum)}"\nAnswer: ${answer}`;
      }
      return null;
    })
    .filter(Boolean);

  return relevantResponses.join("\n\n");
}

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

    // Build the full questionnaire context for the AI
    const allQuestionNumbers = Array.from({ length: 39 }, (_, i) => i + 1);
    const fullContext = buildQuestionnaireContext(
      questionnaire_responses,
      allQuestionNumbers
    );

    const projectContext = `Brand/Business: ${project.title || "Unknown"}
Industry/Description: ${project.description || "Not specified"}

## Complete Questionnaire Responses

${fullContext || "No questionnaire responses provided."}`;

    // Build section-specific prompts with relevant question data
    const sectionsPrompt = STRATEGY_SECTIONS.map((s, i) => {
      const sectionContext =
        s.questions.length > 0
          ? `\n\nRelevant questionnaire data for this section:\n${buildQuestionnaireContext(questionnaire_responses, s.questions)}`
          : "\n\nThis section synthesizes all previous sections.";

      return `${i + 1}. Section ID: "${s.id}" | Title: "${s.title}"${sectionContext}\n   Instructions: ${s.prompt}`;
    }).join("\n\n---\n\n");

    const anthropic = new Anthropic({ apiKey });

    // Generate ALL 15 sections in a single API call
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a complete 15-section brand strategy for the following brand. This strategy must be deeply rooted in the client's actual questionnaire responses — do not invent or assume information that wasn't provided.

Project Context:
${projectContext}

Generate ALL of the following sections. Each section should be 500-800 words with rich markdown formatting (headings, bullet points, bold text, tables where appropriate).

CRITICAL REQUIREMENTS:
- Every section MUST end with "## Key Takeaways" (4-6 bullets) and "## Recommended Actions" (4-6 items)
- Reference specific answers from the questionnaire to support your recommendations
- Each section builds on previous sections — maintain consistency throughout
- Replace [BRAND] with the actual brand name and [CATEGORY] with the actual category throughout

${sectionsPrompt}

IMPORTANT: Respond ONLY with a valid JSON object in this exact format (no markdown code fences, no extra text):
{"sections": [{"id": "brand-story-origin", "title": "Brand Story & Origin", "content": "markdown content here..."}, {"id": "market-analysis", "title": "Market Analysis", "content": "markdown content here..."}, ...]}

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
          // Quality heuristic based on content length, structure, and required elements
          const wordCount = content.split(/\s+/).length;
          const hasHeadings = /^#{1,3}\s/m.test(content);
          const hasBullets = /^[-*]\s/m.test(content);
          const hasTables = /\|.*\|.*\|/m.test(content);
          const hasBoldText = /\*\*[^*]+\*\*/m.test(content);
          const hasKeyTakeaways = /key takeaway/i.test(content);
          const hasRecommendedActions = /recommended action/i.test(content);
          let qualityScore = 60;
          if (wordCount > 300) qualityScore += 8;
          if (wordCount > 500) qualityScore += 7;
          if (wordCount > 700) qualityScore += 5;
          if (hasHeadings) qualityScore += 3;
          if (hasBullets) qualityScore += 3;
          if (hasTables) qualityScore += 4;
          if (hasBoldText) qualityScore += 2;
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
            qualityScore: 50,
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
