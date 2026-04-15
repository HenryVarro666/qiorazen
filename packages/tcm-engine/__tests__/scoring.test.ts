import { describe, it, expect } from "vitest";
import {
  scoreConstitution,
  getPrimaryConstitution,
  getConstitutionResults,
  determineBalanced,
  determineBiased,
  type AnswerMap,
} from "../src/scoring";
import { SCREENING_QUESTIONS, getQuestionsForGender } from "../src/questions";
import { TCM_CONSTITUTIONS, type ConstitutionScores } from "@qiorazen/types";

/** Create answers where all questions get the same score */
function allSameAnswer(score: number, gender: "male" | "female" = "male"): AnswerMap {
  const answers: AnswerMap = {};
  const questions = getQuestionsForGender(gender);
  for (const q of questions) {
    answers[q.key] = score;
  }
  return answers;
}

/** Create answers targeting a specific scale with high scores, others low */
function targetScale(
  targetScaleId: string,
  gender: "male" | "female" = "male"
): AnswerMap {
  const answers: AnswerMap = {};
  const questions = getQuestionsForGender(gender);
  for (const q of questions) {
    // For questions that score into the target scale (non-reverse), answer 5
    // For everything else, answer 1
    const isTarget = q.scales.some(
      (s) => s.scaleId === targetScaleId && !s.reverse
    );
    answers[q.key] = isTarget ? 5 : 1;
  }
  return answers;
}

describe("GB/T 46939-2025 Conversion Formula", () => {
  it("all-1 answers → non-reverse scales = 0, balanced = 75 (3 reverse items)", () => {
    const scores = scoreConstitution(allSameAnswer(1), "male");
    // Scales without reverse items: all-1 → score 0
    expect(scores.qi_deficiency).toBe(0);
    expect(scores.yin_deficiency).toBe(0);
    expect(scores.phlegm_dampness).toBe(0);
    expect(scores.blood_stasis).toBe(0);
    expect(scores.inherited_special).toBe(0);
    // Balanced has 4 items: Q1=1, Q2(rev 1→5)=5, Q3(rev 1→5)=5, Q4(rev 1→5)=5
    // Raw=16, N=4, Converted=[(16-4)/(4*4)]*100 = 75
    expect(scores.balanced).toBe(75);
  });

  it("all-5 answers → non-reverse scales = 100, balanced = 25 (3 reverse items)", () => {
    const scores = scoreConstitution(allSameAnswer(5), "male");
    expect(scores.qi_deficiency).toBe(100);
    expect(scores.yin_deficiency).toBe(100);
    expect(scores.phlegm_dampness).toBe(100);
    expect(scores.blood_stasis).toBe(100);
    expect(scores.inherited_special).toBe(100);
    // Balanced: Q1=5, Q2(rev 5→1)=1, Q3(rev 5→1)=1, Q4(rev 5→1)=1
    // Raw=8, N=4, Converted=[(8-4)/(4*4)]*100 = 25
    expect(scores.balanced).toBe(25);
  });

  it("all-3 answers → every score = 50", () => {
    const scores = scoreConstitution(allSameAnswer(3), "male");
    for (const c of TCM_CONSTITUTIONS) {
      expect(scores[c]).toBe(50);
    }
  });

  it("scores are in 0-100 range", () => {
    const scores = scoreConstitution(allSameAnswer(4), "male");
    for (const c of TCM_CONSTITUTIONS) {
      expect(scores[c]).toBeGreaterThanOrEqual(0);
      expect(scores[c]).toBeLessThanOrEqual(100);
    }
  });
});

describe("Reverse Scoring", () => {
  it("reverse-scored items flip the score for balanced", () => {
    // q2_tire_easily has balanced (reverse) + qi_deficiency (normal)
    // If we answer q2=5 (Always tire easily):
    //   balanced gets reverseScore(5) = 1
    //   qi_deficiency gets 5
    const answers: AnswerMap = {};
    const questions = getQuestionsForGender("male");
    for (const q of questions) {
      answers[q.key] = 3; // neutral baseline
    }
    // Set the shared question to 5
    answers["q2_tire_easily"] = 5;

    const scores = scoreConstitution(answers, "male");
    // qi_deficiency should be higher than if we'd answered 1
    const answersLow = { ...answers, q2_tire_easily: 1 };
    const scoresLow = scoreConstitution(answersLow, "male");

    expect(scores.qi_deficiency).toBeGreaterThan(scoresLow.qi_deficiency);
    // balanced should be lower with tire_easily = 5 (reverse scored)
    expect(scores.balanced).toBeLessThan(scoresLow.balanced);
  });
});

