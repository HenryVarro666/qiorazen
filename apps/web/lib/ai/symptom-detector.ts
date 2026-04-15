/**
 * Serious symptom detection.
 * Runs BEFORE any AI processing. If triggered, blocks insight generation
 * and shows emergency redirect.
 */

const EMERGENCY_PATTERNS: RegExp[] = [
  // English — life-threatening
  /chest\s*pain/i,
  /difficulty\s*breathing/i,
  /can'?t\s*breathe/i,
  /suicid/i,
  /self[- ]?harm/i,
  /kill\s*(my|him|her|them)?self/i,
  /want\s*to\s*die/i,
  /severe\s*bleeding/i,
  /loss\s*of\s*consciousness/i,
  /faint(ed|ing)\b/i,
  /seizure/i,
  /stroke/i,
  /heart\s*attack/i,
  /overdos/i,
  /poison/i,
  /severe\s*allergic/i,
  /anaphyla/i,

  // English — additional critical patterns
  /blood\s*in\s*(stool|urine)/i,
  /sudden\s*severe\s*headache/i,
  /numbness\s*(on\s*)?one\s*side/i,
  /slurred\s*speech/i,
  /severe\s*abdominal\s*pain/i,
  /high\s*fever/i,
  /fever\s*(over|above)\s*(103|104|39|40)/i,
  /pregnan(t|cy).{0,30}(pain|bleed|cramp|emergency)/i,
  /(infant|baby|child|toddler|newborn).{0,30}(sick|fever|emergency|not\s*breathing)/i,

  // Chinese — 生命危险
  /胸痛/,
  /呼吸困难/,
  /自杀/,
  /自残/,
  /大出血/,
  /意识丧失/,
  /晕倒/,
  /癫痫/,
  /中风/,
  /心脏病发/,
  /过量服药/,
  /中毒/,
  /严重过敏/,

  // Chinese — 新增危急
  /便血/,
  /尿血/,
  /突发剧烈头痛/,
  /一侧麻木/,
  /言语不清/,
  /剧烈腹痛/,
  /高烧/,
  /怀孕.{0,10}(出血|疼痛|不适)/,
  /(婴儿|宝宝|孩子|小孩).{0,10}(发烧|生病|不舒服|呼吸)/,
];

export interface SymptomDetectionResult {
  detected: boolean;
  matchedPatterns: string[];
}

/**
 * Check user-submitted text for patterns indicating serious or
 * emergency medical situations.
 */
export function detectSeriousSymptoms(
  texts: string[]
): SymptomDetectionResult {
  const matches: string[] = [];

  for (const text of texts) {
    for (const pattern of EMERGENCY_PATTERNS) {
      if (pattern.test(text)) {
        matches.push(pattern.source);
      }
    }
  }

  return {
    detected: matches.length > 0,
    matchedPatterns: [...new Set(matches)],
  };
}
