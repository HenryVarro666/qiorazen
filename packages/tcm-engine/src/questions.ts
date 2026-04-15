import type { ConstitutionType } from "@qiorazen/types";

/**
 * GB/T 46939-2025 Standard Questionnaire
 *
 * 27 unique questions (30 scored items due to 3 shared questions).
 * Each question uses a 5-level Likert scale:
 *   1 = Not at all  2 = Rarely  3 = Sometimes  4 = Often  5 = Always
 *
 * Organized into 6 thematic sections for natural user flow.
 */

export interface StandardQuestion {
  /** Unique question key */
  key: string;
  /** Which constitution scale(s) this item scores into */
  scales: {
    scaleId: ConstitutionType;
    /** If true, reverse score: 1→5, 2→4, 3→3, 4→2, 5→1 */
    reverse: boolean;
  }[];
  /** Question text */
  label: { en: string; zh: string };
  /** Thematic section for UI grouping */
  section: QuestionSection;
  /** Gender filter: only show to this gender. null = show to all */
  gender: "male" | "female" | null;
}

export type QuestionSection =
  | "energy"
  | "temperature"
  | "skin"
  | "digestion"
  | "emotion"
  | "other";

export const SECTION_LABELS: Record<QuestionSection, { en: string; zh: string }> = {
  energy: { en: "Energy & Vitality", zh: "精力与活力" },
  temperature: { en: "Temperature Sensitivity", zh: "寒热感受" },
  skin: { en: "Skin & Complexion", zh: "皮肤与面色" },
  digestion: { en: "Digestion & Body", zh: "消化与身体" },
  emotion: { en: "Emotions & Mind", zh: "情绪与心理" },
  other: { en: "Pain, Allergies & Other", zh: "疼痛、过敏与其他" },
};

export const SCALE_LABELS = {
  1: { en: "Not at all", zh: "没有（根本不）" },
  2: { en: "Rarely", zh: "很少（有一点）" },
  3: { en: "Sometimes", zh: "有时（有些）" },
  4: { en: "Often", zh: "经常（相当）" },
  5: { en: "Always", zh: "总是（非常）" },
} as const;

