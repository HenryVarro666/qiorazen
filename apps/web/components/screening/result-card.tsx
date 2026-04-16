"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { ConstitutionScores, ConstitutionType } from "@qiorazen/types";
import { CONSTITUTION_INFO, getPaidRecommendations, type Recommendations, type ConstitutionResult, type PaidRecommendations } from "@qiorazen/tcm-engine";
import { DisclaimerBanner, DisclaimerFooter } from "@/components/shared/disclaimer-banner";
import { ConstitutionChart } from "./constitution-chart";

interface ResultCardProps {
  scores: ConstitutionScores;
  primaryConstitution: ConstitutionType;
  constitutionResults: ConstitutionResult[];
  recommendations: Recommendations;
  locale: "en" | "zh";
  sessionId: string | null;
  onRestart: () => void;
}

export function ResultCard({
  scores,
  primaryConstitution,
  constitutionResults,
  recommendations,
  locale,
  sessionId,
  onRestart,
}: ResultCardProps) {
  const t = useTranslations();
  const info = CONSTITUTION_INFO[primaryConstitution];

  // Dev mode: ?unlock=1 to preview paid content
  const [isUnlocked, setIsUnlocked] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsUnlocked(params.get("unlock") === "1");
  }, []);

  // Secondary constitutions: top 3 biased types with score ≥ 30 (excluding primary)
  const secondaryResults = constitutionResults
    .filter(
      (r) =>
        r.constitution !== "balanced" &&
        r.constitution !== primaryConstitution &&
        r.score >= 30
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <DisclaimerBanner />

      {/* Primary Constitution */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("screening.result.primaryConstitution")}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-brand-700">
          {info.name[locale]}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {info.description[locale]}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">
          {t("screening.result.constitutionChart")}
        </h3>
        <ConstitutionChart scores={scores} locale={locale} />
      </div>

      {/* Traits */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-3 font-semibold">
          {t("screening.result.yourTraits")}
        </h3>
        <ul className="space-y-2">
          {info.characteristics[locale].map((char, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
              {char}
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Profile — manifestations paragraph */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-3 font-semibold">
          {t("screening.result.detailedProfile")}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {info.manifestations[locale]}
        </p>
      </div>

      {/* Body, Personality, Seasonal — 3-column grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("screening.result.bodyType")}
          </h4>
          <p className="mt-2 text-sm">{info.physique[locale]}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("screening.result.personalityTendency")}
          </h4>
          <p className="mt-2 text-sm">{info.psychology[locale]}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("screening.result.seasonalSensitivity")}
          </h4>
          <p className="mt-2 text-sm">{info.adaptability[locale]}</p>
        </div>
      </div>

      {/* Secondary Constitutions */}
      {secondaryResults.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-3 font-semibold">
            {t("screening.result.secondaryConstitutions")}
          </h3>
          <div className="space-y-3">
            {secondaryResults.map((r) => {
              const secInfo = CONSTITUTION_INFO[r.constitution];
              return (
                <div key={r.constitution} className="rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium">{secInfo.name[locale]}</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {secInfo.description[locale]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ PAID CONTENT (locked or unlocked) ═══════ */}
      {isUnlocked ? (
        <PaidContent
          primaryConstitution={primaryConstitution}
          locale={locale}
        />
      ) : (
        <>
          <div className="space-y-3">
            <LockedCard
              title={t("screening.result.locked.dietary")}
              locale={locale}
            />
            <LockedCard
              title={t("screening.result.locked.seasonal")}
              locale={locale}
            />
            <LockedCard
              title={t("screening.result.locked.activity")}
              locale={locale}
            />
          </div>

          {/* CTA */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
            <h3 className="text-lg font-semibold text-brand-800">
              {t("screening.result.deeperCta")}
            </h3>
            <p className="mt-2 text-sm text-brand-600">
              {t("screening.result.deeperCtaSub")}
            </p>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/insights/new${sessionId ? `?session=${sessionId}` : ""}`)}`}
              className="mt-4 inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              {locale === "zh" ? "立即解锁 — $49" : "Unlock Now — $49"}
            </Link>
          </div>
        </>
      )}

      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {locale === "zh" ? "重新测评" : "Take Again"}
        </button>
      </div>

      <DisclaimerFooter />
    </div>
  );
}

function PaidContent({
  primaryConstitution,
  locale,
}: {
  primaryConstitution: ConstitutionType;
  locale: "en" | "zh";
}) {
  const paid = getPaidRecommendations(primaryConstitution);

  return (
    <>
      {/* Dietary Guidance — with explanations */}
      <div className="rounded-xl border-2 border-brand-100 bg-brand-50/30 p-6">
        <h3 className="mb-1 text-lg font-semibold">
          {locale === "zh" ? "个性化饮食指导" : "Personalized Dietary Guidance"}
        </h3>
        <p className="mb-5 text-xs text-muted-foreground">
          {locale === "zh" ? "根据您的体质特点定制" : "Tailored to your constitution"}
        </p>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-brand-700">
            {locale === "zh" ? "推荐食物" : "Recommended"}
          </h4>
          {paid.dietary[locale].map((item, i) => (
            <div key={i} className="rounded-lg bg-card p-4">
              <p className="text-sm font-medium">{item.text}</p>
              <p className="mt-1.5 text-xs italic text-muted-foreground">{item.why}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-red-600/80">
            {locale === "zh" ? "建议减少" : "Minimize"}
          </h4>
          {paid.avoid[locale].map((item, i) => (
            <div key={i} className="rounded-lg bg-card p-4">
              <p className="text-sm font-medium">{item.text}</p>
              <p className="mt-1.5 text-xs italic text-muted-foreground">{item.why}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-brand-700">
            {locale === "zh" ? "推荐饮品" : "Recommended Drinks"}
          </h4>
          <div className="flex flex-wrap gap-2">
            {paid.drinks[locale].map((drink, i) => (
              <span key={i} className="rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700">
                {drink}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Lifestyle */}
      <div className="rounded-xl border-2 border-brand-100 bg-brand-50/30 p-6">
        <h3 className="mb-5 text-lg font-semibold">
          {locale === "zh" ? "运动与生活方式" : "Activity & Lifestyle Plan"}
        </h3>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-brand-700">
            {locale === "zh" ? "运动建议" : "Exercise Guidance"}
          </h4>
          {paid.activity[locale].map((item, i) => (
            <div key={i} className="rounded-lg bg-card p-4">
              <p className="text-sm font-medium">{item.text}</p>
              <p className="mt-1.5 text-xs italic text-muted-foreground">{item.why}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-brand-700">
            {locale === "zh" ? "日常习惯" : "Daily Routine"}
          </h4>
          <ul className="space-y-2">
            {paid.dailyRoutine[locale].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seasonal Calendar */}
      <div className="rounded-xl border-2 border-brand-100 bg-brand-50/30 p-6">
        <h3 className="mb-5 text-lg font-semibold">
          {locale === "zh" ? "四季养生日历" : "Seasonal Wellness Calendar"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {paid.seasonal[locale].map((s, i) => (
            <div key={i} className="rounded-lg bg-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {s.season}
              </span>
              <p className="mt-2 text-sm text-muted-foreground">{s.guidance}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function RecommendationSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LockedCard({ title, locale }: { title: string; locale: "en" | "zh" }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6">
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {locale === "zh" ? "付费解锁" : "Unlock with plan"}
        </div>
      </div>
      <h4 className="font-semibold">{title}</h4>
      <div className="mt-2 space-y-2">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}
