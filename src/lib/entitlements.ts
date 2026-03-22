/**
 * Entitlement Engine
 *
 * Server-side access control based on user_entitlements and strategy_credits tables.
 * This replaces the old subscription.ts plan-based checks.
 */

import { createClient } from "@/lib/supabase/server";
import type { EntitlementType } from "@/lib/products";

// ─── Types ───────────────────────────────────────────────────────

export interface UserEntitlement {
  entitlement: EntitlementType;
  status: "active" | "expired" | "canceled" | "suspended";
  expires_at: string | null;
  source_product_id: string | null;
}

export interface CreditBalance {
  credits_remaining: number;
  credits_total: number;
  credits_used: number;
  unlimited: boolean;
}

export interface UserAccess {
  userId: string;
  entitlements: UserEntitlement[];
  credits: CreditBalance;
  // Derived booleans for quick checks
  hasTemplates: boolean;
  hasStrategyBuilder: boolean;
  hasCircle: boolean;
  hasAgency: boolean;
  hasConsulting: boolean;
  canGenerateStrategy: boolean; // has builder access AND credits remaining (or unlimited)
  tierName: string; // display name: "Free", "Essentials", "Professional", "Agency"
}

const DEFAULT_CREDITS: CreditBalance = {
  credits_remaining: 0,
  credits_total: 0,
  credits_used: 0,
  unlimited: false,
};

// ─── Core: Get User Access ───────────────────────────────────────

export async function getUserAccess(): Promise<UserAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return makeAccess(null, [], DEFAULT_CREDITS);
  }

  // Check if user is admin — admins get full access to everything
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    const adminEntitlements: UserEntitlement[] = [
      { entitlement: "templates", status: "active", expires_at: null, source_product_id: "admin" },
      { entitlement: "strategy_builder", status: "active", expires_at: null, source_product_id: "admin" },
      { entitlement: "circle", status: "active", expires_at: null, source_product_id: "admin" },
      { entitlement: "agency", status: "active", expires_at: null, source_product_id: "admin" },
    ];
    const adminCredits: CreditBalance = { credits_remaining: 999, credits_total: 999, credits_used: 0, unlimited: true };
    return makeAccess(user.id, adminEntitlements, adminCredits);
  }

  // Fetch active entitlements
  const { data: entitlements } = await supabase
    .from("user_entitlements")
    .select("entitlement, status, expires_at, source_product_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  // Fetch credit balance
  const { data: credits } = await supabase
    .from("strategy_credits")
    .select("credits_remaining, credits_total, credits_used, unlimited")
    .eq("user_id", user.id)
    .single();

  return makeAccess(
    user.id,
    (entitlements ?? []) as UserEntitlement[],
    (credits as CreditBalance) ?? DEFAULT_CREDITS
  );
}

function makeAccess(
  userId: string | null,
  entitlements: UserEntitlement[],
  credits: CreditBalance
): UserAccess {
  const has = (type: EntitlementType) =>
    entitlements.some(
      (e) =>
        e.entitlement === type &&
        e.status === "active" &&
        (!e.expires_at || new Date(e.expires_at) > new Date())
    );

  const hasTemplates = has("templates");
  const hasStrategyBuilder = has("strategy_builder");
  const hasCircle = has("circle");
  const hasAgency = has("agency");
  const hasConsulting = has("consulting");
  const canGenerateStrategy =
    hasStrategyBuilder && (credits.unlimited || credits.credits_remaining > 0);

  // Derive tier name from highest entitlement
  let tierName = "Free";
  if (hasAgency) tierName = "Agency";
  else if (hasCircle && hasStrategyBuilder && hasTemplates) tierName = "Professional";
  else if (hasTemplates && hasStrategyBuilder) tierName = "Templates + Strategy";
  else if (hasTemplates) tierName = "Essentials";
  else if (hasStrategyBuilder) tierName = "Strategy Builder";

  return {
    userId: userId ?? "",
    entitlements,
    credits,
    hasTemplates,
    hasStrategyBuilder,
    hasCircle,
    hasAgency,
    hasConsulting,
    canGenerateStrategy,
    tierName,
  };
}

