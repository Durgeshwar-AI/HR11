import Groq from "groq-sdk";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

function clampScore(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeScreeningResult(parsed = {}) {
  const score = clampScore(parsed.score);
  const skills = clampScore(parsed.scoreBreakdown?.skills);
  const experience = clampScore(parsed.scoreBreakdown?.experience);
  const education = clampScore(parsed.scoreBreakdown?.education);

  return {
    score,
    scoreBreakdown: {
      skills,
      experience,
      education,
      overall: score,
    },
    reasoning:
      typeof parsed.reasoning === "string"
        ? parsed.reasoning.trim()
        : "Screening completed with partial AI output.",
  };
}

function parseGroqJson(raw) {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  const candidates = [
    trimmed,
    trimmed.replace(/```json|```/gi, "").trim(),
  ];

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue trying alternative candidates
    }
  }

  return null;
}

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

  const model = "llama-3.3-70b-versatile";
  const chat = await getGroq().chat.completions.create({
    model,
    messages: [{ role: "user", content: userPrompt }],
    max_tokens: 512,
    temperature: 0.2,
  });

  let raw = chat.choices[0]?.message?.content || "";
  let result = parseGroqJson(raw);

  // Retry once with a stricter instruction if the first output is not parseable JSON.
  if (!result) {
    const strictChat = await getGroq().chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. No markdown fences, no prose, no extra keys.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0,
    });

    raw = strictChat.choices[0]?.message?.content || "";
    result = parseGroqJson(raw);
  }

  if (!result) {
    console.warn(
      `[screenResume] Groq output was not parseable JSON. Using safe fallback. Raw sample: ${raw.slice(0, 200)}`
    );
    result = {
      score: 0,
      scoreBreakdown: { skills: 0, experience: 0, education: 0 },
      reasoning: "AI output was malformed. Please retry screening.",
    };
  }

  const normalized = normalizeScreeningResult(result);

  return {
    jobTitle,
    jobDescription,
    score: normalized.score,
    scoreBreakdown: normalized.scoreBreakdown,
    reasoning: normalized.reasoning,
  };
}

export { screenResume };