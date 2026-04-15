"use client";

import type { StandardQuestion } from "@qiorazen/tcm-engine";
import { SCALE_LABELS } from "@qiorazen/tcm-engine";
import { useTranslations } from "next-intl";

interface QuestionStepProps {
  question: StandardQuestion;
  locale: "en" | "zh";
  selectedValue?: number;
  onSelect: (value: number) => void;
  onBack?: () => void;
}

export function QuestionStep({
  question,
  locale,
  selectedValue,
  onSelect,
  onBack,
}: QuestionStepProps) {
  const t = useTranslations("common");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {question.label[locale]}
      </h2>

      <div className="space-y-3">
        {([1, 2, 3, 4, 5] as const).map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`w-full rounded-lg border p-4 text-left transition-colors hover:border-brand-400 hover:bg-brand-50 ${
              selectedValue === value
                ? "border-brand-500 bg-brand-50"
                : "border-border"
            }`}
          >
            <span className="text-sm">
              {SCALE_LABELS[value][locale]}
            </span>
          </button>
        ))}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t("back")}
        </button>
      )}
    </div>
  );
}
