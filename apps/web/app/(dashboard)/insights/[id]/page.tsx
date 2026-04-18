"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";

interface Insight {
  id: string;
  status: string;
  tier: string;
  user_questions: string[];
  ai_wellness_insight: string | null;
  ai_constitution_summary: string | null;
  ai_lifestyle_suggestions: {
    dietary_tendencies?: string[];
    activity_suggestions?: string[];
    lifestyle_habits?: string[];
  } | null;
  practitioner_notes: string | null;
  practitioner_approved_at: string | null;
  final_insight: string | null;
  response_deadline: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { en: string; zh: string; color: string }> = {
  pending_payment: { en: "Pending Payment", zh: "等待付款", color: "bg-gray-100 text-gray-700" },
  paid: { en: "Paid — Processing", zh: "已付款 — 处理中", color: "bg-blue-100 text-blue-700" },
  ai_processing: { en: "AI Processing", zh: "AI 处理中", color: "bg-blue-100 text-blue-700" },
  ai_complete: { en: "Pending Review", zh: "等待审核", color: "bg-amber-100 text-amber-700" },
  practitioner_pending: { en: "Under Review", zh: "审核中", color: "bg-amber-100 text-amber-700" },
  practitioner_approved: { en: "Approved", zh: "已通过", color: "bg-green-100 text-green-700" },
  delivered: { en: "Delivered", zh: "已送达", color: "bg-green-100 text-green-700" },
};

export default function InsightDetailPage() {
  const locale = useLocale() as "en" | "zh";
  const { id } = useParams<{ id: string }>();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/insights/${id}`);
        if (!res.ok) {
          setError(locale === "zh" ? "未找到该记录" : "Insight not found");
          return;
        }
        const data = await res.json();
        setInsight(data.insight);
      } catch {
        setError(locale === "zh" ? "加载失败" : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "加载中..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Link
          href="/dashboard"
          className="text-sm text-brand-600 underline hover:text-brand-700"
        >
          {locale === "zh" ? "返回首页" : "Back to Dashboard"}
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[insight.status] ?? STATUS_LABELS.ai_complete;
  const isReady = ["practitioner_approved", "delivered"].includes(insight.status);
  const deadlineDate = insight.response_deadline ? new Date(insight.response_deadline) : null;
  const suggestions = insight.ai_lifestyle_suggestions;

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Status header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === "zh" ? "养生建议详情" : "Wellness Insight"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(insight.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
          {status[locale]}
        </span>
      </div>

      {/* Timeline / status message */}
      {!isReady && deadlineDate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {locale === "zh"
            ? `您的养生建议正在由专业顾问审核中，预计 ${deadlineDate.toLocaleDateString("zh-CN")} 前完成。`
            : `Your wellness insight is being reviewed by an advisor. Expected by ${deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`}
        </div>
      )}

      {/* User's questions */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">
          {locale === "zh" ? "您的问题" : "Your Questions"}
        </h3>
        <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
          {insight.user_questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </div>

      {/* Constitution summary */}
      {insight.ai_constitution_summary && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {locale === "zh" ? "体质概览" : "Constitution Summary"}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {insight.ai_constitution_summary}
          </p>
        </div>
      )}

      {/* Wellness insights */}
      {insight.ai_wellness_insight && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {locale === "zh" ? "养生建议" : "Wellness Insights"}
          </h3>
          <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {insight.final_insight ?? insight.ai_wellness_insight}
          </div>
        </div>
      )}

      {/* Lifestyle suggestions */}
      {suggestions && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">
            {locale === "zh" ? "生活方式建议" : "Lifestyle Suggestions"}
          </h3>
          <div className="space-y-4">
            {suggestions.dietary_tendencies && suggestions.dietary_tendencies.length > 0 && (
              <SuggestionList
                title={locale === "zh" ? "饮食" : "Dietary"}
                items={suggestions.dietary_tendencies}
              />
            )}
            {suggestions.activity_suggestions && suggestions.activity_suggestions.length > 0 && (
              <SuggestionList
                title={locale === "zh" ? "运动" : "Activity"}
                items={suggestions.activity_suggestions}
              />
            )}
            {suggestions.lifestyle_habits && suggestions.lifestyle_habits.length > 0 && (
              <SuggestionList
                title={locale === "zh" ? "生活习惯" : "Lifestyle"}
                items={suggestions.lifestyle_habits}
              />
            )}
          </div>
        </div>
      )}

      {/* Advisor notes */}
      {insight.practitioner_notes && (
        <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-6">
          <h3 className="text-sm font-semibold uppercase text-brand-700">
            {locale === "zh" ? "顾问备注" : "Advisor Note"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed">
            {insight.practitioner_notes}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        {locale === "zh"
          ? "本信息仅供教育参考，不构成医疗建议。如有健康问题，请咨询持证医疗人员。"
          : "This information is for educational purposes only and is not medical advice. Consult a licensed healthcare professional for medical concerns."}
      </p>

      <div className="flex justify-center gap-4">
        <Link
          href="/insights/new"
          className="rounded-lg border px-6 py-2 text-sm font-medium hover:bg-accent"
        >
          {locale === "zh" ? "继续提问" : "Ask More"}
        </Link>
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

function SuggestionList({ title, items }: { title: string; items: string[] }) {
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
