import { createClient } from "@/lib/supabase/server";

export type PlanType =
  | "free"
  | "template_toolkit"
  | "starter"
  | "professional"
  | "enterprise";

export interface Subscription {
  plan_type: PlanType;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export async function getUserSubscription(): Promise<Subscription> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { plan_type: "free", status: "none", stripe_customer_id: null, stripe_subscription_id: null };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("plan_type, status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!data) {
    return { plan_type: "free", status: "none", stripe_customer_id: null, stripe_subscription_id: null };
  }

  return data as Subscription;
}

export function canAccessTemplates(plan: PlanType): boolean {
  return ["template_toolkit", "professional", "enterprise"].includes(plan);
}

export function canUseStrategyBuilder(plan: PlanType): boolean {
  return ["starter", "professional", "enterprise"].includes(plan);
}

export function canAccessChallenge(plan: PlanType): boolean {
  return ["professional", "enterprise"].includes(plan);
}

export function canAccessCommunity(plan: PlanType): boolean {
  return ["professional", "enterprise"].includes(plan);
}

export function getPlanDisplayName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    free: "Free",
    template_toolkit: "Template Toolkit",
    starter: "Starter Strategy",
    professional: "Professional",
    enterprise: "Enterprise",
  };
  return names[plan] || "Free";
}
