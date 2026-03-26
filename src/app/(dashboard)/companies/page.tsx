import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompaniesClient from "./companies-client";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Initial server-side fetch — first page, all companies
  const { data: companies, count } = await supabase
    .from("companies")
    .select(
      "id, name, owner_id, phone, city, country, lifecycle_stage, last_activity_at, created_at",
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 24);

  // Fetch user profile for owner display
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, company_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <CompaniesClient
      initialCompanies={companies ?? []}
      initialCount={count ?? 0}
      currentUserId={user.id}
      currentUserName={profile?.company_name ?? user.email?.split("@")[0] ?? "You"}
    />
  );
}
