import express from "express";
import HRUser from "../../models/HRUser.model.js";
import { handleWhatsAppJobCommand } from "../../services/whatsappJobCreator.service.js";

const router = express.Router();

// ─── Prefix trigger keyword (HR must start messages with this) ───
const TRIGGER_KEYWORD = (process.env.WA_TRIGGER_KEYWORD || "CREATE JOB").toUpperCase();

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
