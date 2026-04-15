CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');
CREATE TYPE subscription_tier AS ENUM ('core', 'premium', 'elite');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  daily_questions_limit INTEGER NOT NULL DEFAULT 2,
  questions_used_today INTEGER NOT NULL DEFAULT 0,
  last_question_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscription_stripe ON public.subscriptions(stripe_subscription_id);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('one_time', 'subscription')),
  insight_request_id UUID REFERENCES public.insight_requests(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_user ON public.payments(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
