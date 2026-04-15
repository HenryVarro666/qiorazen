/**
 * Compliance guardrails for AI output sanitization.
 * This is the most legally critical code in the system.
 *
 * Three-layer defense:
 * 1. System prompt (prevents generation of banned terms)
 * 2. This module (post-processing scan and replacement)
 * 3. UI disclaimers (always displayed alongside output)
 */

const BANNED_PATTERNS: [RegExp, string][] = [
  // Core medical terms
  [/\bdiagnos(e[ds]?|is|tic)\b/gi, "wellness assessment"],
  [/\btreat(s|ed|ing|ment)?\b/gi, "wellness approach"],
  [/\bcure[ds]?\b/gi, "support"],
  [/\bprevent(s|ed|ing|ion)?\b/gi, "support"],
  [/\bprescri(be[ds]?|ption)\b/gi, "suggest"],
  [/\bmedicat(e[ds]?|ion)\b/gi, "wellness practice"],
  [/\bdisease[ds]?\b/gi, "imbalance pattern"],
  [/\bdisorder[ds]?\b/gi, "tendency"],
  [/\billness(es)?\b/gi, "imbalance"],
  [/\bpatholog(y|ical)\b/gi, "pattern"],
  [/\bsymptom[ds]?\b/gi, "indicator"],
  [/\bcondition[ds]?\b/gi, "pattern"],
  [/\bmedical\b/gi, "wellness"],
  [/\bclinical(ly)?\b/gi, "observational"],
  [/\btherapy\b/gi, "practice"],
  [/\btherapeutic\b/gi, "supportive"],

  // Provider terms
  [/\bpatient[ds]?\b/gi, "user"],
  [/\bdoctor[ds]?\b/gi, "wellness advisor"],
  [/\bphysician[ds]?\b/gi, "wellness advisor"],
  [/\bclinic[ds]?\b/gi, "platform"],
  [/\bprognosis\b/gi, "outlook"],

  // Pharmaceutical terms (block entirely → replace with safety redirect)
  [/\bdosage[ds]?\b/gi, "[please consult a healthcare professional]"],
  [/\bdose[ds]?\b/gi, "[please consult a healthcare professional]"],
  [/\bdrug[ds]?\b/gi, "[please consult a healthcare professional]"],
  [/\bside\s*effect[ds]?\b/gi, "[please consult a healthcare professional]"],
  [/\bcontraindication[ds]?\b/gi, "[please consult a healthcare professional]"],
  [/\bsurgery\b/gi, "[please consult a healthcare professional]"],

  // Chinese medical terms
  [/患者/g, "用户"],
  [/医生|大夫/g, "养生顾问"],
  [/处方|药方/g, "建议"],
  [/剂量|用量/g, "[请咨询专业医疗人员]"],
  [/副作用/g, "[请咨询专业医疗人员]"],
  [/手术/g, "[请咨询专业医疗人员]"],
  [/化验|检查报告/g, "[请咨询专业医疗人员]"],
  [/确诊/g, "体质分析"],
];

export interface GuardrailResult {
  sanitizedText: string;
  violations: string[];
  hasCriticalViolation: boolean;
}

/**
 * Scan and sanitize AI output text, replacing any banned medical terms
 * with wellness-appropriate alternatives.
 */
export function sanitizeOutput(text: string): GuardrailResult {
  const violations: string[] = [];
  let sanitized = text;

  for (const [pattern, replacement] of BANNED_PATTERNS) {
    const matches = sanitized.match(pattern);
    if (matches) {
      violations.push(...matches);
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  return {
    sanitizedText: sanitized,
    violations,
    hasCriticalViolation: violations.length > 3,
  };
}

/**
 * Validate that the final output contains no banned terms.
 * Returns true if the output is compliant.
 */
export function isCompliant(text: string): boolean {
  for (const [pattern] of BANNED_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      return false;
    }
  }
  return true;
}
