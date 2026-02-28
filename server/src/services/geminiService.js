/**
 * Gemini Standard API service for evaluation and ranking.
 * Uses Google's Generative AI SDK.
 */

let genAI = null;

async function getGenAI() {
  if (genAI) return genAI;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI;
  } catch {
    console.warn("@google/generative-ai not installed — Gemini calls will fail");
    return null;
  }
}

/**
 * Call Gemini Standard API with a text prompt.
 * Returns the raw text response.
 */
export async function callGeminiStandard(prompt) {
  const ai = await getGenAI();
  if (!ai) {
    throw new Error("Gemini SDK not available");
  }

  const modelName = process.env.GEMINI_EVAL_MODEL || "gemini-2.0-flash";
  const model = ai.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Strip markdown fences if present
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  return text;
}
