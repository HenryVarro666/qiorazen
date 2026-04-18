import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ hasAccess: true, mock: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasAccess: false, reason: "unauthenticated" });
  }

  // Check active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, tier, status, daily_questions_limit, questions_used_today, last_question_reset_date")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscription) {
    // Reset daily counter if it's a new day
    const today = new Date().toISOString().split("T")[0];
    let usedToday = subscription.questions_used_today;
    if (subscription.last_question_reset_date !== today) {
      usedToday = 0;
      await supabase
        .from("subscriptions")
        .update({ questions_used_today: 0, last_question_reset_date: today })
        .eq("id", subscription.id);
    }

    const atLimit = usedToday >= subscription.daily_questions_limit;
    return NextResponse.json({
      hasAccess: !atLimit,
      tier: subscription.tier,
      subscription: true,
      questionsUsedToday: usedToday,
      dailyLimit: subscription.daily_questions_limit,
      atLimit,
    });
  }

  // Check one-time payments (entry tier) with unused insight credits
  const { data: payments } = await supabase
    .from("payments")
    .select("id, insight_request_id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .eq("payment_type", "one_time")
    .is("insight_request_id", null);

  if (payments && payments.length > 0) {
    return NextResponse.json({
      hasAccess: true,
      tier: "entry",
      subscription: false,
      unusedCredits: payments.length,
    });
  }

  return NextResponse.json({ hasAccess: false, reason: "no_payment" });
}