describe("Dual Scoring (Shared Questions)", () => {
  it("q2_tire_easily scores both balanced and qi_deficiency", () => {
    const q = SCREENING_QUESTIONS.find((q) => q.key === "q2_tire_easily");
    expect(q).toBeDefined();
    expect(q!.scales).toHaveLength(2);
    expect(q!.scales[0].scaleId).toBe("balanced");
    expect(q!.scales[0].reverse).toBe(true);
    expect(q!.scales[1].scaleId).toBe("qi_deficiency");
    expect(q!.scales[1].reverse).toBe(false);
  });

  it("q3_gloomy scores both balanced and qi_stagnation", () => {
    const q = SCREENING_QUESTIONS.find((q) => q.key === "q3_gloomy");
    expect(q).toBeDefined();
    expect(q!.scales).toHaveLength(2);
    expect(q!.scales.map((s) => s.scaleId)).toContain("balanced");
    expect(q!.scales.map((s) => s.scaleId)).toContain("qi_stagnation");
  });

  it("q4_cold_intolerant scores both balanced and yang_deficiency", () => {
    const q = SCREENING_QUESTIONS.find((q) => q.key === "q4_cold_intolerant");
    expect(q).toBeDefined();
    expect(q!.scales).toHaveLength(2);
    expect(q!.scales.map((s) => s.scaleId)).toContain("balanced");
    expect(q!.scales.map((s) => s.scaleId)).toContain("yang_deficiency");
  });
});

describe("Gender Routing", () => {
  it("male gets 26 questions (q20 instead of q19)", () => {
    const questions = getQuestionsForGender("male");
    expect(questions.some((q) => q.key === "q20_scrotal_damp")).toBe(true);
    expect(questions.some((q) => q.key === "q19_yellow_discharge")).toBe(false);
    // 27 unique - 1 excluded gender question = 26
    expect(questions.length).toBe(26);
  });

  it("female gets 26 questions (q19 instead of q20)", () => {
    const questions = getQuestionsForGender("female");
    expect(questions.some((q) => q.key === "q19_yellow_discharge")).toBe(true);
    expect(questions.some((q) => q.key === "q20_scrotal_damp")).toBe(false);
    expect(questions.length).toBe(26);
  });

  it("damp_heat has 3 items regardless of gender", () => {
    const maleScores = scoreConstitution(allSameAnswer(3, "male"), "male");
    const femaleScores = scoreConstitution(allSameAnswer(3, "female"), "female");
    // Both should compute damp_heat from exactly 3 items → same score
    expect(maleScores.damp_heat).toBe(femaleScores.damp_heat);
  });
});

describe("Balanced Determination (GB/T Table 1)", () => {
  it("balanced ≥ 60, all others < 30 → yes", () => {
    const scores: ConstitutionScores = {
      balanced: 75,
      qi_deficiency: 10, yang_deficiency: 20, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 25, inherited_special: 0,
    };
    expect(determineBalanced(scores)).toBe("yes");
  });

  it("balanced ≥ 60, all others < 40 (but some ≥ 30) → basically_yes", () => {
    const scores: ConstitutionScores = {
      balanced: 65,
      qi_deficiency: 35, yang_deficiency: 20, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 10, inherited_special: 0,
    };
    expect(determineBalanced(scores)).toBe("basically_yes");
  });

  it("balanced ≥ 60 but some other ≥ 40 → no", () => {
    const scores: ConstitutionScores = {
      balanced: 65,
      qi_deficiency: 45, yang_deficiency: 20, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 10, inherited_special: 0,
    };
    expect(determineBalanced(scores)).toBe("no");
  });

  it("balanced < 60 → no regardless of others", () => {
    const scores: ConstitutionScores = {
      balanced: 50,
      qi_deficiency: 10, yang_deficiency: 10, yin_deficiency: 10,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 10, inherited_special: 0,
    };
    expect(determineBalanced(scores)).toBe("no");
  });
});

