import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ received: true, mock: true });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier;
      const insightRequestId = session.metadata?.insight_request_id;

      if (insightRequestId) {
        await supabase
          .from("insight_requests")
          .update({
            status: "paid",
            stripe_payment_intent_id: session.payment_intent as string,
            tier,
          })
          .eq("id", insightRequestId);
      }

      // Record payment
      if (userId) {
        await supabase.from("payments").insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_cents: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          payment_type: session.mode === "subscription" ? "subscription" : "one_time",
          insight_request_id: insightRequestId || null,
          status: "completed",
        });
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.user_id;
      const tier = subscription.metadata?.tier as "core" | "premium" | undefined;

      if (userId && tier) {
        const periodStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : new Date().toISOString();
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabase.from("subscriptions").insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          tier,
          status: "active",
          daily_questions_limit: tier === "premium" ? 3 : 2,
          questions_used_today: 0,
          last_question_reset_date: new Date().toISOString().split("T")[0],
          current_period_start: periodStart,
          current_period_end: periodEnd,
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;
      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({
            questions_used_today: 0,
            status: "active",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
