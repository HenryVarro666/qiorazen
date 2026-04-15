export type InsightStatus =
  | "pending_payment"
  | "paid"
  | "ai_processing"
  | "ai_complete"
  | "practitioner_pending"
  | "practitioner_approved"
  | "delivered"
  | "refunded";

export type InsightTier = "entry" | "core" | "premium" | "elite";

export interface LifestyleSuggestions {
  dietary_tendencies: string[];
  activity_suggestions: string[];
  lifestyle_habits: string[];
}

export interface InsightRequest {
  id: string;
  user_id: string;
  screening_session_id: string | null;
  tongue_image_id: string | null;
  status: InsightStatus;
  tier: InsightTier;
  user_questions: string[];

  // AI output
  ai_draft: Record<string, unknown> | null;
  ai_wellness_insight: string | null;
  ai_constitution_summary: string | null;
  ai_lifestyle_suggestions: LifestyleSuggestions | null;

  // Practitioner review
  practitioner_id: string | null;
  practitioner_notes: string | null;
  practitioner_reviewed_at: string | null;
  practitioner_approved_at: string | null;

  // Final output
  final_insight: string | null;
  disclaimer_version: string;

  // Payment
  stripe_payment_intent_id: string | null;
  amount_cents: number | null;
  currency: string;
  is_subscription_use: boolean;

  // SLA
  response_deadline: string | null;

  // Compliance
  serious_symptom_detected: boolean;
  emergency_redirect_shown: boolean;

  created_at: string;
  updated_at: string;
}
