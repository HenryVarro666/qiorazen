"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

interface CaseDetail {
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
  response_deadline: string | null;
  created_at: string;
}

interface ComplianceIssue {
  text: string;
  reason: string;
  suggestion: string;
}

export default function CaseDetailPage() {
  const locale = useLocale() as "en" | "zh";
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI assist states
  const [translatedQuestions, setTranslatedQuestions] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [complianceResult, setComplianceResult] = useState<{ issues: ComplianceIssue[]; safe: boolean; summary: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [polishedNote, setPolishedNote] = useState<string | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [usePolished, setUsePolished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/practitioner/cases/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data.case ?? null);
        }
      } catch {
        // continue
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/practitioner/cases/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: (usePolished && polishedNote ? polishedNote : note).trim() || undefined }),
      });
      if (res.ok) {
        setApproved(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to approve");
      }
    } catch {
      setError("Network error");
    } finally {
      setApproving(false);
    }
  }

  async function aiAssist(action: "translate" | "compliance_check" | "polish", text: string) {
    const targetLanguage = locale === "zh" ? "en" : "zh";
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text, targetLanguage }),
      });
      const data = await res.json();
      return data.result;
    } catch {
      return null;
    }
  }

  async function handleTranslate() {
    if (!caseData) return;
    setTranslating(true);
    const result = await aiAssist("translate", caseData.user_questions.join("\n"));
    if (result) setTranslatedQuestions(result);
    setTranslating(false);
  }

  async function handleComplianceCheck() {
    if (!caseData?.ai_wellness_insight) return;
    setChecking(true);
    const result = await aiAssist("compliance_check", caseData.ai_wellness_insight);
    if (result) setComplianceResult(result);
    setChecking(false);
  }

  async function handlePolish() {
    if (!note.trim()) return;
    setPolishing(true);
    const result = await aiAssist("polish", note);
    if (result) { setPolishedNote(result); setUsePolished(false); }
    setPolishing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading case...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted-foreground">Case not found or already reviewed.</p>
        <Link href="/portal/cases" className="text-sm text-brand-600 underline">
          Back to Queue
        </Link>
      </div>
    );
  }

  if (approved) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="rounded-full bg-brand-100 p-4">
          <svg className="h-8 w-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Case Approved</h2>
        <p className="text-sm text-muted-foreground">
          The insight has been approved and will be delivered to the user.
        </p>
        <Link
          href="/portal/cases"
          className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to Queue
        </Link>
      </div>
    );
  }

  const deadlineDate = caseData.response_deadline ? new Date(caseData.response_deadline) : null;
  const hoursLeft = deadlineDate
    ? Math.max(0, Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60)))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Case Review</h1>
        <div className="flex items-center gap-3">
          {hoursLeft !== null && (
            <span className={`text-xs font-medium ${
              hoursLeft < 4 ? "text-red-600" : hoursLeft < 12 ? "text-amber-600" : "text-brand-600"
            }`}>
              {hoursLeft}h to deadline
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            caseData.tier === "premium" ? "bg-purple-100 text-purple-700" :
            caseData.tier === "core" ? "bg-brand-100 text-brand-700" :
            "bg-muted text-muted-foreground"
          }`}>
            {caseData.tier}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: User info */}
        <div className="space-y-4">
          {caseData.ai_constitution_summary && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                Constitution Summary
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {caseData.ai_constitution_summary}
              </p>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                {locale === "zh" ? "用户问题" : "User Questions"}
              </h3>
              <button
                onClick={handleTranslate}
                disabled={translating}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {translating
                  ? "..."
                  : (locale === "zh" ? "翻译为英文" : "翻译为中文")}
              </button>
            </div>
            <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
              {caseData.user_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
            {translatedQuestions && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-700 mb-1">
                  {locale === "zh" ? "翻译：" : "Translation:"}
                </p>
                <p className="text-sm whitespace-pre-wrap">{translatedQuestions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Draft + Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                {locale === "zh" ? "AI 生成草稿" : "AI-Generated Draft"}
              </h3>
              <button
                onClick={handleComplianceCheck}
                disabled={checking || !caseData.ai_wellness_insight}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {checking
                  ? "..."
                  : (locale === "zh" ? "合规审查" : "Compliance Check")}
              </button>
            </div>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {caseData.ai_wellness_insight ?? "No draft available."}
            </div>

            {complianceResult && (
              <div className={`mt-3 rounded-lg p-3 ${complianceResult.safe ? "bg-green-50" : "bg-red-50"}`}>
                <p className={`text-xs font-medium ${complianceResult.safe ? "text-green-700" : "text-red-700"}`}>
                  {complianceResult.safe
                    ? (locale === "zh" ? "通过合规审查" : "Compliance check passed")
                    : (locale === "zh" ? "发现合规问题" : "Compliance issues found")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{complianceResult.summary}</p>
                {complianceResult.issues.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {complianceResult.issues.map((issue, i) => (
                      <li key={i} className="rounded bg-white p-2 text-xs">
                        <span className="text-red-600 font-medium">&quot;{issue.text}&quot;</span>
                        <span className="text-muted-foreground"> — {issue.reason}</span>
                        <br />
                        <span className="text-green-700">{locale === "zh" ? "建议：" : "Suggest: "}{issue.suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Advisor actions */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase text-brand-700">
              {locale === "zh" ? "您的审核" : "Your Review"}
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">
                  {locale === "zh" ? "添加备注" : "Add a personal note"}{" "}
                  <span className="text-muted-foreground">
                    ({locale === "zh" ? "可选" : "optional"})
                  </span>
                </label>
                {note.trim() && (
                  <button
                    onClick={handlePolish}
                    disabled={polishing}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {polishing
                      ? "..."
                      : (locale === "zh" ? "AI 润色" : "AI Polish")}
                  </button>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => { setNote(e.target.value); setPolishedNote(null); setUsePolished(false); }}
                rows={3}
                maxLength={300}
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={locale === "zh"
                  ? "例：考虑到寒冷气候，睡前泡脚也可能有帮助。"
                  : "e.g., Given the cold climate, warm foot soaks before bed may also be helpful."}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{note.length}/300</p>

              {polishedNote && (
                <div className="mt-2 rounded-lg bg-brand-50 p-3 space-y-2">
                  <p className="text-xs font-medium text-brand-700">
                    {locale === "zh" ? "AI 润色版本：" : "AI-polished version:"}
                  </p>
                  <p className="text-sm">{polishedNote}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUsePolished(true)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        usePolished ? "bg-brand-600 text-white" : "border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {locale === "zh" ? "用 AI 版本" : "Use polished"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsePolished(false)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        !usePolished ? "bg-brand-600 text-white" : "border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {locale === "zh" ? "用我的原版" : "Use my original"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              onClick={handleApprove}
              disabled={approving}
              className="w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {approving
                ? (locale === "zh" ? "审核中..." : "Approving...")
                : (note.trim() || (usePolished && polishedNote))
                ? (locale === "zh" ? "审核通过并附备注" : "Approve with Note")
                : (locale === "zh" ? "直接审核通过" : "Approve As-Is")}
            </button>

            <p className="text-xs text-muted-foreground">
              Your note will pass through compliance guardrails before delivery.
              Do not use medical terminology, organ-level claims, or diagnostic language.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
