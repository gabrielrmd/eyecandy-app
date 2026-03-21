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
    const { question_text, question_type, current_answer, context } = body;

    // Call the Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/ai-suggest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          question_text,
          question_type,
          current_answer,
          context,
          user_id: user.id,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Edge function error:", error);
      return NextResponse.json(
        { error: "AI suggestion failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("AI suggest error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
