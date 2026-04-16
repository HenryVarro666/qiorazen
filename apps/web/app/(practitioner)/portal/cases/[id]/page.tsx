"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/practitioner/cases");
        if (res.ok) {
          const data = await res.json();
          const found = (data.cases ?? []).find((c: CaseDetail) => c.id === id);
          setCaseData(found ?? null);
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
        body: JSON.stringify({ notes: note.trim() || undefined }),
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
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              User Questions
            </h3>
            <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
              {caseData.user_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: AI Draft + Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              AI-Generated Draft
            </h3>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {caseData.ai_wellness_insight ?? "No draft available."}
            </div>
          </div>

          {/* Advisor actions */}
          <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase text-brand-700">Your Review</h3>

            <div>
              <label className="block text-sm font-medium">
                Add a personal note <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={300}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Given the cold climate, warm foot soaks before bed may also be helpful."
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{note.length}/300</p>
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
                ? "Approving..."
                : note.trim()
                ? "Approve with Note"
                : "Approve As-Is"}
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
