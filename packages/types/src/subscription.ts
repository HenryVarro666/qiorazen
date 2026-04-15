export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type SubscriptionTier = "core" | "premium" | "elite";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  daily_questions_limit: number;
  questions_used_today: number;
  last_question_reset_date: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount_cents: number;
  currency: string;
  payment_type: "one_time" | "subscription";
  insight_request_id: string | null;
  subscription_id: string | null;
  status: string;
  created_at: string;
}
