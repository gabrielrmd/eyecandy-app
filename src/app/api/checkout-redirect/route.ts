import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { STRIPE_PRICES, type ProductId } from "@/lib/products";

/**
 * GET /api/checkout-redirect?productId=essentials_yearly
 *
 * Server-side redirect to Stripe checkout. Used after signup
 * to immediately send the new user to pay for their selected plan.
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId") as ProductId | null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!productId || !STRIPE_PRICES[productId]) {
    return NextResponse.redirect(`${appUrl}/pricing`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/signup?plan=${productId}`);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    const isOneTime = ["strategy_standalone", "credit_pack_5", "consulting_session"].includes(productId);

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_id: productId,
      },
      line_items: [{ price: STRIPE_PRICES[productId], quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success&product=${productId}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }
  } catch (err) {
    console.error("Checkout redirect error:", err);
  }

  return NextResponse.redirect(`${appUrl}/pricing`);
}
