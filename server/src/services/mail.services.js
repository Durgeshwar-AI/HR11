import nodemailer from "nodemailer";
import {
  buildAssessmentLink,
  STAGE_ICONS as LINK_STAGE_ICONS,
  STAGE_LABELS as LINK_STAGE_LABELS,
} from "../utils/assessmentLinks.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a rejection email to a candidate.
 *
 * @param {string} to        – Candidate email address
 * @param {string} name      – Candidate name
 * @param {string} jobTitle  – Role they applied for
 */
async function sendRejectionEmail(to, name, jobTitle) {
  const mailOptions = {
    from: process.env.MAIL_FROM || "PromptHire <noreply@prompthire.com>",
    to,
    subject: `Application Update — ${jobTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
        <h2 style="margin:0 0 16px;font-size:22px;">Application Update</h2>
        <p>Dear <strong>${name || "Candidate"}</strong>,</p>
        <p>
          Thank you for your interest in the <strong>${jobTitle}</strong> position
          and for taking the time to apply.
        </p>
        <p>
          After a thorough review of all applicants, we have decided to move
          forward with other candidates whose qualifications more closely match
          the requirements of this role.
        </p>
        <p>
          We truly appreciate your effort and encourage you to apply for future
          openings that align with your skills and experience.
        </p>
        <p>We wish you the very best in your career journey.</p>
        <br />
        <p style="margin:0;">Warm regards,<br /><strong>The PromptHire Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export { sendRejectionEmail };

/**
 * Notify a shortlisted candidate about the next pipeline stage and its schedule.
 * Now includes a direct assessment link when available.
 *
 * @param {string} to           – Candidate email
 * @param {string} name         – Candidate name
 * @param {string} jobTitle     – Role title
 * @param {Object} stage        – Pipeline stage object { stageName, stageType, scheduledDate, order }
 * @param {Object} [linkOpts]   – Optional { jobId, candidateId } for assessment link generation
 */
async function sendSchedulingEmail(to, name, jobTitle, stage, linkOpts = {}) {
  if (!to) return;

  const STAGE_ICONS = {
    resume_screening: "📄",
    aptitude_test: "🧠",
    coding_challenge: "💻",
    ai_voice_interview: "🎙️",
    technical_interview: "⚙️",
    custom_round: "🛠️",
  };

  const icon = STAGE_ICONS[stage.stageType] || "📋";
  const stageName =
    stage.stageName ||
    stage.stageType?.replace(/_/g, " ") ||
    `Round ${stage.order}`;
  const dateStr = stage.scheduledDate
    ? new Date(stage.scheduledDate).toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "To be confirmed";

  // Build assessment link if we have enough info
  const assessmentLink =
    linkOpts.jobId && linkOpts.candidateId
      ? buildAssessmentLink({
          stageType: stage.stageType,
          jobId: linkOpts.jobId,
          candidateId: linkOpts.candidateId,
          roundNumber: stage.order,
        })
      : null;

  const ctaBlock = assessmentLink
    ? `
        <div style="text-align:center;margin:24px 0;">
          <a href="${assessmentLink}"
             style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;
                    padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;
                    letter-spacing:0.3px;">
            ${icon} Start ${stageName}
          </a>
          <p style="margin:8px 0 0;font-size:12px;color:#888;">
            Or copy this link: <a href="${assessmentLink}" style="color:#4F46E5;">${assessmentLink}</a>
          </p>
        </div>`
    : `<p>Please ensure you are available at the scheduled time. Further instructions will be shared closer to the date.</p>`;

  const mailOptions = {
    from: process.env.MAIL_FROM || "PromptHire <noreply@prompthire.com>",
    to,
    subject: `${icon} Next Round Scheduled — ${jobTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
        <h2 style="margin:0 0 16px;font-size:22px;">You've Been Shortlisted! 🎉</h2>
        <p>Dear <strong>${name || "Candidate"}</strong>,</p>
        <p>
          Congratulations! You have been shortlisted to proceed to the next round
          for the <strong>${jobTitle}</strong> position.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9f9f9;border-radius:8px;">
          <tr>
            <td style="padding:12px 16px;font-weight:bold;width:40%;">Round</td>
            <td style="padding:12px 16px;">${icon} ${stageName}</td>
          </tr>
          <tr style="background:#fff;">
            <td style="padding:12px 16px;font-weight:bold;">Scheduled On</td>
            <td style="padding:12px 16px;">${dateStr}</td>
          </tr>
        </table>
        ${ctaBlock}
        <p>Good luck!</p>
        <br />
        <p style="margin:0;">Warm regards,<br /><strong>The PromptHire Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Notify a candidate that they have been shortlisted (generic, after auto-reject).
 */
async function sendShortlistEmail(to, name, jobTitle, rank) {
  if (!to) return;

  const mailOptions = {
    from: process.env.MAIL_FROM || "PromptHire <noreply@prompthire.com>",
    to,
    subject: `🎉 You've been shortlisted — ${jobTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
        <h2 style="margin:0 0 16px;font-size:22px;">Congratulations, you're shortlisted! 🎉</h2>
        <p>Dear <strong>${name || "Candidate"}</strong>,</p>
        <p>
          We are pleased to inform you that your application for <strong>${jobTitle}</strong>
          has been reviewed and you have been shortlisted${rank ? ` at rank <strong>#${rank}</strong>` : ""}.
        </p>
        <p>You will receive a separate email with the schedule for your next assessment round shortly.</p>
        <p>Best of luck!</p>
        <br />
        <p style="margin:0;">Warm regards,<br /><strong>The PromptHire Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export {
  sendRejectionEmail as default,
  sendSchedulingEmail,
  sendShortlistEmail,
  sendAssessmentLinkEmail,
};

/**
 * Send a dedicated assessment link email to a single candidate.
 * This is used when HR manually triggers "Send Assessment Links" for a round,
 * or when the pipeline scheduler activates a stage and wants to give a direct link.
 *
 * @param {Object} opts
 * @param {string} opts.to            – Candidate email
 * @param {string} opts.name          – Candidate name
 * @param {string} opts.jobTitle      – Job role title
 * @param {string} opts.jobId         – Job ObjectId
 * @param {string} opts.candidateId   – Candidate ObjectId
 * @param {Object} opts.stage         – { stageType, stageName, order, scheduledDate, thresholdScore }
 * @param {string} [opts.customMessage] – Optional extra text from HR
 * @returns {Promise}
 */
async function sendAssessmentLinkEmail({
  to,
  name,
  jobTitle,
  jobId,
  candidateId,
  stage,
  customMessage,
}) {
  if (!to) return;

  const icon = LINK_STAGE_ICONS[stage.stageType] || "📋";
  const stageName =
    stage.stageName ||
    LINK_STAGE_LABELS[stage.stageType] ||
    `Round ${stage.order}`;

  const dateStr = stage.scheduledDate
    ? new Date(stage.scheduledDate).toLocaleString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const assessmentLink = buildAssessmentLink({
    stageType: stage.stageType,
    jobId,
    candidateId,
    roundNumber: stage.order,
  });

  if (!assessmentLink) {
    console.warn(
      `[Mail] No assessment link available for stageType="${stage.stageType}" — skipping email to ${to}`,
    );
    return;
  }

  const dateRow = dateStr
    ? `<tr style="background:#fff;">
        <td style="padding:12px 16px;font-weight:bold;">Scheduled On</td>
        <td style="padding:12px 16px;">${dateStr}</td>
       </tr>`
    : "";

  const thresholdRow =
    stage.thresholdScore != null
      ? `<tr style="background:#f9f9f9;">
          <td style="padding:12px 16px;font-weight:bold;">Passing Score</td>
          <td style="padding:12px 16px;">${stage.thresholdScore}%</td>
         </tr>`
      : "";

  const customBlock = customMessage
    ? `<div style="background:#FFF8E1;border-left:4px solid #FFC107;padding:12px 16px;margin:16px 0;border-radius:4px;">
        <strong>Note from the hiring team:</strong><br/>${customMessage}
       </div>`
    : "";

  const mailOptions = {
    from: process.env.MAIL_FROM || "PromptHire <noreply@prompthire.com>",
    to,
    subject: `${icon} Your ${stageName} is Ready — ${jobTitle}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
        <h2 style="margin:0 0 16px;font-size:22px;">${icon} Assessment Invitation</h2>
        <p>Dear <strong>${name || "Candidate"}</strong>,</p>
        <p>
          You are invited to take the <strong>${stageName}</strong> assessment
          for the <strong>${jobTitle}</strong> position.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;">
          <tr style="background:#f9f9f9;">
            <td style="padding:12px 16px;font-weight:bold;width:40%;">Assessment</td>
            <td style="padding:12px 16px;">${icon} ${stageName}</td>
          </tr>
          ${dateRow}
          ${thresholdRow}
        </table>

        ${customBlock}

        <div style="text-align:center;margin:28px 0;">
          <a href="${assessmentLink}"
             style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;
                    padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;
                    letter-spacing:0.3px;box-shadow:0 2px 8px rgba(79,70,229,0.3);">
            ${icon} Start Assessment Now
          </a>
        </div>

        <p style="font-size:12px;color:#888;text-align:center;margin:0 0 20px;">
          Or copy this link into your browser:<br/>
          <a href="${assessmentLink}" style="color:#4F46E5;word-break:break-all;">${assessmentLink}</a>
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

        <p style="font-size:13px;color:#666;">
          <strong>Tips:</strong><br/>
          • Use a stable internet connection<br/>
          • Ensure your browser is up to date<br/>
          • Complete the assessment in one sitting if possible
        </p>

        <p>Good luck!</p>
        <br />
        <p style="margin:0;">Warm regards,<br /><strong>The PromptHire Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
