import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Fetch and extract plain text from a resume URL (PDF or DOCX).
 * The URL is a public Cloudinary link — accessible by Claude and our server.
 */
async function extractResumeText(resumeUrl, mimeType) {
  const response = await fetch(resumeUrl);
  if (!response.ok) throw new Error(`Failed to fetch resume: ${response.statusText}`);

  const buffer = await response.buffer();

  if (mimeType === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  }

  // For DOCX — send as base64 document to Claude directly
  return null; // signals to use base64 path
}

/**
 * Score a candidate's resume against a job description using Claude.
 * Returns structured scoring data.
 *
 * @param {string} resumeUrl    - Public Cloudinary URL of the resume
 * @param {string} mimeType     - MIME type of the resume file
 * @param {string} jobTitle     - Title of the role
 * @param {string} jobDescription - Full job description text
 * @param {string} name         - Candidate's name
 * @param {string} email        - Candidate's email
 */
async function screenResume({ resumeUrl, mimeType, jobTitle, jobDescription, name, email }) {
  let resumeText = null;
  let useUrl = false;

  try {
    resumeText = await extractResumeText(resumeUrl, mimeType);
    if (!resumeText) useUrl = true;
  } catch (err) {
    useUrl = true; // If extraction fails, let Claude fetch the URL
  }

  const formContext =
    name || email
      ? `\n\nAdditional candidate information:\nName: ${name || "Unknown"}\nEmail: ${email || "Unknown"}`
      : "";

  const systemPrompt = `You are an expert technical recruiter and resume screener. 
Your job is to objectively score a candidate's resume against a job description.
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

  const userPrompt = `Score this candidate's resume against the job description below.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}
${formContext}

${resumeText ? `RESUME TEXT:\n${resumeText}` : `RESUME URL: ${resumeUrl}\nPlease fetch and analyze the resume from the URL above.`}

Respond ONLY with this JSON structure:
{
  "score": <overall 0-100>,
  "scoreBreakdown": {
    "skills": <0-100, how well technical/soft skills match>,
    "experience": <0-100, relevance and years of experience>,
    "education": <0-100, education fit for the role>
  },
  "reasoning": "<2-3 sentence explanation of the score and key factors>"
}`;

  const messages = [{ role: "user", content: userPrompt }];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const result = JSON.parse(cleaned);

  return {
    jobTitle,
    jobDescription,
    score: result.score,
    scoreBreakdown: {
      ...result.scoreBreakdown,
      overall: result.score,
    },
    recommendation: result.recommendation,
    reasoning: result.reasoning,
  };
}

export { screenResume };