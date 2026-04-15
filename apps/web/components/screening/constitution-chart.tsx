"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { ConstitutionScores } from "@qiorazen/types";
import { TCM_CONSTITUTIONS } from "@qiorazen/types";
import { CONSTITUTION_INFO } from "@qiorazen/tcm-engine";

interface ConstitutionChartProps {
  scores: ConstitutionScores;
  locale: "en" | "zh";
}

export function ConstitutionChart({ scores, locale }: ConstitutionChartProps) {
  const data = TCM_CONSTITUTIONS.filter((c) => c !== "balanced").map((c) => ({
    constitution: CONSTITUTION_INFO[c].name[locale],
    score: scores[c],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="constitution"
          tick={{ fontSize: 11, fill: "#6b7280" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#16a34a"
          fill="#22c55e"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