// ─── Credit Operations (server-side) ─────────────────────────────

/**
 * Consume one strategy credit. Returns true if successful, false if insufficient.
 */
export async function consumeStrategyCredit(
  userId: string,
  strategyProjectId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Check current balance
  const { data: credits } = await supabase
    .from("strategy_credits")
    .select("credits_remaining, unlimited")
    .eq("user_id", userId)
    .single();

  if (!credits) return false;
  if (credits.unlimited) {
    // Log transaction but don't decrement
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -1,
      reason: "generation",
      strategy_project_id: strategyProjectId,
      balance_after: -1, // indicates unlimited
    });
    return true;
  }

  if (credits.credits_remaining <= 0) return false;

  // Atomic decrement
  const { error } = await supabase.rpc("decrement_strategy_credit", {
    p_user_id: userId,
    p_strategy_project_id: strategyProjectId,
  });

  return !error;
}

/**
 * Add credits to a user's balance (from purchase or top-up).
 */
export async function addStrategyCredits(
  userId: string,
  amount: number,
  reason: string,
  sourceProductId?: string
): Promise<void> {
  const supabase = await createClient();

  // Upsert credit balance
  const { data: existing } = await supabase
    .from("strategy_credits")
    .select("credits_remaining, credits_total")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase
      .from("strategy_credits")
      .update({
        credits_remaining: existing.credits_remaining + amount,
        credits_total: existing.credits_total + amount,
      })
      .eq("user_id", userId);
  } else {
    await supabase.from("strategy_credits").insert({
      user_id: userId,
      credits_remaining: amount,
      credits_total: amount,
      credits_used: 0,
      unlimited: false,
    });
  }

  // Log transaction
  const newBalance = existing
    ? existing.credits_remaining + amount
    : amount;

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    reason,
    source_product_id: sourceProductId ?? null,
    balance_after: newBalance,
  });
}

/**
 * Set unlimited credits for a user (Agency tier).
 */
export async function setUnlimitedCredits(userId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("strategy_credits")
    .upsert({
      user_id: userId,
      unlimited: true,
      credits_remaining: 0,
      credits_total: 0,
      credits_used: 0,
    }, { onConflict: "user_id" });
}

// ─── Entitlement Grant/Revoke ────────────────────────────────────

/**
 * Grant an entitlement to a user from a product purchase.
 */
export async function grantEntitlement(
  userId: string,
  entitlement: EntitlementType,
  opts: {
    sourceProductId: string;
    stripeSubscriptionId?: string;
    expiresAt?: string;
    grantedBy?: string;
  }
): Promise<void> {
  const supabase = await createClient();

  // Expire any existing active entitlement of same type
  await supabase
    .from("user_entitlements")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .eq("entitlement", entitlement)
    .eq("status", "active");

  // Create new active entitlement
  await supabase.from("user_entitlements").insert({
    user_id: userId,
    entitlement,
    status: "active",
    source_product_id: opts.sourceProductId,
    stripe_subscription_id: opts.stripeSubscriptionId ?? null,
    expires_at: opts.expiresAt ?? null,
    granted_by: opts.grantedBy ?? "purchase",
  });
}

/**
 * Revoke entitlements tied to a specific Stripe subscription (on cancel).
 */
export async function revokeSubscriptionEntitlements(
  stripeSubscriptionId: string
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("user_entitlements")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .eq("status", "active");
}

// ─── Backward Compatibility ──────────────────────────────────────
// These map to the old subscription.ts interface so existing code doesn't break.

export type PlanType = "free" | "essentials" | "professional" | "agency" | "strategy_only";

export function canAccessTemplates(access: UserAccess): boolean {
  return access.hasTemplates;
}

export function canUseStrategyBuilder(access: UserAccess): boolean {
  return access.hasStrategyBuilder;
}

export function canAccessChallenge(access: UserAccess): boolean {
  return access.hasCircle; // challenge is part of Circle/Professional
}

export function canAccessCommunity(access: UserAccess): boolean {
  return access.hasCircle;
}

export function getPlanDisplayName(access: UserAccess): string {
  return access.tierName;
}
