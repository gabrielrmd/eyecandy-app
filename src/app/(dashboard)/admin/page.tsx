import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, Users, CreditCard, BarChart3 } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  const totalRevenue = (purchasesResult.data ?? []).reduce(
    (sum, p) => sum + ((p as { amount_cents: number }).amount_cents || 0), 0
  ) / 100;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-[var(--teal)]" />
        <h1 className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-[var(--navy)] uppercase">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
          <Users className="h-5 w-5 text-[var(--teal)] mb-2" />
          <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--charcoal)]">{totalUsers}</div>
          <p className="text-xs text-[var(--mid-gray)]">Total Users</p>
        </div>
        <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
          <CreditCard className="h-5 w-5 text-[var(--teal)] mb-2" />
          <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--charcoal)]">{totalPurchases}</div>
          <p className="text-xs text-[var(--mid-gray)]">Purchases</p>
        </div>
        <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
          <BarChart3 className="h-5 w-5 text-[var(--teal)] mb-2" />
          <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-[var(--charcoal)]">{totalStrategies}</div>
          <p className="text-xs text-[var(--mid-gray)]">Strategies Created</p>
        </div>
        <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
          <CreditCard className="h-5 w-5 text-emerald-500 mb-2" />
          <div className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-emerald-600">€{totalRevenue.toFixed(0)}</div>
          <p className="text-xs text-[var(--mid-gray)]">Revenue</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e8eaed] bg-white p-6">
        <h2 className="font-[family-name:var(--font-oswald)] text-lg font-bold text-[var(--charcoal)] uppercase mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg border border-[#e8eaed] px-4 py-2 text-sm font-medium text-[var(--charcoal)] hover:border-[var(--teal)] transition-colors">
            View Dashboard
          </Link>
          <Link href="/account/billing" className="rounded-lg border border-[#e8eaed] px-4 py-2 text-sm font-medium text-[var(--charcoal)] hover:border-[var(--teal)] transition-colors">
            Manage Billing
          </Link>
        </div>
      </div>
    </div>
  );
}
