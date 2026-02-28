import express from "express";
import HRUser from "../../models/HRUser.model.js";
import JobRole, { STAGE_TYPES } from "../../models/JobRole.model.js";
import InterviewProgress from "../../models/InterviewProgress.model.js";
import ScreeningCandidate from "../../models/candidate.screening.model.js";
import { handleWhatsAppJobCommand } from "../../services/whatsappJobCreator.service.js";
import { autoSchedulePipeline, processFailedCandidates } from "../../services/pipelineScheduler.service.js";

const router = express.Router();

// ─── Prefix trigger keyword ──────────────────────────────────────
const TRIGGER_KEYWORD = (process.env.WA_TRIGGER_KEYWORD || "CREATE JOB").toUpperCase();

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
 * Send a WhatsApp text reply via Meta Cloud API.
 */
async function sendWhatsAppReply(to, text) {
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const accessToken = process.env.WA_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp] WA_PHONE_NUMBER_ID or WA_ACCESS_TOKEN not set — reply skipped");
    return;
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] Failed to send reply:", err);
  }
}

// ── Command handlers ─────────────────────────────────────────────

async function handleHelp(from) {
  await sendWhatsAppReply(
    from,
    `🤖 *AgenticHire Commands*\n\n` +
    `📋 *CREATE JOB* <description>\n` +
    `   AI parses title, skills, deadline, rounds.\n` +
    `   _Ex: CREATE JOB Senior React Eng, deadline April 30, top 5_\n\n` +
    `🔧 *ADD PIPELINE* <job_id> stages: <s1, s2, ...>\n` +
    `   Stages (repeats allowed): resume, aptitude, coding, ai, technical, custom\n` +
    `   _Ex: ADD PIPELINE 663abc stages: resume, aptitude, technical, technical_\n\n` +
    `📅 *SCHEDULE* <job_id>\n` +
    `   Auto-assigns dates to each stage from the deadline onwards.\n` +
    `   _Ex: SCHEDULE 663abc_\n\n` +
    `📊 *STATUS* <job_id>\n` +
    `   Shows pipeline, dates, and per-stage candidate counts.\n` +
    `   _Ex: STATUS 663abc_\n\n` +
    `✅ *SHORTLIST* <job_id> stage <n>\n` +
    `   Removes candidates who failed stage N; survivors advance.\n` +
    `   _Ex: SHORTLIST 663abc stage 2_\n\n` +
    `❓ *HELP* — shows this menu`,
  );
}

async function handleAddPipeline(from, rawText) {
  const jobMatch = rawText.match(/add\s+pipeline\s+([a-f0-9]{24})/i);
  const stagesMatch = rawText.match(/stages?\s*:\s*(.+)/i);

  if (!jobMatch || !stagesMatch) {
    await sendWhatsAppReply(
      from,
      `❌ Format: *ADD PIPELINE <job_id> stages: resume, aptitude, coding, technical*\n` +
      `Use STATUS <job_id> to get IDs. Send HELP for docs.`,
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
    await sendWhatsAppReply(
      from,
      `❌ No valid stages found. Valid: resume, aptitude, coding, ai, technical, custom`,
    );
    return;
  }

  const job = await JobRole.findById(jobId);
  if (!job) {
    await sendWhatsAppReply(from, `❌ Job ID "${jobId}" not found.`);
    return;
  }

  job.pipeline = pipeline;
  job.totalRounds = pipeline.length;
  job.schedulingDone = false;
  await job.save();

  const list = pipeline
    .map((s, i) => `  ${i + 1}. ${s.stageType.replace(/_/g, " ")}`)
    .join("\n");

  await sendWhatsAppReply(
    from,
    `✅ *Pipeline saved for "${job.title}"*\n\n${list}\n\n` +
    `📅 Next: *SCHEDULE ${job._id}* to auto-assign dates.`,
  );
}

async function handleSchedule(from, rawText) {
  const idMatch = rawText.match(/schedule\s+([a-f0-9]{24})/i);
  if (!idMatch) {
    await sendWhatsAppReply(from, `❌ Format: *SCHEDULE <job_id>*`);
    return;
  }

  const job = await JobRole.findById(idMatch[1]);
  if (!job) {
    await sendWhatsAppReply(from, `❌ Job not found.`);
    return;
  }
  if (!job.pipeline?.length) {
    await sendWhatsAppReply(
      from,
      `❌ No pipeline on "${job.title}".\nRun: *ADD PIPELINE ${job._id} stages: resume, technical* first.`,
    );
    return;
  }

  await autoSchedulePipeline(job, job.submissionDeadline);
  const updated = await JobRole.findById(job._id);

  const lines = updated.pipeline
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const d = s.scheduledDate ? new Date(s.scheduledDate).toDateString() : "TBD";
      const name = s.stageName || s.stageType.replace(/_/g, " ");
      return `  ${s.order}. ${name} → ${d}`;
    })
    .join("\n");

  await sendWhatsAppReply(
    from,
    `📅 *Pipeline scheduled for "${updated.title}"*\n\n${lines}\n\n` +
    `Candidates will be notified when each stage opens.`,
  );
}

