/**
 * Serious symptom detection.
 * Runs BEFORE any AI processing. If triggered, blocks insight generation
 * and shows emergency redirect.
 */

const EMERGENCY_PATTERNS: RegExp[] = [
  // English
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

  // Chinese
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
