import Groq from "groq-sdk";
import JobRole from "../models/JobRole.model.js";
import Question from "../models/Question.model.js";

let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const SYSTEM_PROMPT = `You are an AI assistant that extracts structured job role data from natural language HR messages sent via WhatsApp.

Parse the message and return ONLY valid JSON (no markdown, no extra text) with this schema:
{
  "title": "string (required) — job title",
  "description": "string — role description inferred from context",
  "skills": ["array", "of", "skill", "strings"],
  "submissionDeadline": "ISO 8601 date string or null if not mentioned",
  "topN": number or null (how many top candidates to keep),
  "totalRounds": number or null (total interview rounds after screening),
  "questions": [
    {
      "text": "question text",
      "level": "Easy | Medium | Hard",
      "keyConceptsExpected": ["array of concepts"]
    }
  ]
}

Rules:
- If a deadline date is mentioned without a year, assume the current year (2026).
- If "rounds" or "stages" are mentioned, put the count in totalRounds.
- If no questions are explicitly mentioned, return questions as an empty array.
- Skills can be inferred from the job title if not explicitly listed (e.g. "React Engineer" → ["React", "JavaScript"]).
- Always return valid JSON. Never include code fences or explanation text.`;

/**
 * Parse a WhatsApp message into structured job creation data.
 * @param {string} message - Raw WhatsApp message text from HR
 * @returns {Promise<Object>} Parsed job data
 */
export async function parseJobFromMessage(message) {
  const groq = getGroq();

  const chat = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Today's date: ${new Date().toISOString().split("T")[0]}\n\nMessage: ${message}`,
      },
    ],
    temperature: 0,
    max_tokens: 1024,
  });

  const raw = chat.choices[0]?.message?.content?.trim() || "{}";

  let parsed;
  try {
    // Strip code fences if the model adds them despite instructions
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned non-JSON output: ${raw.slice(0, 200)}`);
  }

  if (!parsed.title) {
    throw new Error(
      "Could not extract a job title from the message. Please include a job title.",
    );
  }

  return parsed;
}

/**
 * Create a JobRole + optional questions in the database from parsed data.
 * createdByHRId must be a valid HRUser ObjectId.
 */
export async function createJobFromParsed(parsed, createdByHRId) {
  const job = await JobRole.create({
    title: parsed.title,
    description: parsed.description || "",
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    createdBy: createdByHRId,
    status: "Active",
    ...(parsed.submissionDeadline && {
      submissionDeadline: new Date(parsed.submissionDeadline),
    }),
    ...(parsed.topN != null && { topN: Number(parsed.topN) }),
    ...(parsed.totalRounds != null && {
      totalRounds: Number(parsed.totalRounds),
    }),
  });

  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  let createdQuestions = [];

  if (questions.length > 0) {
    createdQuestions = await Promise.all(
      questions.map((q, idx) =>
        Question.create({
          jobId: job._id,
          stepNumber: idx + 1,
          text: q.text,
          level: ["Easy", "Medium", "Hard"].includes(q.level)
            ? q.level
            : "Medium",
          keyConceptsExpected: Array.isArray(q.keyConceptsExpected)
            ? q.keyConceptsExpected
            : [],
          maxScore: 10,
          allowFollowUp: true,
        }),
      ),
    );

    await JobRole.findByIdAndUpdate(job._id, {
      totalSteps: createdQuestions.length,
    });
  }

  return { job, questions: createdQuestions };
}

/**
 * Master function: parse message → create in DB → return summary.
 */
export async function handleWhatsAppJobCommand(message, createdByHRId) {
  const parsed = await parseJobFromMessage(message);
  const { job, questions } = await createJobFromParsed(parsed, createdByHRId);

  const deadline = job.submissionDeadline
    ? job.submissionDeadline.toDateString()
    : "Not set";

  const questionLines =
    questions.length > 0
      ? questions.map((q, i) => `  ${i + 1}. [${q.level}] ${q.text}`).join("\n")
      : "  None added";

  const summary =
    `✅ *Job Created Successfully!*\n\n` +
    `*Title:* ${job.title}\n` +
    `*Skills:* ${job.skills.join(", ") || "N/A"}\n` +
    `*Deadline:* ${deadline}\n` +
    `*Top N candidates:* ${job.topN}\n` +
    `*Interview Rounds:* ${job.totalRounds}\n` +
    `*Questions (${questions.length}):*\n${questionLines}\n\n` +
    `*Job ID:* ${job._id}`;

  return { summary, job, questions };
}