async function handleStatus(from, rawText) {
  const idMatch = rawText.match(/status\s+([a-f0-9]{24})/i);
  if (!idMatch) {
    await sendWhatsAppReply(from, `❌ Format: *STATUS <job_id>*`);
    return;
  }

  const job = await JobRole.findById(idMatch[1]);
  if (!job) {
    await sendWhatsAppReply(from, `❌ Job not found.`);
    return;
  }

  const [total, shortlisted, progressRecords] = await Promise.all([
    ScreeningCandidate.countDocuments({ jobId: job._id }),
    ScreeningCandidate.countDocuments({ jobId: job._id, status: "shortlisted" }),
    InterviewProgress.find({ jobId: job._id }),
  ]);

  let pipelineText = "  _(no pipeline defined)_";
  if (job.pipeline?.length) {
    pipelineText = job.pipeline
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const d = s.scheduledDate ? new Date(s.scheduledDate).toDateString() : "Not scheduled";
        const name = s.stageName || s.stageType.replace(/_/g, " ");
        const active = progressRecords.filter((p) =>
          p.rounds.find((r) => r.roundNumber === s.order && r.status === "InProgress"),
        ).length;
        const done = progressRecords.filter((p) =>
          p.rounds.find((r) => r.roundNumber === s.order && r.status === "Completed"),
        ).length;
        return `  ${s.order}. ${name}\n     📅 ${d} | 🔵 ${active} active | ✅ ${done} done`;
      })
      .join("\n");
  }

  await sendWhatsAppReply(
    from,
    `📊 *${job.title}*\n` +
    `ID: ${job._id}\n` +
    `Status: ${job.status} | Deadline: ${job.submissionDeadline ? new Date(job.submissionDeadline).toDateString() : "None"}\n` +
    `Applicants: ${total} | Shortlisted: ${shortlisted}\n\n` +
    `*Pipeline:*\n${pipelineText}`,
  );
}

async function handleShortlist(from, rawText) {
  const match = rawText.match(/shortlist\s+([a-f0-9]{24})\s+stage\s+(\d+)/i);
  if (!match) {
    await sendWhatsAppReply(from, `❌ Format: *SHORTLIST <job_id> stage <number>*`);
    return;
  }

  const result = await processFailedCandidates(match[1], parseInt(match[2], 10));
  await sendWhatsAppReply(
    from,
    `✅ Stage ${match[2]} shortlisting complete.\n` +
    `${result?.rejected ?? 0} candidate(s) eliminated (score below threshold).\n` +
    `Passing candidates advance to the next round.`,
  );
}

// ── GET /api/whatsapp/webhook — Meta verification handshake ──────
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  res.status(403).json({ error: "Verification failed" });
});

// ── POST /api/whatsapp/webhook ────────────────────────────────────
router.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Meta requires 200 within 5 s

  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;

    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages) return;

    for (const message of messages) {
      if (message.type !== "text") continue;

      const from = message.from;
      const rawText = message.text?.body?.trim() || "";
      const upper = rawText.toUpperCase();

      // Resolve HR user
      const hrUser = await HRUser.findOne({ whatsappPhone: from });
      const fallbackHRId = process.env.WA_DEFAULT_HR_ID;

      if (!hrUser && !fallbackHRId) {
        await sendWhatsAppReply(
          from,
          "❌ Your WhatsApp number is not linked to any HR account. Ask admin to register it.",
        );
        continue;
      }

      const createdByHRId = hrUser?._id?.toString() || fallbackHRId;

      try {
        if (upper === "HELP" || upper === "?") {
          await handleHelp(from);
        } else if (upper.startsWith("ADD PIPELINE")) {
          await handleAddPipeline(from, rawText);
        } else if (upper.startsWith("SCHEDULE")) {
          await handleSchedule(from, rawText);
        } else if (upper.startsWith("STATUS")) {
          await handleStatus(from, rawText);
        } else if (upper.startsWith("SHORTLIST")) {
          await handleShortlist(from, rawText);
        } else if (upper.startsWith(TRIGGER_KEYWORD)) {
          const command = rawText.slice(TRIGGER_KEYWORD.length).trim();
          if (!command) {
            await sendWhatsAppReply(
              from,
              `Describe the job after the keyword.\n` +
              `Example: *${TRIGGER_KEYWORD}* Senior React Eng, deadline April 30, top 5, skills: React TS\n\n` +
              `Send *HELP* to see all commands.`,
            );
            continue;
          }
          const { summary } = await handleWhatsAppJobCommand(command, createdByHRId);
          await sendWhatsAppReply(
            from,
            summary +
            `\n\n📌 Tip: *ADD PIPELINE <job_id> stages: resume, aptitude, technical*`,
          );
        } else {
          await sendWhatsAppReply(from, `❓ Unknown command. Send *HELP* to see all options.`);
        }
      } catch (cmdErr) {
        console.error("[WhatsApp] Command error:", cmdErr.message);
        await sendWhatsAppReply(from, `❌ Error: ${cmdErr.message}\n\nSend *HELP* for usage guide.`);
      }
    }
  } catch (err) {
    console.error("[WhatsApp] Webhook processing error:", err);
  }
});



