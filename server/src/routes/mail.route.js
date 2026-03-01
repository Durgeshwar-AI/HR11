import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    let { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        error: "to, subject and (text or html) are required",
      });
    }

    // Convert to array if string
    if (typeof to === "string") {
      to = to.split(",").map(email => email.trim());
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use App Password
      },
    });

    const mailOptions = {
      from: `"HR Team" <${process.env.SMTP_USER}>`,
      to: to, // can be array
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;