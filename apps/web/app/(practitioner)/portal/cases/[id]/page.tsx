"use client";

import { useState } from "react";
import Link from "next/link";

export default function CaseDetailPage() {
  const [note, setNote] = useState("");
  const [approved, setApproved] = useState(false);

  function handleApprove() {
    setApproved(true);
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
          The insight has been sent to the user.
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Case Review</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Pending Review
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: User info */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">User Profile</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="font-medium">Primary Constitution:</span> Qi Deficiency</p>
              <p><span className="font-medium">Tier:</span> Starter Session ($49)</p>
              <p><span className="font-medium">Deadline:</span> 36h remaining</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">User Questions</h3>
            <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
              <li>I&apos;ve been feeling tired after moving to a cold climate — any lifestyle adjustments?</li>
              <li>What types of food might suit my constitution?</li>
            </ol>
          </div>
        </div>

        {/* Right: AI Draft + Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">AI-Generated Draft</h3>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Based on your wellness screening, your primary constitutional tendency is Qi Deficiency.
                Traditional wellness literature describes this pattern as one where energy may feel
                lower than average, and the body may benefit from warm, nourishing lifestyle adjustments.
              </p>
              <p className="mt-3">
                From a traditional wellness perspective, moving to a colder climate can be particularly
                noticeable for those with this constitutional tendency. You might consider warm, cooked
                foods as the foundation of meals, gentle exercise like walking or tai chi, and
                prioritizing rest.
              </p>
              <p className="mt-3 text-xs italic">
                This information is for educational purposes only and is not medical advice.
              </p>
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

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {note.trim() ? "Approve with Note" : "Approve As-Is"}
              </button>
            </div>

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
