"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CompanyInsert, CompanyUpdate } from "@/lib/types/crm";

export async function createCompany(data: CompanyInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: company, error } = await supabase
    .from("companies")
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Log activity
  await supabase.from("activities").insert({
    user_id: user.id,
    entity_type: "company",
    entity_id: company.id,
    activity_type: "company_created",
    actor_id: user.id,
    title: `Created company "${data.name}"`,
  });

  revalidatePath("/dashboard");
  return { data: company };
}

export async function updateCompany(companyId: string, data: CompanyUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: company, error } = await supabase
    .from("companies")
    .update(data)
    .eq("id", companyId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: company };
}

export async function deleteCompany(companyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Log before deletion
  await supabase.rpc("log_audit_event", {
    p_action: "delete",
    p_resource_type: "company",
    p_resource_id: companyId,
  });

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignCompanyOwner(
  companyId: string,
  ownerId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch previous owner for activity log
  const { data: prev } = await supabase
    .from("companies")
    .select("owner_id, name")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!prev) return { error: "Company not found" };

  const { error } = await supabase
    .from("companies")
    .update({ owner_id: ownerId })
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Log ownership change as activity
  await supabase.from("activities").insert({
    user_id: user.id,
    entity_type: "company",
    entity_id: companyId,
    activity_type: "owner_changed",
    actor_id: user.id,
    title: `Owner changed for "${prev.name}"`,
    metadata: {
      previous_owner_id: prev.owner_id,
      new_owner_id: ownerId,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function bulkDeleteCompanies(companyIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  if (companyIds.length === 0) return { error: "No companies selected" };
  if (companyIds.length > 500) return { error: "Maximum 500 companies per bulk operation" };

  const { error } = await supabase
    .from("companies")
    .delete()
    .in("id", companyIds)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Audit log
  await supabase.rpc("log_audit_event", {
    p_action: "bulk_delete",
    p_resource_type: "company",
    p_resource_id: companyIds[0],
    p_changes: { deleted_ids: companyIds, count: companyIds.length },
  });

  revalidatePath("/dashboard");
  return { success: true, deleted_count: companyIds.length };
}

export async function bulkAssignOwner(
  companyIds: string[],
  ownerId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  if (companyIds.length === 0) return { error: "No companies selected" };

  const { error } = await supabase
    .from("companies")
    .update({ owner_id: ownerId })
    .in("id", companyIds)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true, updated_count: companyIds.length };
}

// ─── Saved Views ────────────────────────────────────────────────

export async function createSavedView(data: {
  entity_type: string;
  name: string;
  filters?: unknown[];
  sort?: unknown[];
  columns?: string[];
  is_shared?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: view, error } = await supabase
    .from("saved_views")
    .insert({ ...data, user_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: view };
}

export async function deleteSavedView(viewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("saved_views")
    .delete()
    .eq("id", viewId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
