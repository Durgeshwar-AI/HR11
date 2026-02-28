import nodemailer from "nodemailer";

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
    from: process.env.MAIL_FROM || "AgenticHire <noreply@agentichire.com>",
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
        <p style="margin:0;">Warm regards,<br /><strong>The AgenticHire Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export { sendRejectionEmail };
