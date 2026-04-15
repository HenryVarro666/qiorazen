import { NextResponse, type NextRequest } from "next/server";
import { scoreConstitution, getPrimaryConstitution, type AnswerMap } from "@qiorazen/tcm-engine";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { answers, gender } = body as {
    answers: AnswerMap;
    gender: "male" | "female";
  };

  if (!answers || typeof answers !== "object" || !gender) {
    return NextResponse.json(
      { error: "Answers and gender are required" },
      { status: 400 }
    );
  }

  // Score constitution using GB/T 46939-2025 formula
  const scores = scoreConstitution(answers, gender);
  const primaryConstitution = getPrimaryConstitution(scores);

  // Try to save to database if Supabase is configured
  let sessionId: string | null = null;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const sessionToken = randomUUID();

      const { data } = await supabase
        .from("screening_sessions")
        .insert({
          user_id: user?.id ?? null,
          session_token: sessionToken,
          status: "completed",
          answers,
          constitution_scores: scores,
          primary_constitution: primaryConstitution,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      sessionId = data?.id ?? null;
    }
  } catch {
    // DB not available — still return results
  }

  return NextResponse.json({
    sessionId,
    scores,
    primaryConstitution,
  });
}
