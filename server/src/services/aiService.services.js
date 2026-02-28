import Groq from "groq-sdk";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

// Lazy client — only created when screenResume is first called so the server
// boots without GROQ_API_KEY; callers get a clear error if key is missing.
let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not set. Add it to your .env file. " +
        "Get a free key at https://console.groq.com/keys"
      );
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/**
 * Fetch resume from URL and extract plain text.
 * Supports PDF (via pdf-parse) and DOCX (via mammoth).
 */
async function extractResumeText(resumeUrl, mimeType) {
  const response = await fetch(resumeUrl);
  if (!response.ok)
    throw new Error(`Failed to fetch resume: ${response.statusText}`);

  // Use arrayBuffer (native Fetch API) then convert to Node Buffer
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const type = (mimeType || "").toLowerCase();

  if (type.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    await parser.destroy();
    return data.text?.trim() || "";
  }

  if (
    type.includes("docx") ||
    type.includes("openxmlformats") ||
    type.includes("wordprocessingml")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  }

  // Plain text fallback
  return buffer.toString("utf-8").trim();
}

/**
 * Screen a resume against a job description using Groq (Llama 3.3 70B — free).
 *
 * @param {string} resumeUrl       - Public Cloudinary URL of the resume file
 * @param {string} mimeType        - MIME type of the uploaded file
 * @param {string} jobTitle        - Job title
 * @param {string} jobDescription  - Full job description
 * @param {string} [name]          - Candidate name (optional)
 * @param {string} [email]         - Candidate email (optional)
 */
async function screenResume({ resumeUrl, mimeType, jobTitle, jobDescription, name, email }) {
  // Extract resume text — fall back to URL hint if extraction fails
  let resumeText = "";
  try {
    resumeText = await extractResumeText(resumeUrl, mimeType);
  } catch (err) {
    console.warn("[screenResume] Text extraction failed, proceeding with URL hint:", err.message);
  }

  const candidateInfo =
    name || email
      ? `\nCandidate Name: ${name || "Unknown"}\nCandidate Email: ${email || "Unknown"}`
      : "";

  const userPrompt = `You are an expert technical recruiter. Score the following resume against the job description.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}
${candidateInfo}

RESUME TEXT:
${resumeText || "(Resume text could not be extracted — base judgment on any available context)"}

Respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON:
{
  "score": <integer 0-100, overall match>,
  "scoreBreakdown": {
    "skills": <integer 0-100>,
    "experience": <integer 0-100>,
    "education": <integer 0-100>
  },
  "reasoning": "<2-3 sentences explaining the score>"
}`;

  const chat = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: userPrompt }],
    max_tokens: 512,
    temperature: 0.2,
  });

  const raw = chat.choices[0]?.message?.content || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch {
    throw new Error(`Groq returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  return {
    jobTitle,
    jobDescription,
    score: result.score ?? 0,
    scoreBreakdown: {
      skills: result.scoreBreakdown?.skills ?? 0,
      experience: result.scoreBreakdown?.experience ?? 0,
      education: result.scoreBreakdown?.education ?? 0,
      overall: result.score ?? 0,
    },
    reasoning: result.reasoning ?? "",
  };
}

export { screenResume };