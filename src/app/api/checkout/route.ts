import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

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

    // Handle Stripe Customer Portal
    if (body.action === "portal") {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .single();

      if (!subscription?.stripe_customer_id) {
        return NextResponse.json(
          { error: "No subscription found" },
          { status: 404 }
        );
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Handle Checkout Session creation
    const { priceId, plan } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID required" },
        { status: 400 }
      );
    }

    const isSubscription = plan !== "starter"; // Starter is one-time

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan: plan || "template_toolkit",
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
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
