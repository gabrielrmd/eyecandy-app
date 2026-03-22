import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { STRIPE_PRICES, type ProductId } from "@/lib/products";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-02-25.clover",
  });
}

// Products that are one-time payments (not subscriptions)
const ONE_TIME_PRODUCTS: ProductId[] = [
  "strategy_standalone",
  "credit_pack_5",
  "consulting_session",
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // ── Handle Stripe Customer Portal ──
    if (body.action === "portal") {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("stripe_subscription_id")
        .eq("user_id", user.id)
        .not("stripe_subscription_id", "is", null)
        .limit(1)
        .single();

      // Also check old subscriptions table for backward compat
      if (!purchase) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", user.id)
          .single();

        if (sub?.stripe_customer_id) {
          const portal = await getStripe().billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
          });
          return NextResponse.json({ url: portal.url });
        }

        return NextResponse.json(
          { error: "No active subscription found" },
          { status: 404 }
        );
      }

      // Find customer from subscription
      const subscription = await getStripe().subscriptions.retrieve(
        purchase.stripe_subscription_id!
      );
      const portal = await getStripe().billingPortal.sessions.create({
        customer: subscription.customer as string,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
      });
      return NextResponse.json({ url: portal.url });
    }

    // ── Handle Checkout Session Creation ──
    const { productId } = body as { productId: ProductId };

    if (!productId || !STRIPE_PRICES[productId]) {
      return NextResponse.json(
        { error: "Valid product ID required" },
        { status: 400 }
      );
    }

    const priceId = STRIPE_PRICES[productId];
    const isOneTime = ONE_TIME_PRODUCTS.includes(productId);

    const session = await getStripe().checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_id: productId,
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&product=${productId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      ...(isOneTime
        ? { invoice_creation: { enabled: true } }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
