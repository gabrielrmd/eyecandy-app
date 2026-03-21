import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.208.0/crypto/mod.ts";

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  created: number;
}

interface StripeCustomer {
  id: string;
  email?: string;
  metadata?: Record<string, string>;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  current_period_start: number;
  current_period_end: number;
  trial_start?: number;
  trial_end?: number;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
  metadata?: Record<string, string>;
}

// Verify Stripe webhook signature
async function verifyWebhookSignature(
  req: Request
): Promise<{ valid: boolean; event?: StripeEvent }> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return { valid: false };

  const body = await req.text();
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

  try {
    // Parse Stripe signature
    const parts = signature.split(",");
    let timestamp = "";
    let signedContent = "";

    for (const part of parts) {
      if (part.startsWith("t=")) {
        timestamp = part.substring(2);
      } else if (part.startsWith("v1=")) {
        signedContent = part.substring(3);
      }
    }

    // Create HMAC signature
    const message = `${timestamp}.${body}`;
    const hmac = createHmac("sha256", secret);
    const computedSignature = btoa(
      Array.from(new Uint8Array(await hmac.digest(message)))
        .map((b) => String.fromCharCode(b))
        .join("")
    );

    // Compare signatures with timing-safe comparison
    const isValid = computedSignature === signedContent;

    if (isValid) {
      const event = JSON.parse(body) as StripeEvent;
      return { valid: true, event };
    }
    return { valid: false };
  } catch (error) {
    console.error("Webhook verification error:", error);
    return { valid: false };
  }
}

// Handle checkout.session.completed
async function handleCheckoutSessionCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Record<string, unknown>
): Promise<void> {
  const customerId = session.customer as string;
  const userId = session.metadata?.["user_id"] as string;
  const plan = session.metadata?.["plan"] as string;

  if (!customerId || !userId) {
    console.error("Missing customer_id or user_id in session metadata");
    return;
  }

  // Get or create subscription record
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!existing) {
    // Create new subscription record
    await supabase.from("subscriptions").insert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string,
      plan: plan || "starter",
      status: "active",
      current_period_start: new Date(
        (session.created as number) * 1000
      ).toISOString(),
      current_period_end: new Date(
        ((session.created as number) + 30 * 24 * 60 * 60) * 1000
      ).toISOString(),
    });
  }
}

// Handle customer.subscription.updated
async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: StripeSubscription
): Promise<void> {
  const planMap: Record<string, string> = {
    // Map product IDs to plan names (configure based on your Stripe setup)
    "prod_starter": "starter",
    "prod_professional": "professional",
    "prod_enterprise": "enterprise",
    "prod_template_toolkit": "template_toolkit",
  };

  const productId =
    subscription.items?.data?.[0]?.price?.product || "unknown";
  const plan = planMap[productId] || "starter";

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({
      stripe_subscription_id: subscription.id,
      status: mapStripeStatus(subscription.status),
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      plan,
    })
    .eq("stripe_subscription_id", subscription.id);
}

// Handle customer.subscription.deleted
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: StripeSubscription
): Promise<void> {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}

// Handle invoice.payment_failed
async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Record<string, unknown>
): Promise<void> {
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    // Update subscription status to past_due
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    // Log audit event
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (subscription) {
      await supabase.from("audit_log").insert({
        user_id: subscription.user_id,
        action: "payment_failed",
        resource_type: "subscription",
        resource_id: subscriptionId,
        changes: {
          event: "invoice.payment_failed",
          invoice_id: invoice.id,
        },
      });
    }
  }
}

// Map Stripe subscription status to our enum
function mapStripeStatus(
  stripeStatus: string
): "active" | "past_due" | "canceled" | "trialing" | "incomplete" {
  const statusMap: Record<string, "active" | "past_due" | "canceled" | "trialing" | "incomplete"> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
  };

  return statusMap[stripeStatus] || "incomplete";
}

// Process webhook event
async function processEvent(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
): Promise<void> {
  const eventType = event.type;
  const data = event.data.object as Record<string, unknown>;

  switch (eventType) {
    case "checkout.session.completed":
      console.log("Processing checkout.session.completed");
      await handleCheckoutSessionCompleted(supabase, data);
      break;

    case "customer.subscription.updated":
      console.log("Processing customer.subscription.updated");
      await handleSubscriptionUpdated(supabase, data as StripeSubscription);
      break;

    case "customer.subscription.deleted":
      console.log("Processing customer.subscription.deleted");
      await handleSubscriptionDeleted(supabase, data as StripeSubscription);
      break;

    case "invoice.payment_failed":
      console.log("Processing invoice.payment_failed");
      await handlePaymentFailed(supabase, data);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

// Main handler
async function handler(req: Request): Promise<Response> {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify webhook signature
    const { valid, event } = await verifyWebhookSignature(req);

    if (!valid || !event) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process the event
    await processEvent(supabase, event);

    // Return success response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

Deno.serve(handler);
