"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTemplateResponse(
  templateId: string,
  responses: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("template_responses").upsert(
    {
      user_id: user.id,
      template_id: templateId,
      response_data: responses,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,template_id",
    }
  );

  if (error) return { error: error.message };

  revalidatePath(`/templates/${templateId}`);
  return { success: true };
}

export async function loadTemplateResponse(templateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null };

  const { data, error } = await supabase
    .from("template_responses")
    .select("response_data")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .single();

  if (error) return { data: null };

  return { data: data.response_data };
}
