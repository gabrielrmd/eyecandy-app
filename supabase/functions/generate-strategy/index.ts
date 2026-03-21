import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface StrategySection {
  section_number: number;
  section_title: string;
  section_type: string;
  content: Record<string, unknown>;
  quality_score: number;
  generation_model: string;
}

interface StrategyRequest {
  strategy_project_id: string;
  user_id: string;
  regenerate_sections?: number[];
  quality_threshold?: number;
}

const STRATEGY_SECTIONS = [
  {
    number: 1,
    title: "Executive Summary",
    type: "executive_summary",
    prompt_key: "executive_summary",
  },
  {
    number: 2,
    title: "Market Analysis",
    type: "market_analysis",
    prompt_key: "market_analysis",
  },
  {
    number: 3,
    title: "Target Audience Deep Dive",
    type: "audience_analysis",
    prompt_key: "audience_analysis",
  },
  {
    number: 4,
    title: "Competitive Positioning",
    type: "competitive_positioning",
    prompt_key: "competitive_positioning",
  },
  {
    number: 5,
    title: "Brand Strategy",
    type: "brand_strategy",
    prompt_key: "brand_strategy",
  },
  {
    number: 6,
    title: "Value Proposition",
    type: "value_proposition",
    prompt_key: "value_proposition",
  },
  {
    number: 7,
    title: "Marketing Goals & Objectives",
    type: "marketing_goals",
    prompt_key: "marketing_goals",
  },
  {
    number: 8,
    title: "Marketing Channels Strategy",
    type: "channels_strategy",
    prompt_key: "channels_strategy",
  },
  {
    number: 9,
    title: "Content Strategy",
    type: "content_strategy",
    prompt_key: "content_strategy",
  },
  {
    number: 10,
    title: "Customer Journey & Conversion",
    type: "customer_journey",
    prompt_key: "customer_journey",
  },
  {
    number: 11,
    title: "Marketing Calendar & Timeline",
    type: "timeline",
    prompt_key: "timeline",
  },
  {
    number: 12,
    title: "Growth & Scaling Strategy",
    type: "growth_strategy",
    prompt_key: "growth_strategy",
  },
  {
    number: 13,
    title: "Analytics & Measurement",
    type: "analytics",
    prompt_key: "analytics",
  },
  {
    number: 14,
    title: "Implementation Roadmap",
    type: "implementation",
    prompt_key: "implementation",
  },
  {
    number: 15,
    title: "Risk Management & Contingencies",
    type: "risk_management",
    prompt_key: "risk_management",
  },
];

// Serve CORS preflight requests
function handleCors(): Response {
  return new Response("ok", { headers: corsHeaders });
}

// Generate a strategy section using Claude API
async function generateStrategySection(
  client: InstanceType<typeof Anthropic>,
  sectionConfig: {
    number: number;
    title: string;
    type: string;
    prompt_key: string;
  },
  contextData: Record<string, unknown>,
  projectData: Record<string, unknown>
): Promise<StrategySection> {
  const systemPrompt = `You are an expert marketing strategist with 15+ years of experience helping businesses develop comprehensive marketing strategies.
You provide actionable, data-driven insights that are specific to the client's business context.
Respond in valid JSON format only, with no markdown or additional text.`;

  const userPrompt = buildSectionPrompt(
    sectionConfig,
    contextData,
    projectData
  );

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content =
      response.content[0].type === "text"
        ? JSON.parse(response.content[0].text)
        : {};
    const qualityScore = calculateQualityScore(content, sectionConfig);

    return {
      section_number: sectionConfig.number,
      section_title: sectionConfig.title,
      section_type: sectionConfig.type,
      content,
      quality_score: qualityScore,
      generation_model: "claude-3-5-sonnet",
    };
  } catch (error) {
    console.error(`Error generating section ${sectionConfig.number}:`, error);
    throw error;
  }
}

