import { NextResponse, type NextRequest } from "next/server";
import { sanitizeOutput } from "@/lib/ai/guardrails";

type AssistAction = "summarize" | "translate" | "compliance_check" | "polish";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, text, targetLanguage } = body as {
    action: AssistAction;
    text: string;
    targetLanguage?: "en" | "zh";
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  // Mock mode when no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(getMockResponse(action, text, targetLanguage));
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic();

  const prompts: Record<AssistAction, string> = {
    summarize: `You are a wellness platform assistant. The user has written wellness questions in a casual or verbose way. Summarize their input into clear, concise wellness questions that a TCM wellness advisor can address effectively.

Rules:
- Keep the same language as the input
- Preserve the user's intent
- Make questions specific and actionable
- Remove filler words and repetition
- Output ONLY the refined questions, one per line, numbered

User's input:
${text}`,

    translate: `Translate the following text to ${targetLanguage === "zh" ? "Simplified Chinese" : "English"}. Keep the meaning accurate. If the text contains wellness or TCM terminology, use the appropriate terms in the target language. Output ONLY the translation, nothing else.

Text:
${text}`,

    compliance_check: `You are a compliance reviewer for a TCM wellness platform. Review the following AI-generated wellness response and identify any compliance issues.

CRITICAL RULES (violations = legal liability):
- NEVER use: diagnose, treat, cure, prevent, prescribe, medication, disease, disorder, illness, symptom, condition, patient, doctor
- NEVER make organ-level claims ("your liver is weak", "kidney deficiency")
- NEVER say "you have X" or "you are X" about health states
- MUST use distancing language: "traditional perspectives suggest...", "some people find..."
- MUST frame as lifestyle/educational, NOT medical

Review this text and respond in JSON:
{
  "issues": [{"text": "problematic phrase", "reason": "why it's problematic", "suggestion": "safe alternative"}],
  "safe": true/false,
  "summary": "1-2 sentence overall assessment"
}

Text to review:
${text}`,

    polish: `You are a wellness content editor. Polish the following advisor note for a TCM wellness platform. Make it professional, warm, and compliant.

Rules:
- Use wellness language only (never medical terms)
- Use distancing language: "traditional perspectives suggest...", "you might consider..."
- Keep it concise (2-3 sentences max)
- Keep the same language as the input
- NEVER use: diagnose, treat, cure, prescribe, patient, doctor, medication
- Output ONLY the polished text, nothing else

Original note:
${text}`,
  };

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompts[action] }],
    });

    const result = response.content[0].type === "text" ? response.content[0].text : "";

    // For compliance check, parse JSON
    if (action === "compliance_check") {
      try {
        const parsed = JSON.parse(result);
        return NextResponse.json({ action, result: parsed });
      } catch {
        return NextResponse.json({ action, result: { issues: [], safe: true, summary: result } });
      }
    }

    // For polish, run through guardrails
    if (action === "polish") {
      const sanitized = sanitizeOutput(result);
      return NextResponse.json({ action, result: sanitized.sanitizedText });
    }

    return NextResponse.json({ action, result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "AI request failed" }, { status: 500 });
  }
}

function getMockResponse(action: AssistAction, text: string, targetLanguage?: string) {
  switch (action) {
    case "summarize":
      return {
        action,
        result: text.includes("中") || /[\u4e00-\u9fa5]/.test(text)
          ? "1. 关于疲劳和生活方式调整的建议\n2. 适合体质的饮食方向"
          : "1. Lifestyle adjustments for fatigue management\n2. Dietary guidance suited to constitution type",
        mock: true,
      };
    case "translate":
      return {
        action,
        result: targetLanguage === "zh"
          ? "[模拟翻译] " + text
          : "[Mock translation] " + text,
        mock: true,
      };
    case "compliance_check":
      return {
        action,
        result: {
          issues: [],
          safe: true,
          summary: "No compliance issues detected (mock mode).",
        },
        mock: true,
      };
    case "polish":
      return {
        action,
        result: text,
        mock: true,
      };
  }
}
