import express from "express";
import { authenticateCandidate } from "../../middleware/auth.js";
import Interview from "../../models/Interview.model.js";

const router = express.Router();

/**
 * POST /api/interview/token
 * Generate a LiveKit room token for the candidate.
 * Creates or retrieves the Interview record.
 */
router.post("/token", authenticateCandidate, async (req, res) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.candidate.id;

    if (!jobId) {
      return res.status(400).json({ error: "jobId is required" });
    }

    const livekitRoomId = `interview_${candidateId}_${jobId}`;

    // Create or retrieve the interview record
    const interview = await Interview.findOneAndUpdate(
      { candidateId, jobId, status: "Scheduled" },
      { status: "InProgress", livekitRoomId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Dynamic import for livekit-server-sdk (optional dep)
    let token;
    try {
      const { AccessToken } = await import("livekit-server-sdk");

      const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
          identity: candidateId.toString(),
          metadata: JSON.stringify({
            jobId,
            interviewId: interview._id,
          }),
        }
      );
      at.addGrant({
        roomJoin: true,
        room: livekitRoomId,
        canPublish: true,
        canSubscribe: true,
      });

      token = await at.toJwt();
    } catch {
      // LiveKit SDK not installed — return a placeholder for dev
      token = `dev-placeholder-token-${interview._id}`;
      console.warn(
        "livekit-server-sdk not installed — returning placeholder token"
      );
    }

    res.json({
      token,
      roomName: livekitRoomId,
      interviewId: interview._id,
    });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
