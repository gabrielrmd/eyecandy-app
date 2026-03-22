import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion, validateProviderConfig } from "@/lib/ai/provider";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerCheck = validateProviderConfig();
    if (!providerCheck.valid) {
      console.error(providerCheck.error);
      return NextResponse.json(
        { error: `AI service is not configured. ${providerCheck.error}` },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { question_text, question_type, current_answer, context } = body;

    if (!question_text) {
      return NextResponse.json(
        { error: "question_text is required" },
        { status: 400 }
      );
    }

    const prompt = `You are a brand strategy consultant helping a user fill out a strategy questionnaire.

The user is answering the following question:
"${question_text}"

Question type: ${question_type || "text"}
${current_answer ? `Their current answer so far: "${current_answer}"` : "They haven't answered yet."}
${context ? `Additional context about their business: ${JSON.stringify(context)}` : ""}

Provide 2-3 helpful suggestions for how they could answer this question. Each suggestion should be specific, actionable, and relevant to brand strategy.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{
  "suggestions": [
    {
      "text": "The suggested answer text",
      "explanation": "Why this suggestion is helpful",
      "relevance_score": 0.85
    }
  ]
}

Keep each suggestion concise (1-3 sentences for the text). The relevance_score should be between 0 and 1.`;

    const result = await generateCompletion({
      maxTokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    if (!result.text) {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      let jsonText = result.text.trim();
      if (jsonText.includes("```")) {
        const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) jsonText = match[1].trim();
      }
      const braceIdx = jsonText.indexOf("{");
      if (braceIdx > 0) jsonText = jsonText.slice(braceIdx);
      parsed = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse AI suggest response:", result.text.slice(0, 200));
      return NextResponse.json(
        { error: "Failed to parse AI response", suggestions: [] },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
