"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTemplateResponse(
  templateSlug: string,
  responses: Record<string, unknown>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Look up the template UUID from the slug
  const { data: template } = await supabase
    .from("template_catalog")
    .select("id")
    .eq("slug", templateSlug)
    .maybeSingle();

  // If template not found in catalog, use the slug as-is for non-catalog templates
  const templateId = template?.id;

  if (!templateId) {
    // Fallback: store with a deterministic UUID-like approach
    // Try to find existing response by user + matching data title
    const { data: existing } = await supabase
      .from("template_responses")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", templateSlug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("template_responses")
        .update({
          data: responses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) return { error: error.message };
    } else {
      // Need a valid template_id - get any template to satisfy FK
      const { data: anyTemplate } = await supabase
        .from("template_catalog")
        .select("id")
        .limit(1)
        .single();

      if (!anyTemplate) return { error: "No templates found in catalog" };

      const { error } = await supabase.from("template_responses").insert({
        user_id: user.id,
        template_id: anyTemplate.id,
        title: templateSlug,
        data: responses,
      });

      if (error) return { error: error.message };
    }

    revalidatePath(`/templates/${templateSlug}`);
    return { success: true };
  }

  // Check for existing response
  const { data: existing } = await supabase
    .from("template_responses")
    .select("id")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("template_responses")
      .update({
        data: responses,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("template_responses").insert({
      user_id: user.id,
      template_id: templateId,
      data: responses,
    });

    if (error) return { error: error.message };
  }

  revalidatePath(`/templates/${templateSlug}`);
  return { success: true };
}

export async function loadTemplateResponse(templateSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null };

  // Look up template UUID from slug
  const { data: template } = await supabase
    .from("template_catalog")
    .select("id")
    .eq("slug", templateSlug)
    .maybeSingle();

  if (template?.id) {
    const { data, error } = await supabase
      .from("template_responses")
      .select("data")
      .eq("user_id", user.id)
      .eq("template_id", template.id)
      .maybeSingle();

    if (error || !data) return { data: null };
    return { data: data.data };
  }

  // Fallback: search by title
  const { data, error } = await supabase
    .from("template_responses")
    .select("data")
    .eq("user_id", user.id)
    .eq("title", templateSlug)
    .maybeSingle();

  if (error || !data) return { data: null };
  return { data: data.data };
}
