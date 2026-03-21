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
    const { strategy_project_id, regenerate_sections, quality_threshold } = body;

    if (!strategy_project_id) {
      return NextResponse.json(
        { error: "strategy_project_id required" },
        { status: 400 }
      );
    }

    // Call the Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-strategy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          strategy_project_id,
          user_id: user.id,
          regenerate_sections,
          quality_threshold: quality_threshold || 7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Edge function error:", error);
      return NextResponse.json(
        { error: "Strategy generation failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Generate strategy error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
