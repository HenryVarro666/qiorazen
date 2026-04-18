import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ verified: true, mock: true });
  }

  // Verify with Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ verified: false, reason: "invalid_session" }, { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ verified: false, reason: "not_paid" });
  }

  if (!session.amount_total || session.amount_total <= 0) {
    return NextResponse.json({ verified: false, reason: "invalid_amount" }, { status: 400 });
  }

  // Record payment in DB
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ verified: true, noDb: true });
  }

  const tier = session.metadata?.tier ?? "entry";

  // Check if already recorded (idempotent)
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", session.payment_intent as string)
    .maybeSingle();

  if (!existing) {
    await supabase.from("payments").insert({
      user_id: user.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      payment_type: session.mode === "subscription" ? "subscription" : "one_time",
      status: "completed",
    });
  }

  return NextResponse.json({ verified: true, tier });
}
