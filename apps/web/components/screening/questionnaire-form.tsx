"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  getQuestionsForGender,
  scoreConstitution,
  getPrimaryConstitution,
  getRecommendations,
  getConstitutionResults,
  SECTION_LABELS,
  type AnswerMap,
  type StandardQuestion,
} from "@qiorazen/tcm-engine";
import type { ConstitutionScores, ConstitutionType } from "@qiorazen/types";
import { QuestionStep } from "./question-step";
import { ResultCard } from "./result-card";

type Gender = "male" | "female";

export function QuestionnaireForm() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "zh";
  const [gender, setGender] = useState<Gender | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<{
    scores: ConstitutionScores;
    primary: ConstitutionType;
  } | null>(null);

  // Gender selection screen
  if (!gender) {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h2 className="text-xl font-semibold">
          {t("screening.genderSelect.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("screening.genderSelect.subtitle")}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setGender("male")}
            className="w-40 rounded-lg border-2 border-border p-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="text-lg">{t("screening.genderSelect.male")}</span>
          </button>
          <button
            onClick={() => setGender("female")}
            className="w-40 rounded-lg border-2 border-border p-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="text-lg">{t("screening.genderSelect.female")}</span>
          </button>
        </div>
      </div>
    );
  }

  const questions = getQuestionsForGender(gender);
  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  // Check if we're entering a new section
  const currentSection = currentQuestion?.section;
  const prevSection = currentStep > 0 ? questions[currentStep - 1].section : null;
  const isNewSection = currentSection !== prevSection;

  async function handleAnswer(value: number) {
    const newAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate results client-side (instant)
      const scores = scoreConstitution(newAnswers, gender!);
      const primary = getPrimaryConstitution(scores);
      setResult({ scores, primary });

      // Persist to API in background
      try {
        const res = await fetch("/api/screening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers, gender }),
        });
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem("qiorazen_screening_session", data.sessionId);
        }
      } catch {
        // API not available — results still shown from client-side calculation
      }

      // Always store scores locally as fallback
      localStorage.setItem("qiorazen_screening_scores", JSON.stringify(scores));
      localStorage.setItem("qiorazen_screening_primary", primary);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // First question → back to gender selection
      setGender(null);
    }
  }

  function handleRestart() {
    setGender(null);
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  }

  if (result) {
    const recommendations = getRecommendations(result.primary);
    const allResults = getConstitutionResults(result.scores);
    return (
      <ResultCard
        scores={result.scores}
        primaryConstitution={result.primary}
        constitutionResults={allResults}
        recommendations={recommendations}
        locale={locale}
        sessionId={sessionId}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("screening.progress", {
            current: currentStep + 1,
            total: totalSteps,
          })}
        </p>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Section header — always visible */}
      {currentSection && (
        <div className="rounded-lg bg-brand-50 px-4 py-3">
          <p className="text-sm font-medium text-brand-700">
            {SECTION_LABELS[currentSection][locale]}
          </p>
        </div>
      )}

      {/* Question */}
      <QuestionStep
        question={currentQuestion}
        locale={locale}
        selectedValue={answers[currentQuestion.key]}
        onSelect={handleAnswer}
        onBack={handleBack}
      />
    </div>
  );
}
