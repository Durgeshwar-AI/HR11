import express from "express";
import HRUser from "../../models/HRUser.model.js";
import JobRole, { STAGE_TYPES } from "../../models/JobRole.model.js";
import InterviewProgress from "../../models/InterviewProgress.model.js";
import ScreeningCandidate from "../../models/candidate.screening.model.js";
import { handleWhatsAppJobCommand } from "../../services/whatsappJobCreator.service.js";
import {
  autoSchedulePipeline,
  processFailedCandidates,
} from "../../services/pipelineScheduler.service.js";

const router = express.Router();

// ─── Prefix trigger keyword ──────────────────────────────────────
const TRIGGER_KEYWORD = (
  process.env.TELEGRAM_TRIGGER_KEYWORD || "CREATE JOB"
).toUpperCase();

// ── Stage slug → stageType mapping (allows shorthand) ────────────
const STAGE_ALIASES = {
  resume: "resume_screening",
  "resume screening": "resume_screening",
  aptitude: "aptitude_test",
  "aptitude test": "aptitude_test",
  coding: "coding_challenge",
  "coding challenge": "coding_challenge",
  ai: "ai_voice_interview",
  "ai interview": "ai_voice_interview",
  "ai voice": "ai_voice_interview",
  voice: "ai_voice_interview",
  technical: "technical_interview",
  "technical interview": "technical_interview",
  custom: "custom_round",
};

function resolveStage(raw) {
  const key = raw.trim().toLowerCase();
  return STAGE_ALIASES[key] || (STAGE_TYPES.includes(key) ? key : null);
}

/**
 * Send a Telegram text reply via Bot API.
 * Uses MarkdownV2 parse mode for bold/italic formatting.
 */
async function sendTelegramReply(chatId, text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN not set — reply skipped");
    return;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[Telegram] Failed to send reply:", err);
  }
}

// ── Command handlers ─────────────────────────────────────────────

async function handleHelp(chatId) {
  await sendTelegramReply(
    chatId,
    `🤖 *AgenticHire Bot Commands*\n\n` +
      `📋 *CREATE JOB* <description>\n` +
      `   AI parses title, skills, deadline, pipeline.\n` +
      `   Creates job + full pipeline + auto-schedules dates.\n` +
      `   _Ex: CREATE JOB Senior React Eng, deadline April 30, top 5_\n` +
      `   _Ex: CREATE JOB ML Engineer, skills: Python TensorFlow, rounds: resume, coding, technical_\n\n` +
      `🔧 *ADD PIPELINE* <job\\_id> stages: <s1, s2, ...>\n` +
      `   Override pipeline for an existing job.\n` +
      `   Stages: resume, aptitude, coding, ai, technical, custom\n` +
      `   _Ex: ADD PIPELINE 663abc stages: resume, aptitude, technical_\n\n` +
      `📅 *SCHEDULE* <job\\_id>\n` +
      `   Re-schedule dates if you changed the pipeline.\n\n` +
      `📊 *STATUS* <job\\_id>\n` +
      `   Shows pipeline, dates, and per-stage candidate counts.\n\n` +
      `✅ *SHORTLIST* <job\\_id> stage <n>\n` +
      `   Removes candidates who failed stage N.\n\n` +
      `📃 *LIST JOBS*\n` +
      `   Shows all active job openings.\n\n` +
      `❓ */help* — shows this menu`,
  );
}

async function handleAddPipeline(chatId, rawText) {
  const jobMatch = rawText.match(/add\s+pipeline\s+([a-f0-9]{24})/i);
  const stagesMatch = rawText.match(/stages?\s*:\s*(.+)/i);

  if (!jobMatch || !stagesMatch) {
    await sendTelegramReply(
      chatId,
      `❌ Format: *ADD PIPELINE <job\\_id> stages: resume, aptitude, coding, technical*\n` +
        `Use STATUS <job\\_id> to get IDs. Send HELP for docs.`,
    );
    return;
  }

  const jobId = jobMatch[1];
  const rawStages = stagesMatch[1].split(",").map((s) => s.trim());
  const pipeline = rawStages
    .map((s, idx) => {
      const stageType = resolveStage(s);
      return stageType
        ? { stageType, order: idx + 1, thresholdScore: 60, daysAfterPrev: 3 }
        : null;
    })
    .filter(Boolean);

  if (!pipeline.length) {
    await sendTelegramReply(
      chatId,
      `❌ No valid stages found. Valid: resume, aptitude, coding, ai, technical, custom`,
    );
    return;
  }

  const job = await JobRole.findById(jobId);
  if (!job) {
    await sendTelegramReply(chatId, `❌ Job ID "${jobId}" not found.`);
    return;
  }

  job.pipeline = pipeline;
  job.totalRounds = pipeline.length;
  job.schedulingDone = false;
  await job.save();

  const list = pipeline
    .map((s, i) => `  ${i + 1}. ${s.stageType.replace(/_/g, " ")}`)
    .join("\n");

  await sendTelegramReply(
    chatId,
    `✅ *Pipeline saved for "${job.title}"*\n\n${list}\n\n` +
      `📅 Next: *SCHEDULE ${job._id}* to auto-assign dates.`,
  );
}

