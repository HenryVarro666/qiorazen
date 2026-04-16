"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";

type PaymentStatus = "loading" | "unpaid" | "paid" | "mock";

export default function NewInsightPage() {
  const locale = useLocale() as "en" | "zh";
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const mockPayment = searchParams.get("mock_payment");

  const [questions, setQuestions] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [emergency, setEmergency] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("loading");
  const [checkingOut, setCheckingOut] = useState(false);
  const [screeningSessionId, setScreeningSessionId] = useState<string | null>(null);

  const activeQuestions = questions.filter((q) => q.trim().length > 0);

  // Resolve screening session ID from URL or localStorage
  useEffect(() => {
    const sid = sessionParam ?? localStorage.getItem("qiorazen_screening_session");
    setScreeningSessionId(sid);
  }, [sessionParam]);

  // Check payment status
  useEffect(() => {
    if (mockPayment === "success") {
      setPaymentStatus("mock");
      return;
    }

    async function checkPayment() {
      try {
        const res = await fetch("/api/payments/status");
        if (!res.ok) {
          // API not available — allow access in demo mode
          setPaymentStatus("mock");
          return;
        }
        const data = await res.json();
        setPaymentStatus(data.hasAccess ? "paid" : "unpaid");
      } catch {
        // No API — demo mode
        setPaymentStatus("mock");
      }
    }

    checkPayment();
  }, [mockPayment]);

  async function handleCheckout(tier: "entry" | "core" | "premium") {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckingOut(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeQuestions.length === 0 || !agreed) return;

    setLoading(true);
    setEmergency(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: activeQuestions,
          screeningSessionId,
          language: locale,
          tier: "entry",
        }),
      });

      const data = await res.json();

      if (data.emergency) {
        setEmergency(data.message);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setEmergency(
        locale === "zh"
          ? "发生错误，请稍后重试。"
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (paymentStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "加载中..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Payment gate — show pricing options
  if (paymentStatus === "unpaid") {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {locale === "zh" ? "选择您的方案" : "Choose Your Plan"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "zh"
              ? "获取 AI 个性化养生建议 + 专业顾问审核"
              : "Get AI-personalized wellness insights + expert advisor review"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {/* Starter */}
          <div className="flex flex-col rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-semibold">
              {locale === "zh" ? "入门体验" : "Starter Session"}
            </h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$49</span>
              <span className="text-muted-foreground">
                {locale === "zh" ? " / 次" : " / session"}
              </span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>
                {locale === "zh"
                  ? "1 次个性化养生建议"
                  : "1 personalized wellness insight"}
              </li>
              <li>
                {locale === "zh"
                  ? "最多 3 个问题"
                  : "Up to 3 questions"}
              </li>
              <li>
                {locale === "zh"
                  ? "48 小时内顾问审核"
                  : "Advisor review within 48h"}
              </li>
            </ul>
            <button
              onClick={() => handleCheckout("entry")}
              disabled={checkingOut}
              className="mt-4 rounded-lg border-2 border-brand-600 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
            >
              {checkingOut
                ? (locale === "zh" ? "跳转中..." : "Redirecting...")
                : (locale === "zh" ? "立即购买" : "Get Started")}
            </button>
          </div>

          {/* Core — highlighted */}
          <div className="relative flex flex-col rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-6 shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-semibold text-white">
              {locale === "zh" ? "推荐" : "Recommended"}
            </span>
            <h3 className="text-lg font-semibold">
              {locale === "zh" ? "核心会员" : "Core Membership"}
            </h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$499</span>
              <span className="text-muted-foreground">
                {locale === "zh" ? " / 月" : " / mo"}
              </span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>
                {locale === "zh"
                  ? "每天 2 个问题"
                  : "2 questions per day"}
              </li>
              <li>
                {locale === "zh"
                  ? "持续个性化指导"
                  : "Ongoing personalized guidance"}
              </li>
              <li>
                {locale === "zh"
                  ? "48 小时内顾问审核"
                  : "Advisor review within 48h"}
              </li>
            </ul>
            <button
              onClick={() => handleCheckout("core")}
              disabled={checkingOut}
              className="mt-4 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {checkingOut
                ? (locale === "zh" ? "跳转中..." : "Redirecting...")
                : (locale === "zh" ? "订阅" : "Subscribe")}
            </button>
          </div>

          {/* Premium */}
          <div className="flex flex-col rounded-2xl border bg-card p-6">
            <h3 className="text-lg font-semibold">
              {locale === "zh" ? "尊享会员" : "Premium Advisory"}
            </h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">$1,499</span>
              <span className="text-muted-foreground">
                {locale === "zh" ? " / 月" : " / mo"}
              </span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li>
                {locale === "zh"
                  ? "每天 3 个问题"
                  : "3 questions per day"}
              </li>
              <li>
                {locale === "zh"
                  ? "24 小时内优先审核"
                  : "Priority review within 24h"}
              </li>
              <li>
                {locale === "zh"
                  ? "每周主动 Check-in"
                  : "Weekly proactive check-in"}
              </li>
            </ul>
            <button
              onClick={() => handleCheckout("premium")}
              disabled={checkingOut}
              className="mt-4 rounded-lg border-2 border-brand-600 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
            >
              {checkingOut
                ? (locale === "zh" ? "跳转中..." : "Redirecting...")
                : (locale === "zh" ? "订阅尊享" : "Go Premium")}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {locale === "zh"
            ? "所有付款通过 Stripe 安全处理。可随时取消订阅。"
            : "All payments securely processed via Stripe. Cancel subscriptions anytime."}
        </p>
      </div>
    );
  }

  // Show result
  if (result) {
    return (
      <div className="space-y-6">
        <DisclaimerBanner />

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {locale === "zh" ? "体质概览" : "Constitution Summary"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {(result as any).constitutionSummary}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {locale === "zh" ? "养生建议" : "Wellness Insights"}
          </h2>
          <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {(result as any).wellnessInsights}
          </div>
        </div>

        {(result as any).lifestyleSuggestions && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              {locale === "zh" ? "生活方式建议" : "Lifestyle Suggestions"}
            </h2>
            <div className="space-y-4">
              <SuggestionList
                title={locale === "zh" ? "饮食" : "Dietary"}
                items={(result as any).lifestyleSuggestions.dietary_tendencies}
              />
              <SuggestionList
                title={locale === "zh" ? "运动" : "Activity"}
                items={(result as any).lifestyleSuggestions.activity_suggestions}
              />
              <SuggestionList
                title={locale === "zh" ? "生活习惯" : "Lifestyle"}
                items={(result as any).lifestyleSuggestions.lifestyle_habits}
              />
            </div>
          </div>
        )}

        {(result as any).mock && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
            {locale === "zh"
              ? "这是模拟回复（开发模式）。正式上线后将由 AI 个性化生成并经顾问审核。"
              : "This is a mock response (development mode). In production, content will be AI-generated and advisor-reviewed."}
          </div>
        )}

        {(result as any).insightId && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-center text-sm text-brand-800">
            {locale === "zh"
              ? "您的养生建议将由专业顾问在 48 小时内审核确认。"
              : "Your wellness insight will be reviewed by an advisor within 48 hours."}
            <Link
              href={`/insights/${(result as any).insightId}`}
              className="ml-2 font-medium text-brand-600 underline hover:text-brand-700"
            >
              {locale === "zh" ? "查看状态" : "View Status"}
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {locale === "zh"
            ? "本信息仅供教育参考，不构成医疗建议。如有健康问题，请咨询持证医疗人员。"
            : "This information is for educational purposes only and is not medical advice. Consult a licensed healthcare professional for medical concerns."}
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => { setResult(null); setQuestions(["", "", ""]); setAgreed(false); }}
            className="rounded-lg border px-6 py-2 text-sm hover:bg-accent"
          >
            {locale === "zh" ? "提新问题" : "Ask New Questions"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {locale === "zh" ? "返回首页" : "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {locale === "zh" ? "提交养生咨询" : "Submit Wellness Questions"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "zh"
            ? "最多 3 个问题，我们将基于您的体质提供个性化养生建议"
            : "Up to 3 questions — we'll provide personalized wellness guidance based on your constitution"}
        </p>
      </div>

      <DisclaimerBanner />

      {/* Emergency redirect */}
      {emergency && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">{emergency}</p>
          <p className="mt-2 text-sm text-red-600">
            {locale === "zh" ? "紧急情况请拨打 911" : "For emergencies, call 911"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium">
                {locale === "zh" ? `问题 ${i + 1}` : `Question ${i + 1}`}
                {i > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({locale === "zh" ? "可选" : "optional"})
                  </span>
                )}
              </label>
              <textarea
                value={q}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i] = e.target.value;
                  setQuestions(updated);
                }}
                rows={2}
                maxLength={500}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={
                  locale === "zh"
                    ? "例：最近总是感觉疲劳，有什么生活方式上的建议吗？"
                    : "e.g., I've been feeling tired lately — any lifestyle suggestions?"
                }
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {q.length}/500
              </p>
            </div>
          ))}
        </div>

        {/* Pre-submission consent */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium">
            {locale === "zh" ? "提交前请确认：" : "Before submitting:"}
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span className="text-muted-foreground">
              {locale === "zh"
                ? "我理解本服务不提供医疗诊断或治疗建议。所提供的信息仅基于传统养生理念，供生活方式参考。如有严重或紧急症状，我应立即就医。"
                : "I understand this is NOT a medical consultation. The information provided is based on traditional wellness practices for lifestyle guidance only. If I have severe or urgent symptoms, I should seek immediate medical care."}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={activeQuestions.length === 0 || !agreed || loading}
          className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (locale === "zh" ? "处理中..." : "Processing...")
            : (locale === "zh" ? "提交问题" : "Submit Questions")}
        </button>
      </form>
    </div>
  );
}

function SuggestionList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-brand-700">{title}</h4>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
