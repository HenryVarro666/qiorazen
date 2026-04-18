"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";

interface CaseItem {
  id: string;
  status: string;
  tier: string;
  user_questions: string[];
  ai_constitution_summary: string | null;
  response_deadline: string | null;
  created_at: string;
}

export default function CasesPage() {
  const locale = useLocale() as "en" | "zh";
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/practitioner/cases");
        if (res.ok) {
          const data = await res.json();
          setCases(data.cases ?? []);
        }
      } catch {
        // continue
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getUrgency(deadline: string | null): { label: string; color: string } {
    if (!deadline) return { label: "No deadline", color: "text-muted-foreground" };
    const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 4) return { label: `${Math.max(0, Math.round(hoursLeft))}h remaining`, color: "text-red-600" };
    if (hoursLeft < 12) return { label: `${Math.round(hoursLeft)}h remaining`, color: "text-amber-600" };
    return { label: `${Math.round(hoursLeft)}h remaining`, color: "text-brand-600" };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "加载中..." : "Loading cases..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {locale === "zh" ? "案例队列" : "Case Queue"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "zh"
            ? "按截止时间紧迫度 → 方案优先级 → 提交时间排序"
            : "Sorted by: deadline urgency → tier priority → submission time"}
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-10 text-center">
          <p className="text-muted-foreground">
            {locale === "zh" ? "暂无待审核案例" : "No cases pending review."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const urgency = getUrgency(c.response_deadline);
            return (
              <Link
                key={c.id}
                href={`/portal/cases/${c.id}`}
                className="flex items-center justify-between rounded-xl border bg-card p-5 transition-colors hover:border-brand-400"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {c.user_questions[0] ?? "No question"}
                    </span>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.tier === "premium"
                        ? "bg-purple-100 text-purple-700"
                        : c.tier === "core"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {c.tier}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`text-xs font-medium ${urgency.color}`}>
                    {urgency.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
