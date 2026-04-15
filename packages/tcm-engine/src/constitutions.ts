import type { ConstitutionType } from "@qiorazen/types";

export interface ConstitutionInfo {
  key: ConstitutionType;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  characteristics: { en: string[]; zh: string[] };
  /** GB/T 形体特征 */
  physique: { en: string; zh: string };
  /** GB/T 心理特征 */
  psychology: { en: string; zh: string };
  /** GB/T 对外界环境适应能力 */
  adaptability: { en: string; zh: string };
  /** GB/T 常见表现 — detailed paragraph */
  manifestations: { en: string; zh: string };
}

export const CONSTITUTION_INFO: Record<ConstitutionType, ConstitutionInfo> = {
  balanced: {
    key: "balanced",
    name: { en: "Balanced", zh: "平和质" },
    description: {
      en: "Harmony of Yin-Yang, Qi and Blood, characterized by moderate physique, rosy complexion, and abundant vitality",
      zh: "阴阳气血调和，以体态适中、面色红润、精力充沛等为主要特征",
    },
    characteristics: {
      en: [
        "Good energy levels throughout the day, resistant to fatigue",
        "Sound sleep, healthy appetite, normal digestion",
        "Stable emotions, adaptable to change",
      ],
      zh: [
        "精力充沛，不容易疲劳",
        "睡眠良好，食欲正常，消化顺畅",
        "情绪稳定，适应能力强",
      ],
    },
    physique: {
      en: "Well-proportioned and robust build",
      zh: "体形匀称健壮",
    },
    psychology: {
      en: "Easy-going and cheerful personality",
      zh: "性格随和开朗",
    },
    adaptability: {
      en: "Strong adaptability to both natural and social environments",
      zh: "对自然环境和社会环境适应能力较强",
    },
    manifestations: {
      en: "Lustrous complexion and skin; dense, glossy hair; bright, spirited eyes; rosy lips; tolerant of both cold and heat; good appetite; restful sleep; normal digestion and elimination.",
      zh: "面色、肤色润泽，头发稠密有光泽，目光有神，唇色红润，不易疲劳，精力充沛，耐受寒热，胃纳佳，睡眠良好，二便正常。",
    },
  },

  qi_deficiency: {
    key: "qi_deficiency",
    name: { en: "Qi Deficiency", zh: "气虚质" },
    description: {
      en: "Insufficiency of vital Qi, characterized by fatigue, shortness of breath, and spontaneous sweating",
      zh: "元气不足，以疲乏、气短、自汗等为主要特征",
    },
    characteristics: {
      en: [
        "Easily fatigued with low stamina",
        "Naturally soft or quiet voice, reluctance to speak at length",
        "Prone to catching colds, slow recovery from illness",
      ],
      zh: [
        "容易疲乏，体力不足",
        "说话声音低弱，懒得多说话",
        "容易感冒，病后康复缓慢",
      ],
    },
    physique: {
      en: "Soft and flaccid muscles, lacking firmness",
      zh: "肌肉松软不实",
    },
    psychology: {
      en: "Introverted personality, tends to avoid risk and confrontation",
      zh: "性格内向，不喜冒险",
    },
    adaptability: {
      en: "Poor tolerance to wind, cold, summer heat, dampness, and sudden weather changes",
      zh: "不耐受风、寒、暑、湿、热邪",
    },
    manifestations: {
      en: "Habitually soft and low voice; shortness of breath with reluctance to speak; easily fatigued; low spirits; prone to sweating even without exertion; tongue may show teeth marks on the edges.",
      zh: "平素语音低弱，气短懒言，容易疲乏，精神不振，易出汗，舌淡红，舌边有齿痕。",
    },
  },

  yang_deficiency: {
    key: "yang_deficiency",
    name: { en: "Yang Deficiency", zh: "阳虚质" },
    description: {
      en: "Insufficiency of Yang Qi, characterized by cold intolerance, cold extremities, and preference for warmth",
      zh: "阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征",
    },
    characteristics: {
      en: [
        "Frequently feels cold, especially in hands and feet",
        "Prefers warm food and drinks, avoids cold items",
        "Low energy that worsens in cold weather or seasons",
      ],
      zh: [
        "经常手脚发凉，怕冷",
        "喜欢温热的食物和饮品，不喜冷食",
        "天冷时精力更低，冬季尤为明显",
      ],
    },
    physique: {
      en: "Soft and flaccid muscles, lacking firmness",
      zh: "肌肉松软不实",
    },
    psychology: {
      en: "Mostly quiet and introverted personality, calm and reserved",
      zh: "性格多沉静、内向",
    },
    adaptability: {
      en: "Tolerates summer well but struggles in winter; susceptible to wind, cold, and dampness",
      zh: "耐夏不耐冬；易感风、寒、湿邪",
    },
    manifestations: {
      en: "Habitually cold-averse; cold hands and feet; preference for warm food and drinks; low spirits; pale, puffy tongue, possibly with teeth marks on the edges.",
      zh: "平素畏冷，手足不温，喜热饮食，精神不振，舌淡胖嫩，或舌边有齿痕。",
    },
  },

  yin_deficiency: {
    key: "yin_deficiency",
    name: { en: "Yin Deficiency", zh: "阴虚质" },
    description: {
      en: "Insufficiency of Yin fluids, characterized by dry mouth and throat, hot palms and soles",
      zh: "阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征",
    },
    characteristics: {
      en: [
        "Warm palms and soles, especially noticeable at night",
        "Dry mouth, throat, and sometimes dry eyes",
        "Preference for cold drinks, may have difficulty sleeping",
      ],
      zh: [
        "手心脚心发热，尤其在晚上更明显",
        "口干咽燥，有时眼睛干涩",
        "喜欢冷饮，可能不容易入睡",
      ],
    },
    physique: {
      en: "Tends toward a slender build",
      zh: "体形偏瘦",
    },
    psychology: {
      en: "Lively and outgoing personality, but can be impatient and restless",
      zh: "性格活泼，性情急躁，外向好动",
    },
    adaptability: {
      en: "Tolerates winter well but struggles in summer; intolerant of heat and dryness",
      zh: "耐冬不耐夏；不耐受暑、热、燥邪",
    },
    manifestations: {
      en: "Hot palms and soles; dry, gritty eyes; dry mouth and throat; slightly dry nose; preference for cold drinks; dry stools; red tongue with little moisture.",
      zh: "手足心热，眼睛干涩，口燥咽干，鼻微干，喜冷饮，大便干燥，舌红少津。",
    },
  },

  phlegm_dampness: {
    key: "phlegm_dampness",
    name: { en: "Phlegm-Dampness", zh: "痰湿质" },
    description: {
      en: "Accumulation of phlegm-dampness, characterized by obesity, abdominal fullness, and sticky mouth sensation",
      zh: "痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等为主要特征",
    },
    characteristics: {
      en: [
        "Oily skin, especially on the face",
        "Feels heavy or sluggish after meals, prone to drowsiness",
        "Sticky or sweet taste in the mouth",
      ],
      zh: [
        "皮肤油腻，尤其面部",
        "饭后容易感觉沉重、犯困",
        "口中黏腻或有甜味感",
      ],
    },
    physique: {
      en: "Obese build with a soft, full abdomen",
      zh: "体形肥胖，腹部肥满松软",
    },
    psychology: {
      en: "Tends toward a mild, steady personality with good patience and endurance",
      zh: "性格偏温和、稳重，善于忍耐",
    },
    adaptability: {
      en: "Poor adaptability to humid environments and rainy seasons",
      zh: "对梅雨季节及潮湿环境适应能力差",
    },
    manifestations: {
      en: "Oily facial skin; profuse and sticky sweating; chest tightness; copious phlegm; sticky or sweet taste in mouth; craving for rich, sweet, and greasy foods; large, puffy tongue with greasy coating.",
      zh: "面部皮肤油脂较多，多汗且黏，胸闷，痰多，口黏腻或甜，喜食肥甘甜黏，舌胖大，苔腻。",
    },
  },

  damp_heat: {
    key: "damp_heat",
    name: { en: "Damp-Heat", zh: "湿热质" },
    description: {
      en: "Internal accumulation of damp-heat, characterized by greasy complexion, bitter mouth, and yellow-greasy tongue coating",
      zh: "湿热内蕴，以面垢油光、口苦、苔黄腻等为主要特征",
    },
    characteristics: {
      en: [
        "Oily, shiny face, prone to acne and breakouts",
        "May feel a bitter or dry taste in the mouth",
        "Feels heavy, drowsy, and uncomfortable in humid weather",
      ],
      zh: [
        "面部油光，容易长痘",
        "口苦或口干",
        "身重困倦，潮湿天气感觉不舒服",
      ],
    },
    physique: {
      en: "Medium or slender build",
      zh: "形体中等或偏瘦",
    },
    psychology: {
      en: "Easily irritable and restless, prone to frustration",
      zh: "容易心烦急躁",
    },
    adaptability: {
      en: "Struggles with the damp-heat climate of late summer and early autumn; difficulty in humid or warm environments",
      zh: "对夏末秋初湿热气候，潮湿或气温偏高环境较难适应",
    },
    manifestations: {
      en: "Greasy, oily complexion; prone to acne; bitter and dry mouth; heavy and drowsy body; sticky or difficult stools; short and dark yellow urine; reddish tongue with yellow greasy coating.",
      zh: "面垢油光，易生痤疮，口苦口干，身重困倦，大便黏滞不畅或燥结，小便短黄，舌质偏红，苔黄腻。",
    },
  },

  blood_stasis: {
    key: "blood_stasis",
    name: { en: "Blood Stasis", zh: "血瘀质" },
    description: {
      en: "Poor blood circulation, characterized by dull complexion and dark-colored lips",
      zh: "血行不畅，以肤色晦暗、舌质紫黯等为主要特征",
    },
    characteristics: {
      en: [
        "Dull or dark complexion with pigmentation",
        "Bruises easily, slow to heal",
        "Dark-colored lips, may have dark circles under eyes",
      ],
      zh: [
        "肤色晦暗，容易色素沉着",
        "容易瘀青，恢复慢",
        "口唇色暗，可能有黑眼圈",
      ],
    },
    physique: {
      en: "No specific body type tendency — both overweight and underweight observed",
      zh: "胖瘦均见，无特定体型倾向",
    },
    psychology: {
      en: "Tends to feel irritable and restless; may experience forgetfulness",
      zh: "易烦，健忘",
    },
    adaptability: {
      en: "Intolerant of cold environments and cold weather",
      zh: "不耐受寒邪",
    },
    manifestations: {
      en: "Dull complexion; pigmentation and dark spots; easy bruising; dark-colored lips; dark tongue or with petechiae; dark purple or thickened sublingual veins.",
      zh: "肤色晦暗，色素沉着，容易出现瘀斑，口唇色暗，舌暗或有瘀点，舌下络脉紫暗或增粗。",
    },
  },

  qi_stagnation: {
    key: "qi_stagnation",
    name: { en: "Qi Stagnation", zh: "气郁质" },
    description: {
      en: "Stagnation of Qi movement, characterized by emotional depression, anxiety, and fragility",
      zh: "气机郁滞，以神情抑郁、忧虑脆弱等为主要特征",
    },
    characteristics: {
      en: [
        "Emotionally sensitive, tends to worry and overthink",
        "May experience sighing, chest tightness, or a lump-in-throat sensation",
        "Mood strongly affected by weather, seasons, or social environment",
      ],
      zh: [
        "情绪敏感，容易焦虑多虑",
        "时常叹气，感觉胸闷或喉咙有堵塞感",
        "情绪容易受天气、季节或社交环境影响",
      ],
    },
    physique: {
      en: "Mostly slender build",
      zh: "形体瘦者为多",
    },
    psychology: {
      en: "Introverted and emotionally unstable; sensitive, cautious, and prone to overthinking",
      zh: "性格内向不稳定、敏感多虑",
    },
    adaptability: {
      en: "Poor adaptability to mental stress and emotional stimulation; struggles with overcast and rainy weather",
      zh: "对精神刺激适应能力较差；不适应阴雨天气",
    },
    manifestations: {
      en: "Depressed demeanor; emotional fragility; feeling of gloom and melancholy; tendency to sigh frequently; may feel tightness in the chest or flanks.",
      zh: "神情抑郁，情感脆弱，烦闷不乐，时常叹气，可能感到胸胁胀满。",
    },
  },

  inherited_special: {
    key: "inherited_special",
    name: { en: "Inherited Special", zh: "特禀质" },
    description: {
      en: "Innate intolerance, primarily characterized by allergic reactions and environmental sensitivities",
      zh: "禀赋不耐，以过敏反应等为主要特征",
    },
    characteristics: {
      en: [
        "Sensitive to environmental changes — pollen, dust, weather shifts",
        "Prone to allergic reactions — sneezing, hives, itchy skin",
        "Skin reacts easily to products, scratching, or temperature changes",
      ],
      zh: [
        "对环境变化敏感——花粉、灰尘、天气变化",
        "容易过敏——打喷嚏、起荨麻疹、皮肤瘙痒",
        "皮肤对产品、抓挠或温度变化反应敏感",
      ],
    },
    physique: {
      en: "Generally unremarkable — no specific body type tendency",
      zh: "一般无特殊体型特征",
    },
    psychology: {
      en: "Tends to be accompanied by anxiety and nervous tension",
      zh: "容易伴随焦虑、紧张",
    },
    adaptability: {
      en: "Poor overall adaptability; struggles during allergy-prone seasons; pre-existing sensitivities may flare up",
      zh: "适应能力差，对易致敏季节适应能力差，易引发宿疾",
    },
    manifestations: {
      en: "Commonly presents with sneezing without colds; prone to allergies from medications, foods, odors, or pollen; skin easily develops hives; skin turns red and shows scratch marks when scratched; teeth-marked tongue frequently observed.",
      zh: "常见哮喘、风团、咽痒、鼻塞、喷嚏等，没有感冒时也会打喷嚏，容易过敏，皮肤一抓就红并出现抓痕，多见齿痕舌。",
    },
  },
};