/**
 * Send a WhatsApp text reply via Meta Cloud API.
 */
// async function sendWhatsAppReply(to, text) {
//   const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
//   const accessToken = process.env.WA_ACCESS_TOKEN;

//   if (!phoneNumberId || !accessToken) {
//     console.warn("[WhatsApp] WA_PHONE_NUMBER_ID or WA_ACCESS_TOKEN not set — reply skipped");
//     return;
//   }

//   const res = await fetch(
//     `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to,
//         type: "text",
//         text: { body: text },
//       }),
//     },
//   );

//   if (!res.ok) {
//     const err = await res.text();
//     console.error("[WhatsApp] Failed to send reply:", err);
//   }
// }

/**
 * GET /api/whatsapp/webhook
 * Meta webhook verification handshake.
 * Meta sends hub.mode, hub.verify_token, hub.challenge as query params.
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WA_VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  res.status(403).json({ error: "Verification failed" });
});

/**
 * POST /api/whatsapp/webhook
 * Receives incoming WhatsApp messages from Meta Cloud API.
 * Only processes messages that start with the trigger keyword.
 */
router.post("/webhook", async (req, res) => {
  // Acknowledge immediately — Meta requires a 200 within 5 s
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validate this is a WhatsApp message event
    if (body.object !== "whatsapp_business_account") return;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages) return;

    for (const message of value.messages) {
      if (message.type !== "text") continue;

      const from = message.from; // sender's phone number (E.164, no +)
      const rawText = message.text?.body?.trim() || "";
      const upperText = rawText.toUpperCase();

      // Only act on trigger keyword messages
      if (!upperText.startsWith(TRIGGER_KEYWORD)) continue;

      // Strip the keyword prefix to get the actual command
      const command = rawText.slice(TRIGGER_KEYWORD.length).trim();
      if (!command) {
        await sendWhatsAppReply(
          from,
          `Please describe the job after the keyword. Example:\n*${TRIGGER_KEYWORD}* Senior React Engineer, remote, skills: React TypeScript, deadline March 30, top 5 candidates, 2 interview rounds`,
        );
        continue;
      }

      console.log(`[WhatsApp] Job command from ${from}: ${command}`);

      // Resolve the HR user by their registered WhatsApp phone
      let hrUser = await HRUser.findOne({ whatsappPhone: from });

      // Fallback: use the configured default admin HR ID
      const fallbackHRId = process.env.WA_DEFAULT_HR_ID;

      if (!hrUser && !fallbackHRId) {
        await sendWhatsAppReply(
          from,
          "❌ Your WhatsApp number is not linked to any HR account. Please ask your admin to register your number.",
        );
        continue;
      }

      const createdByHRId = hrUser?._id?.toString() || fallbackHRId;

      try {
        const { summary } = await handleWhatsAppJobCommand(command, createdByHRId);
        await sendWhatsAppReply(from, summary);
      } catch (parseErr) {
        console.error("[WhatsApp] Job creation error:", parseErr.message);
        await sendWhatsAppReply(
          from,
          `❌ Could not create job: ${parseErr.message}\n\nPlease try again with more detail, e.g.:\n*${TRIGGER_KEYWORD}* Senior React Engineer, remote, deadline April 30`,
        );
      }
    }
  } catch (err) {
    console.error("[WhatsApp] Webhook processing error:", err);
  }
});

export default router;