describe("Biased Determination (GB/T Table 1)", () => {
  it("score ≥ 40 → yes", () => {
    expect(determineBiased(40)).toBe("yes");
    expect(determineBiased(75)).toBe("yes");
    expect(determineBiased(100)).toBe("yes");
  });

  it("score 30-39 → tendency", () => {
    expect(determineBiased(30)).toBe("tendency");
    expect(determineBiased(35)).toBe("tendency");
    expect(determineBiased(39)).toBe("tendency");
  });

  it("score < 30 → no", () => {
    expect(determineBiased(0)).toBe("no");
    expect(determineBiased(15)).toBe("no");
    expect(determineBiased(29)).toBe("no");
  });
});

describe("getPrimaryConstitution", () => {
  it("returns balanced when determination is yes", () => {
    const scores: ConstitutionScores = {
      balanced: 75,
      qi_deficiency: 10, yang_deficiency: 20, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 25, inherited_special: 0,
    };
    expect(getPrimaryConstitution(scores)).toBe("balanced");
  });

  it("returns highest biased when balanced is no", () => {
    const scores: ConstitutionScores = {
      balanced: 30,
      qi_deficiency: 80, yang_deficiency: 40, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 10, inherited_special: 0,
    };
    expect(getPrimaryConstitution(scores)).toBe("qi_deficiency");
  });
});

describe("getConstitutionResults", () => {
  it("returns all 9 constitutions sorted by score", () => {
    const scores: ConstitutionScores = {
      balanced: 50,
      qi_deficiency: 80, yang_deficiency: 40, yin_deficiency: 15,
      phlegm_dampness: 5, damp_heat: 10, blood_stasis: 0,
      qi_stagnation: 60, inherited_special: 20,
    };
    const results = getConstitutionResults(scores);
    expect(results).toHaveLength(9);
    expect(results[0].constitution).toBe("qi_deficiency");
    expect(results[0].score).toBe(80);
    expect(results[0].determination).toBe("yes");
  });
});

describe("Scale Item Counts (per GB/T standard)", () => {
  it("balanced has 4 items", () => {
    const items = SCREENING_QUESTIONS.filter((q) =>
      q.scales.some((s) => s.scaleId === "balanced")
    );
    expect(items).toHaveLength(4);
  });

  it("qi_deficiency has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.gender !== "female" && q.scales.some((s) => s.scaleId === "qi_deficiency")
    );
    expect(items).toHaveLength(3);
  });

  it("yang_deficiency has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "yang_deficiency")
    );
    expect(items).toHaveLength(3);
  });

  it("yin_deficiency has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "yin_deficiency")
    );
    expect(items).toHaveLength(3);
  });

  it("phlegm_dampness has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "phlegm_dampness")
    );
    expect(items).toHaveLength(3);
  });

  it("damp_heat has 4 total items (3 per gender)", () => {
    const all = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "damp_heat")
    );
    expect(all).toHaveLength(4); // q17, q18, q19(F), q20(M)
    const male = all.filter((q) => q.gender !== "female");
    expect(male).toHaveLength(3);
  });

  it("blood_stasis has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "blood_stasis")
    );
    expect(items).toHaveLength(3);
  });

  it("qi_stagnation has 3 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "qi_stagnation")
    );
    expect(items).toHaveLength(3);
  });

  it("inherited_special has 4 items", () => {
    const items = SCREENING_QUESTIONS.filter(
      (q) => q.scales.some((s) => s.scaleId === "inherited_special")
    );
    expect(items).toHaveLength(4);
  });

  it("total unique questions = 27", () => {
    expect(SCREENING_QUESTIONS).toHaveLength(27);
  });
});

describe("Empty / Missing Answers", () => {
  it("empty answers → all scores = 0", () => {
    const scores = scoreConstitution({}, "male");
    for (const c of TCM_CONSTITUTIONS) {
      expect(scores[c]).toBe(0);
    }
  });

  it("partial answers → only answered scales have scores", () => {
    const answers: AnswerMap = {
      q1_energetic: 5,
      q2_tire_easily: 1,
      q3_gloomy: 1,
      q4_cold_intolerant: 1,
    };
    const scores = scoreConstitution(answers, "male");
    // balanced has all 4 items answered → should have a score
    expect(scores.balanced).toBeGreaterThan(0);
    // qi_deficiency has 1 of 3 items → partial score
    expect(scores.qi_deficiency).toBe(0); // q2=1 → score 0
  });
});