async function handleSchedule(chatId, rawText) {
  const idMatch = rawText.match(/schedule\s+([a-f0-9]{24})/i);
  if (!idMatch) {
    await sendTelegramReply(chatId, `❌ Format: *SCHEDULE <job\\_id>*`);
    return;
  }

  const job = await JobRole.findById(idMatch[1]);
  if (!job) {
    await sendTelegramReply(chatId, `❌ Job not found.`);
    return;
  }
  if (!job.pipeline?.length) {
    await sendTelegramReply(
      chatId,
      `❌ No pipeline on "${job.title}".\nRun: *ADD PIPELINE ${job._id} stages: resume, technical* first.`,
    );
    return;
  }

  await autoSchedulePipeline(job, job.submissionDeadline);
  const updated = await JobRole.findById(job._id);

  const lines = updated.pipeline
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const d = s.scheduledDate
        ? new Date(s.scheduledDate).toDateString()
        : "TBD";
      const name = s.stageName || s.stageType.replace(/_/g, " ");
      return `  ${s.order}. ${name} → ${d}`;
    })
    .join("\n");

  await sendTelegramReply(
    chatId,
    `📅 *Pipeline scheduled for "${updated.title}"*\n\n${lines}\n\n` +
      `Candidates will be notified when each stage opens.`,
  );
}

async function handleStatus(chatId, rawText) {
  const idMatch = rawText.match(/status\s+([a-f0-9]{24})/i);
  if (!idMatch) {
    await sendTelegramReply(chatId, `❌ Format: *STATUS <job\\_id>*`);
    return;
  }

  const job = await JobRole.findById(idMatch[1]);
  if (!job) {
    await sendTelegramReply(chatId, `❌ Job not found.`);
    return;
  }

  const [total, shortlisted, progressRecords] = await Promise.all([
    ScreeningCandidate.countDocuments({ jobId: job._id }),
    ScreeningCandidate.countDocuments({
      jobId: job._id,
      status: "shortlisted",
    }),
    InterviewProgress.find({ jobId: job._id }),
  ]);

  let pipelineText = "  _(no pipeline defined)_";
  if (job.pipeline?.length) {
    pipelineText = job.pipeline
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const d = s.scheduledDate
          ? new Date(s.scheduledDate).toDateString()
          : "Not scheduled";
        const name = s.stageName || s.stageType.replace(/_/g, " ");
        const active = progressRecords.filter((p) =>
          p.rounds.find(
            (r) => r.roundNumber === s.order && r.status === "InProgress",
          ),
        ).length;
        const done = progressRecords.filter((p) =>
          p.rounds.find(
            (r) => r.roundNumber === s.order && r.status === "Completed",
          ),
        ).length;
        return `  ${s.order}. ${name}\n     📅 ${d} | 🔵 ${active} active | ✅ ${done} done`;
      })
      .join("\n");
  }

  await sendTelegramReply(
    chatId,
    `📊 *${job.title}*\n` +
      `ID: ${job._id}\n` +
      `Status: ${job.status} | Deadline: ${job.submissionDeadline ? new Date(job.submissionDeadline).toDateString() : "None"}\n` +
      `Applicants: ${total} | Shortlisted: ${shortlisted}\n\n` +
      `*Pipeline:*\n${pipelineText}`,
  );
}

async function handleShortlist(chatId, rawText) {
  const match = rawText.match(/shortlist\s+([a-f0-9]{24})\s+stage\s+(\d+)/i);
  if (!match) {
    await sendTelegramReply(
      chatId,
      `❌ Format: *SHORTLIST <job\\_id> stage <number>*`,
    );
    return;
  }

  const result = await processFailedCandidates(
    match[1],
    parseInt(match[2], 10),
  );
  await sendTelegramReply(
    chatId,
    `✅ Stage ${match[2]} shortlisting complete.\n` +
      `${result?.rejected ?? 0} candidate(s) eliminated (score below threshold).\n` +
      `Passing candidates advance to the next round.`,
  );
}

async function handleListJobs(chatId, hrId) {
  const jobs = await JobRole.find({ status: "Active" })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title pipeline status submissionDeadline createdAt");

  if (!jobs.length) {
    await sendTelegramReply(
      chatId,
      `📭 No active jobs found. Send *CREATE JOB* to create one.`,
    );
    return;
  }

  const lines = jobs
    .map((j, i) => {
      const deadline = j.submissionDeadline
        ? new Date(j.submissionDeadline).toDateString()
        : "No deadline";
      const stages = j.pipeline?.length || 0;
      return `${i + 1}. *${j.title}*\n   📅 ${deadline} | 🔧 ${stages} stages\n   ID: \`${j._id}\``;
    })
    .join("\n\n");

  await sendTelegramReply(
    chatId,
    `📋 *Active Job Openings (${jobs.length})*\n\n${lines}\n\n` +
      `Use *STATUS <job\\_id>* to see details.`,
  );
}