export const SCREENING_QUESTIONS: StandardQuestion[] = [
  // ═══════════════════════════════════════════════
  // Section 1: Energy & Vitality (4 questions)
  // ═══════════════════════════════════════════════
  {
    key: "q1_energetic",
    scales: [{ scaleId: "balanced", reverse: false }],
    label: {
      en: "Do you feel energetic and vigorous?",
      zh: "您精力充沛吗？",
    },
    section: "energy",
    gender: null,
  },
  {
    // Shared item: Balanced (reverse) + Qi Deficiency (normal)
    key: "q2_tire_easily",
    scales: [
      { scaleId: "balanced", reverse: true },
      { scaleId: "qi_deficiency", reverse: false },
    ],
    label: {
      en: "Do you tire easily?",
      zh: "您容易疲乏吗？",
    },
    section: "energy",
    gender: null,
  },
  {
    key: "q6_short_breath",
    scales: [{ scaleId: "qi_deficiency", reverse: false }],
    label: {
      en: "Do you easily feel short of breath (rapid shallow breathing, unable to catch your breath)?",
      zh: "您容易气短（呼吸短促，接不上气）吗？",
    },
    section: "energy",
    gender: null,
  },
  {
    key: "q7_palpitations",
    scales: [{ scaleId: "qi_deficiency", reverse: false }],
    label: {
      en: "Do you easily experience palpitations (heart racing)?",
      zh: "您容易心慌吗？",
    },
    section: "energy",
    gender: null,
  },

  // ═══════════════════════════════════════════════
  // Section 2: Temperature Sensitivity (4 questions)
  // ═══════════════════════════════════════════════
  {
    // Shared item: Balanced (reverse) + Yang Deficiency (normal)
    key: "q4_cold_intolerant",
    scales: [
      { scaleId: "balanced", reverse: true },
      { scaleId: "yang_deficiency", reverse: false },
    ],
    label: {
      en: "Are you less tolerant of cold than most people (winter cold, summer air conditioning, fans, etc.)?",
      zh: "您比一般人耐受不了寒冷（冬天的寒冷，夏天的冷空调、电扇等）吗？",
    },
    section: "temperature",
    gender: null,
  },
  {
    key: "q8_stomach_back_cold",
    scales: [{ scaleId: "yang_deficiency", reverse: false }],
    label: {
      en: "Do you feel cold in your stomach area, back, or lower back and knees?",
      zh: "您胃脘部、背部或腰膝部怕冷吗？",
    },
    section: "temperature",
    gender: null,
  },
  {
    key: "q9_wear_more",
    scales: [{ scaleId: "yang_deficiency", reverse: false }],
    label: {
      en: "Do you feel cold-averse and wear more layers than others?",
      zh: "您感到怕冷、衣服比别人穿得多吗？",
    },
    section: "temperature",
    gender: null,
  },
  {
    key: "q11_body_heat",
    scales: [{ scaleId: "yin_deficiency", reverse: false }],
    label: {
      en: "Do you feel heat in your body or flushing in your face?",
      zh: "您感觉身体、脸上发热吗？",
    },
    section: "temperature",
    gender: null,
  },

  // ═══════════════════════════════════════════════
  // Section 3: Skin & Complexion (6 questions)
  // ═══════════════════════════════════════════════
  {
    key: "q12_dry_skin_lips",
    scales: [{ scaleId: "yin_deficiency", reverse: false }],
    label: {
      en: "Is your skin or lips dry?",
      zh: "您皮肤或口唇干吗？",
    },
    section: "skin",
    gender: null,
  },
  {
    key: "q13_cheekbone_flush",
    scales: [{ scaleId: "yin_deficiency", reverse: false }],
    label: {
      en: "Are your cheekbones flushed or reddish?",
      zh: "您面部两颧潮红或偏红吗？",
    },
    section: "skin",
    gender: null,
  },
  {
    key: "q17_oily_face",
    scales: [{ scaleId: "damp_heat", reverse: false }],
    label: {
      en: "Does your face or nose feel greasy or look oily and shiny?",
      zh: "您面部或鼻部有油腻感或者油亮发光吗？",
    },
    section: "skin",
    gender: null,
  },
  {
    key: "q22_dull_complexion",
    scales: [{ scaleId: "blood_stasis", reverse: false }],
    label: {
      en: "Is your complexion dull or do you easily develop dark spots?",
      zh: "您面色晦暗或容易出现褐斑吗？",
    },
    section: "skin",
    gender: null,
  },
  {
    key: "q23_dark_lips",
    scales: [{ scaleId: "blood_stasis", reverse: false }],
    label: {
      en: "Are your lips dark-colored?",
      zh: "您口唇颜色偏暗吗？",
    },
    section: "skin",
    gender: null,
  },
  {
    key: "q30_scratch_red",
    scales: [{ scaleId: "inherited_special", reverse: false }],
    label: {
      en: "Does your skin turn red and show scratch marks when scratched?",
      zh: "您的皮肤一抓就红，并出现抓痕吗？",
    },
    section: "skin",
    gender: null,
  },

  // ═══════════════════════════════════════════════
  // Section 4: Digestion & Body (4 questions)
  // ═══════════════════════════════════════════════
  {
    key: "q14_body_heavy",
    scales: [{ scaleId: "phlegm_dampness", reverse: false }],
    label: {
      en: "Do you feel heavy, sluggish, or uncomfortable in your body?",
      zh: "您感到身体沉重不轻松或不爽快吗？",
    },
    section: "digestion",
    gender: null,
  },
  {
    key: "q15_abdomen_soft",
    scales: [{ scaleId: "phlegm_dampness", reverse: false }],
    label: {
      en: "Is your abdomen full and soft?",
      zh: "您腹部肥满松软吗？",
    },
    section: "digestion",
    gender: null,
  },
  {
    key: "q16_sticky_mouth",
    scales: [{ scaleId: "phlegm_dampness", reverse: false }],
    label: {
      en: "Do you have a sticky sensation in your mouth?",
      zh: "您嘴里有黏黏的感觉吗？",
    },
    section: "digestion",
    gender: null,
  },
  {
    key: "q18_urine_burn",
    scales: [{ scaleId: "damp_heat", reverse: false }],
    label: {
      en: "Do you feel a burning sensation when urinating, or is your urine dark-colored?",
      zh: "您小便时尿道有发热感、尿色浓（深）吗？",
    },
    section: "digestion",
    gender: null,
  },

  // ═══════════════════════════════════════════════
  // Section 5: Emotions & Mind (3 questions)
  // ═══════════════════════════════════════════════
  {
    // Shared item: Balanced (reverse) + Qi Stagnation (normal)
    key: "q3_gloomy",
    scales: [
      { scaleId: "balanced", reverse: true },
      { scaleId: "qi_stagnation", reverse: false },
    ],
    label: {
      en: "Do you feel gloomy or emotionally low?",
      zh: "您感到闷闷不乐、情绪低沉吗？",
    },
    section: "emotion",
    gender: null,
  },
  {
    key: "q25_anxious",
    scales: [{ scaleId: "qi_stagnation", reverse: false }],
    label: {
      en: "Do you easily feel nervous, tense, or anxious?",
      zh: "您容易精神紧张、焦虑不安吗？",
    },
    section: "emotion",
    gender: null,
  },
  {
    key: "q26_sentimental",
    scales: [{ scaleId: "qi_stagnation", reverse: false }],
    label: {
      en: "Are you sentimental and emotionally fragile?",
      zh: "您多愁善感、感情脆弱吗？",
    },
    section: "emotion",
    gender: null,
  },

  // ═══════════════════════════════════════════════
  // Section 6: Pain, Allergies & Other (5 questions, 1 gender-specific)
  // ═══════════════════════════════════════════════
  {
    key: "q21_body_pain",
    scales: [{ scaleId: "blood_stasis", reverse: false }],
    label: {
      en: "Do you experience pain anywhere in your body?",
      zh: "您身体上有哪里疼痛吗？",
    },
    section: "other",
    gender: null,
  },
  {
    key: "q27_sneeze",
    scales: [{ scaleId: "inherited_special", reverse: false }],
    label: {
      en: "Do you sneeze even when you don't have a cold?",
      zh: "您没有感冒时也会打喷嚏吗？",
    },
    section: "other",
    gender: null,
  },
  {
    key: "q28_allergies",
    scales: [{ scaleId: "inherited_special", reverse: false }],
    label: {
      en: "Are you prone to allergies (to medications, foods, odors, pollen, or during seasonal or weather changes)?",
      zh: "您容易过敏（对药物、食物、气味、花粉或在季节交替、气候变化时）吗？",
    },
    section: "other",
    gender: null,
  },
  {
    key: "q29_hives",
    scales: [{ scaleId: "inherited_special", reverse: false }],
    label: {
      en: "Does your skin easily develop hives (urticaria, wheals)?",
      zh: "您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？",
    },
    section: "other",
    gender: null,
  },
  {
    // Female-specific
    key: "q19_yellow_discharge",
    scales: [{ scaleId: "damp_heat", reverse: false }],
    label: {
      en: "Is your vaginal discharge yellowish?",
      zh: "您带下色黄（白带颜色发黄）吗？",
    },
    section: "other",
    gender: "female",
  },
  {
    // Male-specific
    key: "q20_scrotal_damp",
    scales: [{ scaleId: "damp_heat", reverse: false }],
    label: {
      en: "Does your scrotal area feel damp?",
      zh: "您的阴囊部位潮湿吗？",
    },
    section: "other",
    gender: "male",
  },
];

/** Get questions filtered by gender */
export function getQuestionsForGender(
  gender: "male" | "female"
): StandardQuestion[] {
  return SCREENING_QUESTIONS.filter(
    (q) => q.gender === null || q.gender === gender
  );
}
