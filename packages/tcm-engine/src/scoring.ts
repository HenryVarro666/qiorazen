import type { ConstitutionType, ConstitutionScores } from "@qiorazen/types";
import { TCM_CONSTITUTIONS } from "@qiorazen/types";
import { SCREENING_QUESTIONS, type StandardQuestion } from "./questions";

/**
 * GB/T 46939-2025 Scoring System
 *
 * Formula: Converted Score = [(Raw Score - Item Count) / (Item Count × 4)] × 100
 * This normalizes to 0-100 where all-1s = 0, all-5s = 100.
 *
 * Reverse scoring (for Balanced Q2, Q3, Q4): 1→5, 2→4, 3→3, 4→2, 5→1
 * Dual-scoring: 3 questions are scored into 2 scales each.
 */

/** Map of question key → user's answer (1-5) */
export type AnswerMap = Record<string, number>;

/** Reverse a score: 1→5, 2→4, 3→3, 4→2, 5→1 */
function reverseScore(score: number): number {
  return 6 - score;
}

/**
 * Calculate constitution scores from user answers using the GB/T formula.
 *
 * Each question belongs to one or more constitution scales.
 * For each scale, we sum the item scores and apply the conversion formula.
 */
export function scoreConstitution(
  answers: AnswerMap,
  gender: "male" | "female"
): ConstitutionScores {
  // Collect item scores per scale
  const scaleItems = Object.fromEntries(
    TCM_CONSTITUTIONS.map((c) => [c, [] as number[]])
  ) as unknown as Record<ConstitutionType, number[]>;

  // Filter questions by gender
  const questions = SCREENING_QUESTIONS.filter(
    (q) => q.gender === null || q.gender === gender
  );

  for (const question of questions) {
    const rawAnswer = answers[question.key];
    if (rawAnswer == null || rawAnswer < 1 || rawAnswer > 5) continue;

    for (const scale of question.scales) {
      const itemScore = scale.reverse
        ? reverseScore(rawAnswer)
        : rawAnswer;
      scaleItems[scale.scaleId].push(itemScore);
    }
  }

  // Apply GB/T conversion formula to each scale
  const scores = Object.fromEntries(
    TCM_CONSTITUTIONS.map((c) => {
      const items = scaleItems[c];
      if (items.length === 0) return [c, 0];
      return [c, convertScore(items)];
    })
  ) as ConstitutionScores;

  return scores;
}

/**
 * GB/T 46939-2025 conversion formula:
 * Converted Score = [(Raw Score - Item Count) / (Item Count × 4)] × 100
 *
 * Where Raw Score = sum of all item scores for this scale.
 * Minimum: all items = 1 → (N - N) / (N × 4) × 100 = 0
 * Maximum: all items = 5 → (5N - N) / (N × 4) × 100 = 100
 */
function convertScore(items: number[]): number {
  const n = items.length;
  const rawScore = items.reduce((sum, s) => sum + s, 0);
  const converted = ((rawScore - n) / (n * 4)) * 100;
  return Math.round(converted);
}

/**
 * Determination result for a constitution type per GB/T standard.
 */
export type DeterminationResult = "yes" | "basically_yes" | "tendency" | "no";

/**
 * Determine if a person has the Balanced constitution.
 *
 * Per GB/T 46939-2025 Table 1:
 * - Yes: Balanced ≥ 60 AND all other 8 types < 30
 * - Basically Yes: Balanced ≥ 60 AND all other 8 types < 40
 * - No: otherwise
 */
export function determineBalanced(scores: ConstitutionScores): DeterminationResult {
  if (scores.balanced < 60) return "no";

  const otherScores = TCM_CONSTITUTIONS
    .filter((c) => c !== "balanced")
    .map((c) => scores[c]);
  const maxOther = Math.max(...otherScores);

  if (maxOther < 30) return "yes";
  if (maxOther < 40) return "basically_yes";
  return "no";
}

/**
 * Determine if a person has a biased (non-balanced) constitution.
 *
 * Per GB/T 46939-2025 Table 1:
 * - Yes: score ≥ 40
 * - Tendency: score 30-39
 * - No: score < 30
 */
export function determineBiased(score: number): DeterminationResult {
  if (score >= 40) return "yes";
  if (score >= 30) return "tendency";
  return "no";
}

export interface ConstitutionResult {
  constitution: ConstitutionType;
  score: number;
  determination: DeterminationResult;
}

/**
 * Get the primary constitution(s) — the highest-scoring biased constitutions
 * that have a determination of "yes" or "tendency".
 *
 * Returns results sorted by score descending.
 */
export function getConstitutionResults(
  scores: ConstitutionScores
): ConstitutionResult[] {
  const results: ConstitutionResult[] = [];

  // Balanced
  results.push({
    constitution: "balanced",
    score: scores.balanced,
    determination: determineBalanced(scores),
  });

  // Biased constitutions
  for (const c of TCM_CONSTITUTIONS) {
    if (c === "balanced") continue;
    results.push({
      constitution: c,
      score: scores[c],
      determination: determineBiased(scores[c]),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get the primary constitution type.
 * If balanced is "yes", return balanced.
 * Otherwise return the highest-scoring biased constitution.
 */
export function getPrimaryConstitution(scores: ConstitutionScores): ConstitutionType {
  const balancedResult = determineBalanced(scores);
  if (balancedResult === "yes" || balancedResult === "basically_yes") {
    return "balanced";
  }

  let maxScore = -1;
  let maxConstitution: ConstitutionType = "balanced";
  for (const c of TCM_CONSTITUTIONS) {
    if (c === "balanced") continue;
    if (scores[c] > maxScore) {
      maxScore = scores[c];
      maxConstitution = c;
    }
  }
  return maxConstitution;
}
