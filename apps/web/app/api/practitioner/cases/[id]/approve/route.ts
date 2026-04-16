import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeOutput } from "@/lib/ai/guardrails";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ success: true, mock: true });
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

  const body = await request.json();
  const { notes } = body as { notes?: string };

  // Sanitize advisor notes through guardrails
  let sanitizedNotes: string | null = null;
  if (notes && notes.trim()) {
    const result = sanitizeOutput(notes);
    sanitizedNotes = result.sanitizedText;
  }

  // Update the insight request
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("insight_requests")
    .update({
      status: "practitioner_approved",
      practitioner_id: practitioner.id,
      practitioner_notes: sanitizedNotes,
      practitioner_reviewed_at: now,
      practitioner_approved_at: now,
      final_insight: null, // Could merge AI draft + notes here
    })
    .eq("id", id)
    .in("status", ["practitioner_pending", "ai_complete"]);

  if (error) {
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
