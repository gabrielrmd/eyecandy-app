"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  DashboardInsert,
  DashboardUpdate,
  DashboardWidgetInsert,
  DashboardWidgetUpdate,
} from "@/lib/types/crm";

// ─── Dashboard CRUD ─────────────────────────────────────────────

export async function createDashboard(data?: DashboardInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: dashboard, error } = await supabase
    .from("dashboards")
    .insert({
      user_id: user.id,
      created_by: user.id,
      title: data?.title ?? "Untitled Dashboard",
      description: data?.description ?? null,
      access_level: data?.access_level ?? "everyone_can_edit",
      default_filters: data?.default_filters ?? {},
      layout: data?.layout ?? [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: dashboard };
}

export async function updateDashboard(
  dashboardId: string,
  data: DashboardUpdate
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: dashboard, error } = await supabase
    .from("dashboards")
    .update(data)
    .eq("id", dashboardId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: dashboard };
}

export async function deleteDashboard(dashboardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("dashboards")
    .delete()
    .eq("id", dashboardId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getDashboard(dashboardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: dashboard, error } = await supabase
    .from("dashboards")
    .select("*, dashboard_widgets(*)")
    .eq("id", dashboardId)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };
  return { data: dashboard };
}

export async function listDashboards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("dashboards")
    .select("id, title, description, access_level, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: data ?? [] };
}

// ─── Dashboard Widgets ──────────────────────────────────────────

export async function addWidget(data: DashboardWidgetInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify dashboard ownership
  const { data: dashboard } = await supabase
    .from("dashboards")
    .select("id")
    .eq("id", data.dashboard_id)
    .eq("user_id", user.id)
    .single();

  if (!dashboard) return { error: "Dashboard not found" };

  const { data: widget, error } = await supabase
    .from("dashboard_widgets")
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: widget };
}

export async function updateWidget(
  widgetId: string,
  data: DashboardWidgetUpdate
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: widget, error } = await supabase
    .from("dashboard_widgets")
    .update(data)
    .eq("id", widgetId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { data: widget };
}

export async function deleteWidget(widgetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("dashboard_widgets")
    .delete()
    .eq("id", widgetId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Dashboard Sharing (PRD §13.6) ─────────────────────────────

export async function updateDashboardAccess(
  dashboardId: string,
  accessLevel: "everyone_can_edit" | "everyone_can_view" | "restricted"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: dashboard, error } = await supabase
    .from("dashboards")
    .update({ access_level: accessLevel })
    .eq("id", dashboardId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  // Audit log
  await supabase.rpc("log_audit_event", {
    p_action: "share",
    p_resource_type: "dashboard",
    p_resource_id: dashboardId,
    p_changes: { access_level: accessLevel },
  });

  return { data: dashboard };
}
