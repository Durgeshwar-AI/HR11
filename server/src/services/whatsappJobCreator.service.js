import Groq from "groq-sdk";
import JobRole from "../models/JobRole.model.js";
import Question from "../models/Question.model.js";
import { autoSchedulePipeline } from "./pipelineScheduler.service.js";

let _groq = null;
function getGroq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const SYSTEM_PROMPT = `You are an AI assistant that extracts structured job role data from natural language HR messages sent via Telegram.

Parse the message and return ONLY valid JSON (no markdown, no extra text) with this schema:
{
  "title": "string (required) — job title",
  "description": "string — role description inferred from context",
  "skills": ["array", "of", "skill", "strings"],
  "submissionDeadline": "ISO 8601 date string or null if not mentioned",
  "topN": number or null (how many top candidates to keep),
  "totalRounds": number or null (total interview rounds after screening),
  "pipeline": [
    {
      "stageType": "one of: resume_screening | aptitude_test | coding_challenge | ai_voice_interview | technical_interview | custom_round",
      "stageName": "human-readable name for this stage",
      "order": 1,
      "thresholdScore": 60,
      "daysAfterPrev": 3
    }
  ],
  "questions": [
    {
      "text": "question text",
      "level": "Easy | Medium | Hard",
      "keyConceptsExpected": ["array of concepts"]
    }
  ]
}

Pipeline rules:
- ALWAYS generate a pipeline. This is the most important field.
- If the HR explicitly mentions stages like "aptitude", "coding", "technical", "resume screening", "AI interview", "voice interview", use those.
- If no pipeline is mentioned explicitly, ALWAYS generate a sensible default pipeline based on the job type:
  - For engineering/technical roles: resume_screening → aptitude_test → coding_challenge → technical_interview
  - For non-technical roles (design, marketing, HR, sales): resume_screening → aptitude_test → ai_voice_interview
  - For senior/lead roles: resume_screening → coding_challenge → technical_interview → ai_voice_interview
  - For internships/junior roles: resume_screening → aptitude_test → coding_challenge
- Stages allowed: resume_screening, aptitude_test, coding_challenge, ai_voice_interview, technical_interview, custom_round.
- A stage can repeat (e.g. two technical rounds). Assign sequential order values.
- The pipeline must NEVER be empty. Always include at least resume_screening + one more stage.
- "thresholdScore" defaults to 60 unless explicitly stated.
- "daysAfterPrev" defaults to 3 unless a gap is explicitly stated.
- "stageName" should be a human-readable label like "Resume Screening", "Aptitude Test", etc.

General rules:
- If a deadline date is mentioned without a year, assume the current year (2026).
- If no deadline is mentioned, set submissionDeadline to 14 days from today's date.
- totalRounds must always match the pipeline length.
- If no questions are explicitly mentioned, return questions as an empty array.
- Skills MUST be inferred from the job title and description if not explicitly listed. Always return at least 3 relevant skills.
- topN defaults to 5 if not mentioned.
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
  // Normalise pipeline stages if the AI returned them
  const pipeline = Array.isArray(parsed.pipeline)
    ? parsed.pipeline
        .filter((s) => s.stageType)
        .map((s, idx) => ({
          stageType: s.stageType,
          stageName: s.stageName || null,
          order: s.order ?? idx + 1,
          thresholdScore: s.thresholdScore ?? 60,
          daysAfterPrev: s.daysAfterPrev ?? 3,
          scheduledDate: null,
        }))
    : [];

  const computedTotalRounds =
    pipeline.length > 0
      ? pipeline.length
      : parsed.totalRounds != null
        ? Number(parsed.totalRounds)
        : 2;

  const job = await JobRole.create({
    title: parsed.title,
    description: parsed.description || "",
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    createdBy: createdByHRId,
    status: "Active",
    pipeline,
    totalRounds: computedTotalRounds,
    ...(parsed.submissionDeadline && {
      submissionDeadline: new Date(parsed.submissionDeadline),
    }),
    ...(parsed.topN != null && { topN: Number(parsed.topN) }),
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

// ── Stage icons for pretty summaries ────────────────────────────
const STAGE_ICONS = {
  resume_screening: "📄",
  aptitude_test: "🧠",
  coding_challenge: "💻",
  ai_voice_interview: "🎙️",
  technical_interview: "⚙️",
  custom_round: "🛠️",
};

// ── Default pipeline fallback if AI returns empty ───────────────
const DEFAULT_PIPELINE = [
  {
    stageType: "resume_screening",
    stageName: "Resume Screening",
    order: 1,
    thresholdScore: 60,
    daysAfterPrev: 3,
  },
  {
    stageType: "aptitude_test",
    stageName: "Aptitude Test",
    order: 2,
    thresholdScore: 60,
    daysAfterPrev: 3,
  },
  {
    stageType: "coding_challenge",
    stageName: "Coding Challenge",
    order: 3,
    thresholdScore: 60,
    daysAfterPrev: 3,
  },
  {
    stageType: "technical_interview",
    stageName: "Technical Interview",
    order: 4,
    thresholdScore: 60,
    daysAfterPrev: 3,
  },
];

/**
 * Master function: parse message → create in DB → auto-schedule pipeline → return summary.
 * Works like the frontend PipelineBuilder — one command does everything.
 */
export async function handleWhatsAppJobCommand(message, createdByHRId) {
  const parsed = await parseJobFromMessage(message);

  // Ensure pipeline is never empty — use default if AI didn't generate one
  if (!Array.isArray(parsed.pipeline) || parsed.pipeline.length === 0) {
    parsed.pipeline = DEFAULT_PIPELINE;
    parsed.totalRounds = DEFAULT_PIPELINE.length;
  }

  // Ensure deadline exists (default 14 days from now)
  if (!parsed.submissionDeadline) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    parsed.submissionDeadline = deadline.toISOString();
  }

  // Ensure topN
  if (parsed.topN == null) parsed.topN = 5;

  const { job, questions } = await createJobFromParsed(parsed, createdByHRId);

  // ── Auto-schedule pipeline dates (like SCHEDULE command) ────────
  let scheduledJob = job;
  if (job.pipeline?.length > 0) {
    try {
      await autoSchedulePipeline(job, job.submissionDeadline);
      scheduledJob = await JobRole.findById(job._id);
    } catch (schedErr) {
      console.warn("[JobCreator] Auto-schedule failed:", schedErr.message);
    }
  }

  // ── Build rich summary ─────────────────────────────────────────
  const deadline = scheduledJob.submissionDeadline
    ? scheduledJob.submissionDeadline.toDateString()
    : "Not set";

  const pipelineLines =
    scheduledJob.pipeline
      ?.sort((a, b) => a.order - b.order)
      .map((s) => {
        const icon = STAGE_ICONS[s.stageType] || "▪️";
        const name = s.stageName || s.stageType.replace(/_/g, " ");
        const date = s.scheduledDate
          ? new Date(s.scheduledDate).toDateString()
          : "TBD";
        return `  ${icon} ${s.order}. ${name} — ${date}`;
      })
      .join("\n") || "  None";

  const questionLines =
    questions.length > 0
      ? questions.map((q, i) => `  ${i + 1}. [${q.level}] ${q.text}`).join("\n")
      : "  Auto-generated during each round";

  const summary =
    `✅ *Job Created & Pipeline Deployed!*\n\n` +
    `*Title:* ${scheduledJob.title}\n` +
    `*Description:* ${scheduledJob.description || "—"}\n` +
    `*Skills:* ${scheduledJob.skills.join(", ") || "N/A"}\n` +
    `*Deadline:* ${deadline}\n` +
    `*Top N candidates:* ${scheduledJob.topN}\n\n` +
    `📋 *Hiring Pipeline (${scheduledJob.pipeline?.length ?? 0} stages):*\n${pipelineLines}\n\n` +
    `*Questions (${questions.length}):*\n${questionLines}\n\n` +
    `*Job ID:* \`${scheduledJob._id}\`\n` +
    `*Status:* ${scheduledJob.status} | *Scheduling:* ✅ Done`;

  return { summary, job: scheduledJob, questions };
}
