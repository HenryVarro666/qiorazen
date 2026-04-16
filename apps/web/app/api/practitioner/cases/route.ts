import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ cases: [], mock: true });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify practitioner role
  const { data: practitioner } = await supabase
    .from("practitioners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!practitioner) {
    return NextResponse.json({ error: "Not a practitioner" }, { status: 403 });
  }

  // Fetch cases pending review, sorted by SLA urgency
  const { data: cases } = await supabase
    .from("insight_requests")
    .select(`
      id,
      status,
      tier,
      user_questions,
      ai_wellness_insight,
      ai_constitution_summary,
      ai_lifestyle_suggestions,
      response_deadline,
      created_at,
      screening_session_id
    `)
    .in("status", ["practitioner_pending", "ai_complete"])
    .order("response_deadline", { ascending: true });

  return NextResponse.json({ cases: cases ?? [] });
}