// ── POST /api/telegram/webhook — Telegram Bot webhook ────────────
router.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Acknowledge immediately

  try {
    const update = req.body;

    // Telegram sends updates with a "message" field
    const msg = update?.message;
    if (!msg || !msg.text) return;

    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id?.toString();
    const rawText = msg.text.trim();
    const upper = rawText.toUpperCase();

    // Resolve HR user by Telegram user ID
    const hrUser = await HRUser.findOne({ telegramUserId });
    const fallbackHRId = process.env.TELEGRAM_DEFAULT_HR_ID;

    if (!hrUser && !fallbackHRId) {
      await sendTelegramReply(
        chatId,
        "❌ Your Telegram account is not linked to any HR account. Ask admin to register it.",
      );
      return;
    }

    const createdByHRId = hrUser?._id?.toString() || fallbackHRId;

    try {
      if (
        upper === "/HELP" ||
        upper === "HELP" ||
        upper === "/START" ||
        upper === "?"
      ) {
        await handleHelp(chatId);
      } else if (
        upper.startsWith("LIST JOBS") ||
        upper.startsWith("/LIST") ||
        upper.startsWith("/JOBS")
      ) {
        await handleListJobs(chatId, createdByHRId);
      } else if (
        upper.startsWith("ADD PIPELINE") ||
        upper.startsWith("/ADD_PIPELINE")
      ) {
        await handleAddPipeline(
          chatId,
          rawText.replace(/^\/add_pipeline\s*/i, "ADD PIPELINE "),
        );
      } else if (
        upper.startsWith("SCHEDULE") ||
        upper.startsWith("/SCHEDULE")
      ) {
        await handleSchedule(
          chatId,
          rawText.replace(/^\/schedule\s*/i, "SCHEDULE "),
        );
      } else if (upper.startsWith("STATUS") || upper.startsWith("/STATUS")) {
        await handleStatus(chatId, rawText.replace(/^\/status\s*/i, "STATUS "));
      } else if (
        upper.startsWith("SHORTLIST") ||
        upper.startsWith("/SHORTLIST")
      ) {
        await handleShortlist(
          chatId,
          rawText.replace(/^\/shortlist\s*/i, "SHORTLIST "),
        );
      } else if (
        upper.startsWith(TRIGGER_KEYWORD) ||
        upper.startsWith("/CREATE_JOB") ||
        upper.startsWith("/CREATEJOB")
      ) {
        const command = rawText
          .replace(/^\/create_?job\s*/i, "")
          .replace(new RegExp(`^${TRIGGER_KEYWORD}\\s*`, "i"), "")
          .trim();
        if (!command) {
          await sendTelegramReply(
            chatId,
            `Describe the job after the command.\n` +
              `Example: *CREATE JOB* Senior React Eng, deadline April 30, top 5, skills: React TS\n\n` +
              `Send /help to see all commands.`,
          );
          return;
        }
        const { summary } = await handleWhatsAppJobCommand(
          command,
          createdByHRId,
        );
        await sendTelegramReply(chatId, summary);
      } else {
        await sendTelegramReply(
          chatId,
          `❓ Unknown command. Send /help to see all options.`,
        );
      }
    } catch (cmdErr) {
      console.error("[Telegram] Command error:", cmdErr.message);
      await sendTelegramReply(
        chatId,
        `❌ Error: ${cmdErr.message}\n\nSend /help for usage guide.`,
      );
    }
  } catch (err) {
    console.error("[Telegram] Webhook processing error:", err);
  }
});

// ── POST /api/telegram/setup — Register webhook with Telegram ────
router.post("/setup", async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = req.body.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL;

  if (!botToken) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  }
  if (!webhookUrl) {
    return res
      .status(400)
      .json({
        error: "Provide webhookUrl in body or set TELEGRAM_WEBHOOK_URL env var",
      });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `${webhookUrl}/api/telegram/webhook` }),
      },
    );
    const data = await response.json();

    if (data.ok) {
      console.log(
        "[Telegram] Webhook registered successfully:",
        data.description,
      );
      res.json({ success: true, description: data.description });
    } else {
      console.error(
        "[Telegram] Webhook registration failed:",
        data.description,
      );
      res.status(400).json({ error: data.description });
    }
  } catch (err) {
    console.error("[Telegram] Setup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/telegram/status — Check webhook status ──────────────
router.get("/status", async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    );
    const data = await response.json();
    res.json(data.result || data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
