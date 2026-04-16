"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { CONSTITUTION_INFO } from "@qiorazen/tcm-engine";
import type { ConstitutionType } from "@qiorazen/types";

interface ScreeningRecord {
  id: string;
  primary_constitution: ConstitutionType;
  constitution_scores: Record<string, number>;
  completed_at: string;
}

export default function ScreeningHistoryPage() {
  const locale = useLocale() as "en" | "zh";
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/screening/history");
        if (res.ok) {
          const data = await res.json();
          setScreenings(data.screenings ?? []);
        }
      } catch {
        // continue
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

  const selectedScreening = selected
    ? screenings.find((s) => s.id === selected)
    : null;

  // All constitution keys except balanced
  const constitutionKeys = Object.keys(screenings[0]?.constitution_scores ?? {}).filter(
    (k) => k !== "balanced"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === "zh" ? "测评历史" : "Screening History"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh"
              ? `共 ${screenings.length} 次测评，追踪体质变化趋势`
              : `${screenings.length} screening${screenings.length !== 1 ? "s" : ""} — track your constitution changes over time`}
          </p>
        </div>
        <Link
          href="/screening"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {locale === "zh" ? "重新测评" : "New Screening"}
        </Link>
      </div>

      {screenings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-10 text-center">
          <p className="text-muted-foreground">
            {locale === "zh"
              ? "还没有测评记录。完成第一次测评来建立基线。"
              : "No screenings yet. Complete your first screening to establish a baseline."}
          </p>
          <Link
            href="/screening"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {locale === "zh" ? "开始测评" : "Start Screening"}
          </Link>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="space-y-3">
            {screenings.map((s, idx) => {
              const info = CONSTITUTION_INFO[s.primary_constitution];
              const isLatest = idx === 0;
              const prevScreening = idx < screenings.length - 1 ? screenings[idx + 1] : null;
              const isSelected = selected === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(isSelected ? null : s.id)}
                  className={`w-full rounded-xl border p-5 text-left transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50"
                      : "bg-card hover:border-brand-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${isLatest ? "bg-brand-500" : "bg-muted-foreground/30"}`} />
                      <div>
                        <span className="font-semibold text-brand-700">
                          {info?.name[locale] ?? s.primary_constitution}
                        </span>
                        {isLatest && (
                          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                            {locale === "zh" ? "最新" : "Latest"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.completed_at).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>

                  {/* Change indicator */}
                  {prevScreening && prevScreening.primary_constitution !== s.primary_constitution && (
                    <p className="mt-2 ml-6 text-xs text-muted-foreground">
                      {locale === "zh" ? "体质变化：" : "Changed from "}
                      <span className="font-medium">
                        {CONSTITUTION_INFO[prevScreening.primary_constitution]?.name[locale] ?? prevScreening.primary_constitution}
                      </span>
                      {locale === "zh" ? " → " : " → "}
                      <span className="font-medium text-brand-600">
                        {info?.name[locale] ?? s.primary_constitution}
                      </span>
                    </p>
                  )}

                  {/* Expanded detail */}
                  {isSelected && (
                    <div className="mt-4 ml-6 grid gap-2 sm:grid-cols-2">
                      {Object.entries(s.constitution_scores)
                        .filter(([key]) => key !== "balanced")
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([key, score]) => {
                          const prevScore = prevScreening?.constitution_scores?.[key] as number | undefined;
                          const diff = prevScore != null ? (score as number) - prevScore : null;

                          return (
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
                              <span className="w-8 text-right text-xs font-medium">
                                {score as number}
                              </span>
                              {diff !== null && diff !== 0 && (
                                <span className={`w-10 text-right text-xs font-medium ${
                                  diff > 0 ? "text-red-500" : "text-green-500"
                                }`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Comparison hint */}
          {screenings.length >= 2 && (
            <p className="text-center text-xs text-muted-foreground">
              {locale === "zh"
                ? "点击任一记录查看详细分数。红色/绿色数字表示与上次相比的变化。"
                : "Click any record to see detailed scores. Red/green numbers show changes from the previous screening."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
