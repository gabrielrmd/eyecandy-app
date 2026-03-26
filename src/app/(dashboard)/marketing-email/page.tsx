import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MarketingEmailClient from "./marketing-email-client";

export default async function MarketingEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch recommended templates (system templates — PRD §10.1)
  const { data: recommended } = await supabase
    .from("marketing_email_templates")
    .select("id, name, category, description, thumbnail_url, is_recommended")
    .eq("is_recommended", true)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .limit(3);

  // Fetch all templates for the "View all" panel
  const { data: allTemplates } = await supabase
    .from("marketing_email_templates")
    .select("id, name, category, description, thumbnail_url, is_recommended")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  // Fetch user's existing drafts
  const { data: drafts, count: draftCount } = await supabase
    .from("marketing_email_drafts")
    .select("id, name, subject, status, template_id, updated_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <MarketingEmailClient
      recommendedTemplates={recommended ?? []}
      allTemplates={allTemplates ?? []}
      recentDrafts={drafts ?? []}
      draftCount={draftCount ?? 0}
      userId={user.id}
    />
  );
}