// Build section-specific prompt
function buildSectionPrompt(
  sectionConfig: {
    number: number;
    title: string;
    type: string;
    prompt_key: string;
  },
  contextData: Record<string, unknown>,
  projectData: Record<string, unknown>
): string {
  const baseContext = `
Business Information:
- Company: ${projectData.company_name || "Not specified"}
- Industry: ${projectData.industry || "Not specified"}
- Business Model: ${projectData.business_model || "Not specified"}
- Target Market: ${projectData.target_audience || "Not specified"}
- Value Proposition: ${projectData.value_proposition || "Not specified"}

Survey Responses:
${JSON.stringify(contextData, null, 2)}
`;

  const sectionPrompts: Record<string, string> = {
    executive_summary: `${baseContext}

Create a concise executive summary for the marketing strategy. Include:
- Business overview and position
- Key marketing objectives
- Primary target audience
- Core value proposition
- Expected outcomes and timeline
- Investment required

Return as JSON with these fields: overview, objectives, audience_summary, value_prop_summary, expected_outcomes, timeline, investment_estimate`,

    market_analysis: `${baseContext}

Analyze the market landscape. Include:
- Market size and growth trends
- Industry dynamics
- Key market segments
- Market opportunity assessment
- Relevant regulations or trends

Return as JSON with fields: market_size, growth_rate, industry_dynamics, segments, opportunity_assessment, trends_summary`,

    audience_analysis: `${baseContext}

Create an in-depth target audience analysis including:
- Primary persona details (demographics, psychographics)
- Secondary personas (if applicable)
- Audience pain points and needs
- Buying behaviors and decision factors
- Preferred information sources and channels
- Audience journey stages

Return as JSON with fields: primary_persona, secondary_personas, pain_points, buying_behavior, information_sources, journey_stages`,

    competitive_positioning: `${baseContext}

Analyze competitive position including:
- Direct competitor analysis
- Competitor strengths and weaknesses
- Market positioning gaps
- Differentiation opportunities
- Competitive advantages to leverage
- Potential threats

Return as JSON with fields: competitor_landscape, strengths_opportunities, weaknesses_threats, positioning_gaps, differentiation_strategy, risk_assessment`,

    brand_strategy: `${baseContext}

Develop brand strategy including:
- Brand positioning statement
- Brand personality and voice
- Key brand values
- Brand promise to customers
- Visual identity guidelines (recommendations)
- Brand messaging pillars

Return as JSON with fields: positioning_statement, personality_traits, values, brand_promise, visual_guidelines, messaging_pillars`,

    value_proposition: `${baseContext}

Craft a compelling value proposition including:
- Core value statement
- Key benefits (quantified where possible)
- Problem-solution alignment
- Proof points or evidence
- Differentiation vs. alternatives
- Call to action recommendations

Return as JSON with fields: core_statement, key_benefits, problem_solution, proof_points, differentiation, cta_recommendations`,

    marketing_goals: `${baseContext}

Define marketing goals and objectives:
- Long-term strategic goals (12-36 months)
- Annual marketing objectives
- Quarterly targets
- Key Performance Indicators (KPIs)
- Success metrics by channel
- Revenue attribution targets

Return as JSON with fields: strategic_goals, annual_objectives, quarterly_targets, primary_kpis, channel_metrics, revenue_targets`,

    channels_strategy: `${baseContext}

Recommend marketing channel strategy:
- Primary marketing channels
- Secondary supporting channels
- Channel-specific tactics and messaging
- Budget allocation recommendations (%)
- Channel integration approach
- Measurement approach per channel

Return as JSON with fields: primary_channels, secondary_channels, channel_tactics, budget_allocation, integration_strategy, measurement_approach`,

    content_strategy: `${baseContext}

Develop content strategy including:
- Content themes and pillars
- Content types by channel
- Publishing cadence recommendations
- Content distribution strategy
- SEO/organic optimization approach
- Content calendar structure

Return as JSON with fields: content_pillars, content_types, publishing_cadence, distribution_strategy, seo_approach, calendar_structure`,

    customer_journey: `${baseContext}

Map customer journey and optimize for conversion:
- Awareness stage tactics and content
- Consideration stage engagement
- Decision stage support and proof
- Retention and loyalty programs
- Conversion optimization opportunities
- Key touchpoint recommendations

Return as JSON with fields: awareness_stage, consideration_stage, decision_stage, retention_strategy, conversion_opportunities, critical_touchpoints`,

    timeline: `${baseContext}

Create marketing calendar and timeline:
- 90-day quick wins and initiatives
- 6-month strategic initiatives
- Annual campaign calendar
- Key dates and seasonality
- Campaign launch timeline
- Milestone tracking approach

Return as JSON with fields: quick_wins_90days, six_month_initiatives, annual_calendar, key_dates, campaign_timeline, milestones`,

    growth_strategy: `${baseContext}

Outline growth and scaling strategy:
- Growth opportunities and tactics
- Scalability considerations
- Expansion channels
- Market expansion opportunities
- Growth metrics and tracking
- Investment requirements for scaling

Return as JSON with fields: growth_opportunities, scalability_plan, expansion_channels, market_expansion, growth_metrics, scaling_investment`,

    analytics: `${baseContext}

Define analytics and measurement framework:
- Primary and secondary KPIs
- Dashboard metrics to track
- Reporting cadence
- Tools and integration requirements
- Attribution model recommendations
- Data governance and privacy

Return as JSON with fields: kpis_framework, dashboard_metrics, reporting_cadence, recommended_tools, attribution_model, data_governance`,

    implementation: `${baseContext}

Create implementation roadmap:
- Phase 1 priorities (30 days)
- Phase 2 initiatives (60 days)
- Phase 3+ expansion (90+ days)
- Resource requirements
- Success criteria per phase
- Risk mitigation steps

Return as JSON with fields: phase_1_priorities, phase_2_initiatives, phase_3_expansion, resource_requirements, success_criteria, risk_mitigation`,

    risk_management: `${baseContext}

Identify risks and contingency plans:
- Key risks and their likelihood
- Potential impact assessment
- Mitigation strategies
- Contingency plans
- Monitoring and alert indicators
- Escalation procedures

Return as JSON with fields: identified_risks, risk_assessment, mitigation_strategies, contingency_plans, monitoring_indicators, escalation_plan`,
  };

  return sectionPrompts[sectionConfig.prompt_key] || baseContext;
}

