import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sanitizeOutput } from "@/lib/ai/guardrails";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ success: true, mock: true });
  }

  // Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service client to bypass RLS for the update
  const adminDb = await createServiceClient();

  // Verify practitioner role
  const { data: practitioner } = await adminDb
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

  // Update the insight request (using service client to bypass RLS)
  const now = new Date().toISOString();
  const { error } = await adminDb
    .from("insight_requests")
    .update({
      status: "practitioner_approved",
      practitioner_id: practitioner.id,
      practitioner_notes: sanitizedNotes,
      practitioner_reviewed_at: now,
      practitioner_approved_at: now,
    })
    .eq("id", id)
    .in("status", ["practitioner_pending", "ai_complete"]);

  if (error) {
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
