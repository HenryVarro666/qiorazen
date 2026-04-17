-- ==========================================
-- Qiorazen 管理员常用 SQL
-- 在 Supabase SQL Editor 中执行
-- ==========================================

-- 1. 查看所有注册用户
SELECT id, email, display_name, created_at FROM public.profiles ORDER BY created_at DESC;

-- 2. 注册 Advisor（替换 uuid 和名字）
-- INSERT INTO public.practitioners (user_id, display_name, title, specialties, is_active)
-- VALUES (
--   '替换为用户的uuid',
--   '顾问名字',
--   'TCM Wellness Consultant',
--   ARRAY['Constitution Analysis', 'Lifestyle Guidance'],
--   true
-- );

-- 3. 查看所有 Advisor
SELECT p.id, p.display_name, p.title, p.is_active, pr.email
FROM public.practitioners p
JOIN public.profiles pr ON p.user_id = pr.id;

-- 4. 查看待审核案例
SELECT id, status, tier, user_questions, response_deadline, created_at
FROM public.insight_requests
WHERE status IN ('practitioner_pending', 'ai_complete')
ORDER BY response_deadline ASC;

-- 5. 查看所有 insight 请求（含状态）
SELECT id, status, tier, user_questions, created_at
FROM public.insight_requests
ORDER BY created_at DESC;

-- 6. 查看支付记录
SELECT id, user_id, amount_cents, payment_type, status, created_at
FROM public.payments
ORDER BY created_at DESC;

-- 7. 查看订阅
SELECT id, user_id, tier, status, daily_questions_limit, questions_used_today, current_period_end
FROM public.subscriptions
ORDER BY created_at DESC;

-- 8. 查看测评历史
SELECT id, user_id, primary_constitution, completed_at
FROM public.screening_sessions
WHERE status = 'completed'
ORDER BY completed_at DESC;

-- 9. 停用某个 Advisor
-- UPDATE public.practitioners SET is_active = false WHERE user_id = '替换uuid';

-- 10. 手动将 insight 标记为已送达
-- UPDATE public.insight_requests SET status = 'delivered' WHERE id = '替换insight_id';
