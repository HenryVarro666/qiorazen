export const TCM_CONSTITUTIONS = [
  "balanced",
  "qi_deficiency",
  "yang_deficiency",
  "yin_deficiency",
  "phlegm_dampness",
  "damp_heat",
  "blood_stasis",
  "qi_stagnation",
  "inherited_special",
] as const;

export type ConstitutionType = (typeof TCM_CONSTITUTIONS)[number];

export type ConstitutionScores = Record<ConstitutionType, number>;

export interface ScreeningAnswer {
  questionKey: string;
  value: string;
  score: number;
}

export type ScreeningStatus = "in_progress" | "completed" | "expired";

export interface ScreeningSession {
  id: string;
  user_id: string | null;
  session_token: string;
  status: ScreeningStatus;
  answers: Record<string, ScreeningAnswer>;
  constitution_scores: ConstitutionScores | null;
  primary_constitution: ConstitutionType | null;
  created_at: string;
  completed_at: string | null;
}

export interface QuestionOption {
  value: string;
  label: { en: string; zh: string };
}

export interface ScreeningQuestion {
  key: string;
  label: { en: string; zh: string };
  description?: { en: string; zh: string };
  options: QuestionOption[];
}