// Calculate quality score based on content completeness
function calculateQualityScore(
  content: Record<string, unknown>,
  sectionConfig: {
    number: number;
    title: string;
    type: string;
    prompt_key: string;
  }
): number {
  let score = 5; // Base score

  // Check for required fields based on section type
  const fieldCount = Object.keys(content).length;
  if (fieldCount >= 4) score += 2;
  if (fieldCount >= 6) score += 1;

  // Check content depth (approximation based on string length of values)
  const contentLength = JSON.stringify(content).length;
  if (contentLength > 500) score += 1;
  if (contentLength > 1500) score += 1;

  // Check for specific key fields
  const hasAnalysis = JSON.stringify(content).toLowerCase().includes("analysis");
  if (hasAnalysis) score += 0.5;

  const hasActionable = JSON.stringify(content).toLowerCase().includes("recommend");
  if (hasActionable) score += 0.5;

  return Math.min(10, Math.max(0, score));
}

// Main handler
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    // Parse request
    const body = (await req.json()) as StrategyRequest;
    const {
      strategy_project_id,
      user_id,
      regenerate_sections = [],
      quality_threshold = 7,
    } = body;

    if (!strategy_project_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Claude client
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
    const client = new Anthropic({ apiKey });

    // Fetch strategy project
    const { data: projectData, error: projectError } = await supabase
      .from("strategy_projects")
      .select("*")
      .eq("id", strategy_project_id)
      .eq("user_id", user_id)
      .single();

    if (projectError || !projectData) {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch questionnaire responses
    const { data: responses, error: responsesError } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("strategy_project_id", strategy_project_id)
      .single();

    if (responsesError || !responses) {
      return new Response(
        JSON.stringify({
          error: "Questionnaire responses not found",
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Fetch user profile for context
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    // Fetch AI interview if available
    const { data: interview } = await supabase
      .from("ai_interviews")
      .select("*")
      .eq("strategy_project_id", strategy_project_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Combine context data
    const contextData = {
      ...responses,
      interview_transcript: interview?.transcript,
      company_name: userProfile?.company_name,
      industry: userProfile?.industry,
    };

    // Update strategy status to generating
    await supabase
      .from("strategies")
      .update({ generation_status: "generating" })
      .eq("strategy_project_id", strategy_project_id);

    // Generate or regenerate sections
    const sectionsToGenerate = regenerate_sections.length > 0
      ? STRATEGY_SECTIONS.filter((s) => regenerate_sections.includes(s.number))
      : STRATEGY_SECTIONS;

    const generatedSections: StrategySection[] = [];

    for (const sectionConfig of sectionsToGenerate) {
      console.log(`Generating section ${sectionConfig.number}...`);

      const section = await generateStrategySection(
        client,
        sectionConfig,
        contextData,
        projectData
      );

      generatedSections.push(section);

      // If quality score is below threshold, regenerate
      if (section.quality_score < quality_threshold) {
        console.log(
          `Section ${sectionConfig.number} quality score ${section.quality_score} below threshold. Regenerating...`
        );
        const retrySection = await generateStrategySection(
          client,
          sectionConfig,
          contextData,
          projectData
        );
        generatedSections[generatedSections.length - 1] = retrySection;
      }

      // Store section in database
      const { error: sectionError } = await supabase
        .from("strategy_sections")
        .upsert(
          {
            strategy_id: projectData.generated_strategy_id,
            section_number: section.section_number,
            section_title: section.section_title,
            section_type: section.section_type,
            content: section.content,
            quality_score: section.quality_score,
            generation_model: section.generation_model,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "strategy_id,section_number",
          }
        );

      if (sectionError) {
        console.error(`Error storing section ${sectionConfig.number}:`, sectionError);
      }
    }

    // Calculate overall quality score
    const averageQuality =
      generatedSections.reduce((sum, s) => sum + s.quality_score, 0) /
      generatedSections.length;

    // Get or create strategy record
    let strategyId = projectData.generated_strategy_id;

    if (!strategyId) {
      const { data: newStrategy } = await supabase
        .from("strategies")
        .insert({
          strategy_project_id,
          user_id,
          title: `${projectData.title || "Marketing Strategy"} - ${new Date().toLocaleDateString()}`,
          generation_status: "completed",
          overall_quality_score: averageQuality,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      strategyId = newStrategy?.id;
    } else {
      // Update existing strategy
      await supabase
        .from("strategies")
        .update({
          generation_status: "completed",
          overall_quality_score: averageQuality,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", strategyId);
    }

    // Update project
    await supabase
      .from("strategy_projects")
      .update({
        strategy_generated: true,
        generated_strategy_id: strategyId,
        last_ai_generation_at: new Date().toISOString(),
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", strategy_project_id);

    return new Response(
      JSON.stringify({
        success: true,
        strategy_id: strategyId,
        sections_generated: generatedSections.length,
        overall_quality_score: averageQuality,
        sections: generatedSections,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Strategy generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Strategy generation failed",
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

Deno.serve(handler);
