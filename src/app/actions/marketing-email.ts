"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  MarketingEmailDraftUpdate,
  EmailDraftStatus,
} from "@/lib/types/crm";

// ─── Templates ──────────────────────────────────────────────────

export async function getRecommendedTemplates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketing_email_templates")
    .select("id, name, category, description, thumbnail_url, is_recommended")
    .eq("is_recommended", true)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .limit(10);

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

export async function getAllTemplates(params?: {
  category?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("marketing_email_templates")
    .select("id, name, category, description, thumbnail_url, is_recommended, sort_order, created_at")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (params?.category) {
    query = query.eq("category", params.category);
  }

  if (params?.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

// ─── Drafts / Campaigns ────────────────────────────────────────

export async function createEmailDraftFromTemplate(templateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch template content
  const { data: template, error: tplError } = await supabase
    .from("marketing_email_templates")
    .select("id, name, content_html, content_structure")
    .eq("id", templateId)
    .single();

  if (tplError || !template) return { error: "Template not found" };

  // Create draft with template content instantiated (PRD §10.4)
  const { data: draft, error } = await supabase
    .from("marketing_email_drafts")
    .insert({
      user_id: user.id,
      template_id: template.id,
      name: `${template.name} — ${new Date().toLocaleDateString()}`,
      content_html: template.content_html,
      content_structure: template.content_structure,
      status: "draft",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: draft };
}

export async function createEmailDraftFromScratch() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: draft, error } = await supabase
    .from("marketing_email_drafts")
    .insert({
      user_id: user.id,
      template_id: null,
      name: `New Email — ${new Date().toLocaleDateString()}`,
      content_html: "",
      status: "draft",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: draft };
}

export async function updateEmailDraft(
  draftId: string,
  data: MarketingEmailDraftUpdate
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: draft, error } = await supabase
    .from("marketing_email_drafts")
    .update(data)
    .eq("id", draftId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: draft };
}

export async function updateEmailDraftStatus(
  draftId: string,
  newStatus: EmailDraftStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch current status for transition validation
  const { data: current } = await supabase
    .from("marketing_email_drafts")
    .select("status")
    .eq("id", draftId)
    .eq("user_id", user.id)
    .single();

  if (!current) return { error: "Draft not found" };

  // Validate status transitions (PRD §10.6)
  const validTransitions: Record<string, string[]> = {
    draft: ["scheduled", "sending", "canceled"],
    scheduled: ["sending", "canceled", "draft"],
    sending: ["sent", "failed"],
    sent: [],
    canceled: ["draft"],
    failed: ["draft", "scheduled"],
  };

  const allowed = validTransitions[current.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return {
      error: `Cannot transition from "${current.status}" to "${newStatus}"`,
    };
  }

  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (newStatus === "sent") updatePayload.sent_at = new Date().toISOString();
  if (newStatus === "canceled") updatePayload.canceled_at = new Date().toISOString();

  const { data: draft, error } = await supabase
    .from("marketing_email_drafts")
    .update(updatePayload)
    .eq("id", draftId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  // Audit log
  await supabase.rpc("log_audit_event", {
    p_action: `email_${newStatus}`,
    p_resource_type: "marketing_email_draft",
    p_resource_id: draftId,
    p_changes: { from_status: current.status, to_status: newStatus },
  });

  revalidatePath("/dashboard");
  return { data: draft };
}

export async function deleteEmailDraft(draftId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Only allow deleting drafts and canceled campaigns
  const { data: draft } = await supabase
    .from("marketing_email_drafts")
    .select("status")
    .eq("id", draftId)
    .eq("user_id", user.id)
    .single();

  if (!draft) return { error: "Draft not found" };
  if (!["draft", "canceled"].includes(draft.status)) {
    return { error: "Only draft or canceled emails can be deleted" };
  }

  const { error } = await supabase
    .from("marketing_email_drafts")
    .delete()
    .eq("id", draftId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function listEmailDrafts(params?: {
  status?: EmailDraftStatus;
  page?: number;
  per_page?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("marketing_email_drafts")
    .select("*, marketing_email_templates(name, category)", { count: "exact" })
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (params?.status) {
    query = query.eq("status", params.status);
  }

  const { data, count, error } = await query;

  if (error) return { error: error.message };
  return {
    data: data ?? [],
    total_count: count ?? 0,
    page,
    per_page: perPage,
    has_more: (count ?? 0) > from + perPage,
  };
}
