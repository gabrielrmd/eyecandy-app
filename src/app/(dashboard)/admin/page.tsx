import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch stats
  const [usersResult, purchasesResult, strategiesResult] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact" }),
    supabase.from("purchases").select("id, amount_cents", { count: "exact" }),
    supabase.from("strategy_projects").select("id", { count: "exact" }),
  ]);

  const totalUsers = usersResult.count ?? 0;
  const totalPurchases = purchasesResult.count ?? 0;
  const totalStrategies = strategiesResult.count ?? 0;
  const totalRevenue =
    (purchasesResult.data ?? []).reduce(
      (sum, p) =>
        sum + ((p as { amount_cents: number }).amount_cents || 0),
      0
    ) / 100;

  return (
    <AdminDashboard
      stats={{
        totalUsers,
        totalPurchases,
        totalStrategies,
        totalRevenue,
      }}
    />
  );
}
