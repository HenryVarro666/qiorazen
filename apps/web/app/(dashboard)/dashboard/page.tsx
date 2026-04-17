"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { CONSTITUTION_INFO } from "@qiorazen/tcm-engine";
import type { ConstitutionType } from "@qiorazen/types";

interface ScreeningData {
  id: string;
  primary_constitution: ConstitutionType;
  constitution_scores: Record<string, number>;
  completed_at: string;
}

interface InsightSummary {
  id: string;
  status: string;
  tier: string;
  user_questions: string[];
  created_at: string;
  response_deadline: string | null;
}

const STATUS_LABELS: Record<string, { en: string; zh: string; color: string }> = {
  pending_payment: { en: "Pending Payment", zh: "等待付款", color: "bg-gray-100 text-gray-700" },
  paid: { en: "Processing", zh: "处理中", color: "bg-blue-100 text-blue-700" },
  ai_processing: { en: "AI Processing", zh: "AI 处理中", color: "bg-blue-100 text-blue-700" },
  ai_complete: { en: "Pending Review", zh: "等待审核", color: "bg-amber-100 text-amber-700" },
  practitioner_pending: { en: "Under Review", zh: "审核中", color: "bg-amber-100 text-amber-700" },
  practitioner_approved: { en: "Approved", zh: "已通过", color: "bg-green-100 text-green-700" },
  delivered: { en: "Delivered", zh: "已送达", color: "bg-green-100 text-green-700" },
};

export default function DashboardPage() {
  const locale = useLocale() as "en" | "zh";
  const [screening, setScreening] = useState<ScreeningData | null>(null);
  const [insights, setInsights] = useState<InsightSummary[]>([]);
  const [plan, setPlan] = useState<{ tier: string; subscription: boolean } | null>(null);
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [screeningRes, insightsRes, paymentRes, practitionerRes] = await Promise.all([
          fetch("/api/screening/latest"),
          fetch("/api/insights"),
          fetch("/api/payments/status"),
          fetch("/api/practitioner/check"),
        ]);

        if (screeningRes.ok) {
          const data = await screeningRes.json();
          if (data.screening) setScreening(data.screening);
        }

        if (insightsRes.ok) {
          const data = await insightsRes.json();
          if (data.insights) setInsights(data.insights);
        }

        if (paymentRes.ok) {
          const data = await paymentRes.json();
          if (data.hasAccess) {
            setPlan({ tier: data.tier ?? "entry", subscription: data.subscription ?? false });
          }
        }

        if (practitionerRes.ok) {
          const data = await practitionerRes.json();
          if (data.isPractitioner) setIsPractitioner(true);
        }
      } catch {
        // Continue with empty state
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "加载中..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {locale === "zh" ? "欢迎回来" : "Welcome Back"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {locale === "zh" ? "您的养生洞察仪表盘" : "Your wellness insights dashboard"}
        </p>
      </div>

      {/* Advisor portal link */}
      {isPractitioner && (
        <Link
          href="/portal"
          className="flex items-center justify-between rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 transition-colors hover:border-amber-400"
        >
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {locale === "zh" ? "养生顾问工作台" : "Advisor Portal"}
            </p>
            <p className="text-xs text-amber-600">
              {locale === "zh" ? "审核待处理的养生咨询" : "Review pending wellness consultations"}
            </p>
          </div>
          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Plan badge */}
      {plan && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          plan.tier === "premium"
            ? "bg-purple-100 text-purple-800"
            : plan.tier === "core"
            ? "bg-brand-100 text-brand-800"
            : "bg-blue-100 text-blue-800"
        }`}>
          {plan.tier === "premium"
            ? (locale === "zh" ? "尊享会员" : "Premium Advisory")
            : plan.tier === "core"
            ? (locale === "zh" ? "核心会员" : "Core Membership")
            : (locale === "zh" ? "入门体验" : "Starter Session")}
          {plan.subscription && (
            <span className="ml-2 text-xs opacity-70">
              {locale === "zh" ? "· 订阅中" : "· Active"}
            </span>
          )}
        </div>
      )}

      {/* Constitution profile */}
      {screening ? (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {locale === "zh" ? "您的体质类型" : "Your Constitution"}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-700">
                {CONSTITUTION_INFO[screening.primary_constitution]?.name[locale] ?? screening.primary_constitution}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {CONSTITUTION_INFO[screening.primary_constitution]?.description[locale]}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/screenings"
                className="text-xs text-brand-600 hover:text-brand-700 underline"
              >
                {locale === "zh" ? "历史记录" : "History"}
              </Link>
              <Link
                href="/screening"
                className="text-xs text-brand-600 hover:text-brand-700 underline"
              >
                {locale === "zh" ? "重新测评" : "Retake"}
              </Link>
            </div>
          </div>

          {/* Mini score bars */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {Object.entries(screening.constitution_scores)
              .filter(([key]) => key !== "balanced")
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 4)
              .map(([key, score]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-24 truncate text-xs text-muted-foreground">
                    {CONSTITUTION_INFO[key as ConstitutionType]?.name[locale] ?? key}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium">{score as number}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <Link
          href="/screening"
          className="block rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-8 text-center transition-colors hover:border-brand-400"
        >
          <h3 className="font-semibold text-brand-700">
            {locale === "zh" ? "完成体质测评" : "Take Your Wellness Screening"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "zh"
              ? "回答 27 个问题，了解您的体质类型"
              : "Answer 27 questions to discover your constitution type"}
          </p>
        </Link>
      )}

      {/* Quick action */}
      <Link
        href="/insights/new"
        className="block rounded-xl border bg-card p-5 transition-colors hover:border-brand-400"
      >
        <h3 className="font-semibold">
          {locale === "zh" ? "提交新问题" : "Ask Questions"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {locale === "zh"
            ? "获取个性化养生指导"
            : "Get personalized wellness guidance"}
        </p>
      </Link>

      {/* Insight history */}
      {insights.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            {locale === "zh" ? "历史记录" : "Recent Insights"}
          </h3>
          <div className="space-y-3">
            {insights.map((insight) => {
              const status = STATUS_LABELS[insight.status] ?? STATUS_LABELS.ai_complete;
              return (
                <Link
                  key={insight.id}
                  href={`/insights/${insight.id}`}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-brand-400"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {insight.user_questions[0]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <span className={`ml-4 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                    {status[locale]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {insights.length === 0 && screening && (
        <div className="rounded-lg border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "zh"
              ? "还没有养生建议记录。提交您的第一个问题吧！"
              : "No insights yet. Submit your first question to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}
