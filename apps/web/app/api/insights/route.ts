import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWellnessInsight } from "@/lib/ai/client";
import { detectSeriousSymptoms } from "@/lib/ai/symptom-detector";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("insight_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ insights: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    questions,
    screeningSessionId,
    language = "en",
  } = body as {
    questions: string[];
    screeningSessionId?: string;
    language?: "en" | "zh";
  };

  if (!questions || !Array.isArray(questions) || questions.length === 0 || questions.length > 3) {
    return NextResponse.json({ error: "1-3 questions required" }, { status: 400 });
  }

  // Serious symptom pre-check
  const symptomCheck = detectSeriousSymptoms(questions);
  if (symptomCheck.detected) {
    return NextResponse.json({
      emergency: true,
      message: language === "zh"
        ? "您描述的情况可能需要立即就医。如遇紧急情况，请拨打 911。"
        : "You've described something that may require immediate medical attention. Please call 911.",
    });
  }

  // Single supabase client for entire request
  let userId: string | null = null;
  let verifiedTier = "entry";
  let constitutionScores = null;
  let primaryConstitution = "balanced";
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;

    // Check subscription tier
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, tier, questions_used_today, daily_questions_limit, last_question_reset_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (sub) {
      verifiedTier = sub.tier;

      // Payment gate: check daily limit
      if (process.env.STRIPE_SECRET_KEY) {
        const today = new Date().toISOString().split("T")[0];
        const usedToday = sub.last_question_reset_date !== today ? 0 : sub.questions_used_today;
        if (usedToday >= sub.daily_questions_limit) {
          return NextResponse.json({
            error: language === "zh" ? "今日提问额度已用完" : "Daily question limit reached",
          }, { status: 429 });
        }
        await supabase
          .from("subscriptions")
          .update({ questions_used_today: usedToday + 1, last_question_reset_date: today })
          .eq("id", sub.id);
      }
    } else if (process.env.STRIPE_SECRET_KEY) {
      // No subscription — check one-time payment credits
      const { data: payments } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .eq("payment_type", "one_time")
        .is("insight_request_id", null)
        .limit(1);

      if (!payments || payments.length === 0) {
        return NextResponse.json({
          error: language === "zh" ? "请先购买服务" : "Payment required",
        }, { status: 402 });
      }
    }

    // Get screening data
    if (screeningSessionId) {
      const { data: session } = await supabase
        .from("screening_sessions")
        .select("constitution_scores, primary_constitution")
        .eq("id", screeningSessionId)
        .maybeSingle();

      if (session) {
        constitutionScores = session.constitution_scores;
        primaryConstitution = session.primary_constitution ?? "balanced";
      }
    }
  }

  // Generate AI insight
  const now = new Date();
  const deadlineHours = verifiedTier === "premium" ? 24 : 48;
  const deadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);

  const result = await generateWellnessInsight({
    constitutionScores: constitutionScores ?? {
      balanced: 50, qi_deficiency: 50, yang_deficiency: 50,
      yin_deficiency: 50, phlegm_dampness: 50, damp_heat: 50,
      blood_stasis: 50, qi_stagnation: 50, inherited_special: 50,
    },
    primaryConstitution: primaryConstitution as any,
    userQuestions: questions,
    language,
  });

  if (result.seriousFlag) {
    return NextResponse.json({
      emergency: true,
      message: language === "zh"
        ? "我们检测到您的问题可能涉及需要专业医疗关注的情况。请咨询持证医疗人员。"
        : "We detected your questions may involve situations requiring professional medical attention. Please consult a licensed healthcare provider.",
    });
  }

  // Save to DB
  let insightId: string | null = null;
  if (supabase && userId) {
    const { data } = await supabase
      .from("insight_requests")
      .insert({
        user_id: userId,
        screening_session_id: screeningSessionId ?? null,
        status: "practitioner_pending",
        tier: verifiedTier,
        user_questions: questions,
        ai_draft: result,
        ai_wellness_insight: result.wellnessInsights,
        ai_constitution_summary: result.constitutionSummary,
        ai_lifestyle_suggestions: result.lifestyleSuggestions,
        response_deadline: deadline.toISOString(),
        disclaimer_version: "v1.0",
      })
      .select("id")
      .single();

    insightId = data?.id ?? null;
  }

  return NextResponse.json({
    insightId,
    ...result,
    responseDeadline: deadline.toISOString(),
  });
}
