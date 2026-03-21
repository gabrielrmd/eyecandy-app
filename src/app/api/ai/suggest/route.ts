import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured. Please set ANTHROPIC_API_KEY." },
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

    const anthropic = new Anthropic({ apiKey });

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI suggest error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
