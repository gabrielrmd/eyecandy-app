import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.24.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SuggestionRequest {
  question_text: string;
  question_type?: string;
  current_answer?: string;
  context?: Record<string, unknown>;
  template_context?: string;
  user_id?: string;
  suggestion_count?: number;
}

interface Suggestion {
  text: string;
  explanation: string;
  relevance_score: number;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
  generated_at: string;
}

// Serve CORS preflight requests
function handleCors(): Response {
  return new Response("ok", { headers: corsHeaders });
}

// Generate AI suggestions for a question/field
async function generateSuggestions(
  client: InstanceType<typeof Anthropic>,
  question: string,
  questionType: string,
  currentAnswer: string,
  context: Record<string, unknown>,
  suggestionCount: number
): Promise<Suggestion[]> {
  const systemPrompt = `You are an expert marketing and business strategy consultant.
Your task is to provide helpful, actionable suggestions for marketing and business strategy questions.
Provide only the most relevant and specific suggestions based on the context provided.
Return ONLY valid JSON array format, no markdown or additional text.`;

  // Build context string
  const contextStr = Object.entries(context)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");

  const userPrompt = `Question: ${question}
Question Type: ${questionType}
${currentAnswer ? `Current Answer: ${currentAnswer}` : ""}

${contextStr ? `Context:\n${contextStr}` : ""}

Generate ${suggestionCount} helpful suggestions for answering this question.
Return a JSON array with this structure:
[
  {
    "text": "The suggestion text (brief, actionable)",
    "explanation": "Why this is a good approach or example",
    "relevance_score": 0.85
  }
]

Make suggestions specific, actionable, and relevant to the context. Score should be 0-1 where 1 is most relevant.
Sort by relevance_score descending.`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
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
        : [];

    // Ensure we have valid suggestions
    if (!Array.isArray(content)) {
      return [];
    }

    return content
      .filter(
        (s): s is Suggestion =>
          s &&
          typeof s === "object" &&
          "text" in s &&
          "explanation" in s &&
          "relevance_score" in s
      )
      .slice(0, suggestionCount)
      .sort((a, b) => b.relevance_score - a.relevance_score);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    throw error;
  }
}

// Get user context for better suggestions
async function getUserContext(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Record<string, unknown>> {
  if (!userId) return {};

  try {
    // Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Fetch latest strategy project
    const { data: projects } = await supabase
      .from("strategy_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const latestProject = projects?.[0];

    // Fetch latest responses if project exists
    let responses = null;
    if (latestProject) {
      const { data: resp } = await supabase
        .from("questionnaire_responses")
        .select("*")
        .eq("strategy_project_id", latestProject.id)
        .single();
      responses = resp;
    }

    return {
      company_name: profile?.company_name,
      industry: profile?.industry,
      team_size: profile?.team_size,
      business_model: responses?.section_1_responses?.business_model,
      target_audience:
        responses?.section_2_responses?.target_audience?.substring?.(0, 100),
      value_proposition:
        responses?.section_4_responses?.value_proposition?.substring?.(0, 100),
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return {};
  }
}

// Main handler
async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return handleCors();
  }

  try {
    const body = (await req.json()) as SuggestionRequest;
    const {
      question_text,
      question_type = "text",
      current_answer = "",
      context = {},
      template_context = "",
      user_id = "",
      suggestion_count = 3,
    } = body;

    if (!question_text) {
      return new Response(
        JSON.stringify({ error: "Missing question_text" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Claude client
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
    const client = new Anthropic({ apiKey });

    // Get user context if user_id provided
    let enrichedContext = context;
    if (user_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const userContext = await getUserContext(supabase, user_id);
      enrichedContext = { ...enrichedContext, ...userContext };
    }

    if (template_context) {
      enrichedContext = { ...enrichedContext, template_context };
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(
      client,
      question_text,
      question_type,
      current_answer,
      enrichedContext,
      Math.min(suggestion_count, 5) // Cap at 5 suggestions
    );

    const response: SuggestionsResponse = {
      suggestions,
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Suggestion generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate suggestions",
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
