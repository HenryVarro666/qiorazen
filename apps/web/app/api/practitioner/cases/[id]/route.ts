import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
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

  const { data, error } = await supabase
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
      created_at
    `)
    .eq("id", id)
    .in("status", ["practitioner_pending", "ai_complete", "practitioner_approved", "delivered"])
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ case: data });
}
