"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStrategyProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const businessName = formData.get("business_name") as string;
  const industry = formData.get("industry") as string;

  const { data, error } = await supabase
    .from("strategy_projects")
    .insert({
      user_id: user.id,
      business_name: businessName,
      industry: industry,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { data };
}

export async function saveQuestionnaireResponses(
  strategyProjectId: string,
  sectionId: string,
  responses: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("questionnaire_responses").upsert(
    {
      strategy_project_id: strategyProjectId,
      user_id: user.id,
      section_id: sectionId,
      responses,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "strategy_project_id,section_id",
    }
  );

  if (error) return { error: error.message };

  revalidatePath(`/strategy/${strategyProjectId}`);
  return { success: true };
}

export async function triggerStrategyGeneration(strategyProjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Update project status
  await supabase
    .from("strategy_projects")
    .update({ status: "generating" })
    .eq("id", strategyProjectId);

  // Trigger AI generation via API route
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate-strategy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy_project_id: strategyProjectId }),
    }
  );

  if (!response.ok) {
    return { error: "Failed to start strategy generation" };
  }

  return { success: true };
}

export async function deleteStrategyProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Delete strategy sections and strategies (FK cascade should handle, but be explicit)
  const { data: strategy } = await supabase
    .from("strategies")
    .select("id")
    .eq("strategy_project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (strategy) {
    await supabase.from("strategy_sections").delete().eq("strategy_id", strategy.id);
    await supabase.from("strategies").delete().eq("id", strategy.id);
  }

  // Delete questionnaire responses
  await supabase
    .from("questionnaire_responses")
    .delete()
    .eq("strategy_project_id", projectId)
    .eq("user_id", user.id);

  // Delete the project
  const { error } = await supabase
    .from("strategy_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
