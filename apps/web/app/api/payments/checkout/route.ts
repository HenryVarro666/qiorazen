import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { PRICES, type PriceTier } from "@/lib/stripe/prices";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tier, insightRequestId, screeningSessionId } = body as {
    tier: PriceTier;
    insightRequestId?: string;
    screeningSessionId?: string;
  };

  if (!tier || !PRICES[tier === "core" ? "coreMonthly" : tier === "premium" ? "premiumMonthly" : "entry"]) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    // Mock mode — no Stripe key configured
    return NextResponse.json({
      url: `/insights/new?mock_payment=success&tier=${tier}`,
      mock: true,
    });
  }

  // Get user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSubscription = tier === "core" || tier === "premium";
  const priceId = tier === "core"
    ? PRICES.coreMonthly
    : tier === "premium"
    ? PRICES.premiumMonthly
    : PRICES.entry;

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/insights/new?checkout_session={CHECKOUT_SESSION_ID}&tier=${tier}${screeningSessionId ? `&session=${screeningSessionId}` : ""}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/insights/new?payment=cancelled`,
    metadata: {
      user_id: user.id,
      tier,
      insight_request_id: insightRequestId ?? "",
    },
  });

  return NextResponse.json({ url: session.url });
}
