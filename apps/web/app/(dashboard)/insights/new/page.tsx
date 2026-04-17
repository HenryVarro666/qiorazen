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
  const checkoutSession = searchParams.get("checkout_session");
  const tierParam = searchParams.get("tier");

  const [questions, setQuestions] = useState([""]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [useAiVersion, setUseAiVersion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ insightId: string | null; questions: string[] } | null>(null);
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
      // If returning from Stripe checkout, verify the session
      if (checkoutSession) {
        try {
          const res = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: checkoutSession }),
          });
          const data = await res.json();
          if (data.verified) {
            setPaymentStatus("paid");
            return;
          }
        } catch {
          // fall through to normal check
        }
      }

      try {
        const res = await fetch("/api/payments/status");
        if (!res.ok) {
          setPaymentStatus("mock");
          return;
        }
        const data = await res.json();
        setPaymentStatus(data.hasAccess ? "paid" : "unpaid");
      } catch {
        setPaymentStatus("mock");
      }
    }

    checkPayment();
  }, [mockPayment, checkoutSession]);

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

  async function handleSummarize() {
    if (activeQuestions.length === 0) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "summarize", text: activeQuestions.join("\n") }),
      });
      const data = await res.json();
      if (data.result) {
        setAiSummary(data.result);
        setUseAiVersion(false);
      }
    } catch {
      // ignore
    } finally {
      setSummarizing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeQuestions.length === 0 || !agreed) return;

    // If user chose AI version, parse it back into questions
    const finalQuestions = useAiVersion && aiSummary
      ? aiSummary.split("\n").map((q) => q.replace(/^\d+\.\s*/, "").trim()).filter(Boolean)
      : activeQuestions;

    setLoading(true);
    setEmergency(null);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: finalQuestions,
          screeningSessionId,
          language: locale,
          tier: tierParam ?? "entry",
        }),
      });

      const data = await res.json();

      if (data.emergency) {
        setEmergency(data.message);
      } else {
        setSubmitted({ insightId: data.insightId, questions: activeQuestions });
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

  // Submission confirmation
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10">
        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
            <svg className="h-7 w-7 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">
            {locale === "zh" ? "问题已提交" : "Questions Submitted"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "AI 已生成初步建议，我们的养生顾问将在 24-48 小时内审核确认后发送给您。"
              : "AI has generated an initial draft. Our wellness advisor will review and deliver your personalized insight within 24-48 hours."}
          </p>

          {/* Show submitted questions */}
          <div className="rounded-lg bg-muted/50 p-4 text-left">
            <p className="text-xs font-medium uppercase text-muted-foreground mb-2">
              {locale === "zh" ? "您提交的问题" : "Your Questions"}
            </p>
            <ol className="space-y-1 text-sm list-decimal list-inside">
              {submitted.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {submitted.insightId && (
            <Link
              href={`/insights/${submitted.insightId}`}
              className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {locale === "zh" ? "查看进度" : "Track Status"}
            </Link>
          )}
          <button
            onClick={() => { setSubmitted(null); setQuestions([""]); setAgreed(false); }}
            className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-accent"
          >
            {locale === "zh" ? "继续提问" : "Ask More"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {locale === "zh" ? "返回首页" : "Dashboard"}
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
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "zh"
            ? "最多 3 个问题，养生顾问将在 24-48 小时内审核后回复"
            : "Up to 3 questions — our advisor will review and respond within 24-48 hours"}
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

      {/* How it works */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">1</div>
          <p className="text-xs text-muted-foreground">
            {locale === "zh" ? "填写您的养生问题" : "Write your questions"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">2</div>
          <p className="text-xs text-muted-foreground">
            {locale === "zh" ? "AI 生成个性化建议" : "AI generates personalized draft"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">3</div>
          <p className="text-xs text-muted-foreground">
            {locale === "zh" ? "养生顾问审核后发送" : "Advisor reviews & delivers"}
          </p>
        </div>
      </div>

      {/* Question form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i}>
              {questions.length > 1 && (
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">
                    {locale === "zh" ? `问题 ${i + 1}` : `Question ${i + 1}`}
                  </label>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      {locale === "zh" ? "移除" : "Remove"}
                    </button>
                  )}
                </div>
              )}
              <textarea
                value={q}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i] = e.target.value;
                  setQuestions(updated);
                }}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={
                  locale === "zh"
                    ? "描述您的养生问题或健康生活方式困惑..."
                    : "Describe your wellness question or lifestyle concern..."
                }
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{q.length}/500</p>
            </div>
          ))}

          {questions.length < 3 && (
            <button
              type="button"
              onClick={() => setQuestions([...questions, ""])}
              className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {locale === "zh" ? "再加一个问题" : "Add another question"}
            </button>
          )}
        </div>

        {/* AI Summarize */}
        {activeQuestions.length > 0 && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {summarizing
                ? (locale === "zh" ? "AI 整理中..." : "AI refining...")
                : (locale === "zh" ? "AI 帮我整理问题" : "AI: Refine my questions")}
            </button>

            {aiSummary && (
              <div className="rounded-lg border bg-brand-50/50 p-4 space-y-3">
                <p className="text-xs font-medium text-brand-700">
                  {locale === "zh" ? "AI 整理版本：" : "AI-refined version:"}
                </p>
                <p className="text-sm whitespace-pre-wrap">{aiSummary}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUseAiVersion(true)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      useAiVersion
                        ? "bg-brand-600 text-white"
                        : "border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {locale === "zh" ? "使用 AI 版本" : "Use AI version"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseAiVersion(false)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      !useAiVersion
                        ? "bg-brand-600 text-white"
                        : "border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {locale === "zh" ? "使用我的原话" : "Use my original"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Consent */}
        <div className="rounded-lg border bg-muted/50 p-4">
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
            ? (locale === "zh" ? "提交中..." : "Submitting...")
            : (locale === "zh"
              ? `提交 ${activeQuestions.length} 个问题`
              : `Submit ${activeQuestions.length} Question${activeQuestions.length !== 1 ? "s" : ""}`)}
        </button>

        <Link
          href="/dashboard"
          className="block text-center text-xs text-brand-600 underline hover:text-brand-700"
        >
          {locale === "zh" ? "返回首页" : "Back to Dashboard"}
        </Link>
      </form>
    </div>
  );
}
