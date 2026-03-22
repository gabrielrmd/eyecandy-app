import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe Webhook Handler
 *
 * Handles checkout completion, subscription changes, and payment failures.
 * Creates proper entitlements and credits based on the purchased product.
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "");
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

// ── Product configuration: what each product grants ──
interface ProductGrant {
  entitlements: string[];
  credits: number;
  unlimited: boolean;
  isSubscription: boolean;
}

const PRODUCT_GRANTS: Record<string, ProductGrant> = {
  essentials_monthly:       { entitlements: ["templates"], credits: 0, unlimited: false, isSubscription: true },
  essentials_yearly:        { entitlements: ["templates"], credits: 0, unlimited: false, isSubscription: true },
  professional_monthly:     { entitlements: ["templates", "strategy_builder", "circle"], credits: 5, unlimited: false, isSubscription: true },
  professional_yearly:      { entitlements: ["templates", "strategy_builder", "circle"], credits: 5, unlimited: false, isSubscription: true },
  agency_monthly:           { entitlements: ["templates", "strategy_builder", "circle", "agency"], credits: 0, unlimited: true, isSubscription: true },
  agency_yearly:            { entitlements: ["templates", "strategy_builder", "circle", "agency"], credits: 0, unlimited: true, isSubscription: true },
  strategy_standalone:      { entitlements: ["strategy_builder"], credits: 5, unlimited: false, isSubscription: false },
  credit_pack_5:            { entitlements: [], credits: 5, unlimited: false, isSubscription: false },
  consulting_session:       { entitlements: ["consulting"], credits: 0, unlimited: false, isSubscription: false },
  templates_strategy_yearly: { entitlements: ["templates", "strategy_builder"], credits: 5, unlimited: false, isSubscription: true },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabase();

  try {
    switch (event.type) {
      // ── Checkout completed: grant entitlements + credits ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const productId = session.metadata?.product_id;

        if (!userId || !productId) {
          console.warn("Checkout missing metadata:", { userId, productId });
          break;
        }

        const grant = PRODUCT_GRANTS[productId];
        if (!grant) {
          console.warn("Unknown product_id:", productId);
          break;
        }

        // Record the purchase
        await supabase.from("purchases").insert({
          user_id: userId,
          product_id: productId,
          stripe_checkout_session_id: session.id,
          stripe_subscription_id: (session.subscription as string) || null,
          stripe_invoice_id: (session.invoice as string) || null,
          amount_cents: session.amount_total,
          currency: session.currency?.toUpperCase() || "EUR",
          status: "completed",
        });

        // Grant entitlements
        for (const entitlement of grant.entitlements) {
          // Expire existing active entitlement of same type
          await supabase
            .from("user_entitlements")
            .update({ status: "expired" })
            .eq("user_id", userId)
            .eq("entitlement", entitlement)
            .eq("status", "active");

          // Calculate expiry for subscriptions
          let expiresAt: string | null = null;
          if (grant.isSubscription) {
            // Subscription expiry managed by Stripe — set a generous window
            // that gets updated on subscription.updated events
            const d = new Date();
            if (productId.includes("yearly")) {
              d.setFullYear(d.getFullYear() + 1);
              d.setMonth(d.getMonth() + 1); // 1 month grace
            } else {
              d.setMonth(d.getMonth() + 2); // 1 month + grace
            }
            expiresAt = d.toISOString();
          }
          // One-time purchases: no expiry (null)

          await supabase.from("user_entitlements").insert({
            user_id: userId,
            entitlement,
            status: "active",
            source_product_id: productId,
            stripe_subscription_id: (session.subscription as string) || null,
            expires_at: expiresAt,
            granted_by: "purchase",
          });
        }

        // Grant credits
        if (grant.credits > 0) {
          const { data: existing } = await supabase
            .from("strategy_credits")
            .select("credits_remaining, credits_total")
            .eq("user_id", userId)
            .single();

          if (existing) {
            await supabase
              .from("strategy_credits")
              .update({
                credits_remaining: existing.credits_remaining + grant.credits,
                credits_total: existing.credits_total + grant.credits,
              })
              .eq("user_id", userId);
          } else {
            await supabase.from("strategy_credits").insert({
              user_id: userId,
              credits_remaining: grant.credits,
              credits_total: grant.credits,
              credits_used: 0,
              unlimited: false,
            });
          }

          // Log credit transaction
          await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: grant.credits,
            reason: "purchase",
            source_product_id: productId,
            balance_after: (existing?.credits_remaining ?? 0) + grant.credits,
          });
        }

        // Set unlimited for Agency
        if (grant.unlimited) {
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

        // Also update old subscriptions table for backward compat
        if (grant.isSubscription && session.subscription) {
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan_type: productId.startsWith("agency") ? "enterprise" :
                       productId.startsWith("professional") ? "professional" :
                       "template_toolkit",
            status: "active",
            current_period_start: new Date().toISOString(),
          }, { onConflict: "stripe_subscription_id" });
        }

        console.log(`✓ Checkout fulfilled: user=${userId} product=${productId} entitlements=${grant.entitlements.join(",")} credits=${grant.credits}`);
        break;
      }

      // ── Subscription canceled: revoke entitlements ──
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("user_entitlements")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id)
          .eq("status", "active");

        // Also update old subscriptions table
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`✓ Subscription canceled: ${subscription.id}`);
        break;
      }

      // ── Subscription updated (renewal, plan change) ──
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === "past_due" || subscription.status === "unpaid") {
          // Suspend entitlements
          await supabase
            .from("user_entitlements")
            .update({ status: "suspended" })
            .eq("stripe_subscription_id", subscription.id)
            .eq("status", "active");
        } else if (subscription.status === "active") {
          // Reactivate if previously suspended
          await supabase
            .from("user_entitlements")
            .update({ status: "active" })
            .eq("stripe_subscription_id", subscription.id)
            .eq("status", "suspended");

          // Update expiry based on current period end
          if (subscription.items.data[0]?.current_period_end) {
            const expiresAt = new Date(subscription.items.data[0].current_period_end * 1000);
            expiresAt.setDate(expiresAt.getDate() + 7); // 7-day grace
            await supabase
              .from("user_entitlements")
              .update({ expires_at: expiresAt.toISOString() })
              .eq("stripe_subscription_id", subscription.id);
          }
        }

        // Update old subscriptions table
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      // ── Payment failed ──
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subId = (invoice as any).subscription || (invoice as any).parent?.subscription_details?.subscription;
        if (subId) {
          await supabase
            .from("user_entitlements")
            .update({ status: "suspended" })
            .eq("stripe_subscription_id", subId as string)
            .eq("status", "active");

          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subId as string);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
