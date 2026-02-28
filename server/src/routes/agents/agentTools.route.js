import express from "express";
import { authenticateAgent } from "../../middleware/auth.js";
import Candidate from "../../models/Candidate.model.js";
import Question from "../../models/Question.model.js";
import Interview from "../../models/Interview.model.js";
import { processEvaluation } from "../../workers/evaluationWorker.js";

const router = express.Router();

/**
 * GET /api/agent/candidate/:id
 * Returns candidate name + resume summary for the agent.
 */
router.get("/candidate/:id", authenticateAgent, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select(
      "name email resumeSummary"
    );
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      name: candidate.name,
      email: candidate.email,
      resumeSummary: candidate.resumeSummary || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/agent/question/:jobId/:step
 * Returns the question at the given step number.
 * Returns { question: null } when all questions are done.
 */
router.get("/question/:jobId/:step", authenticateAgent, async (req, res) => {
  try {
    const { jobId, step } = req.params;
    const stepNumber = parseInt(step, 10) + 1; // incoming step is 0-indexed

    const question = await Question.findOne({ jobId, stepNumber });

    if (!question) {
      return res.json({ question: null }); // All questions done
    }

    res.json({
      question: {
        id: question._id,
        stepNumber: question.stepNumber,
        text: question.text,
        level: question.level,
        enableHint: question.enableHint,
        hintText: question.hintText,
        hintTriggerSeconds: question.hintTriggerSeconds,
        keyConceptsExpected: question.keyConceptsExpected,
        maxScore: question.maxScore,
        allowFollowUp: question.allowFollowUp,
        followUpPrompt: question.followUpPrompt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/agent/conclude
 * Saves transcript, enqueues evaluation job.
 */
router.post("/conclude", authenticateAgent, async (req, res) => {
  try {
    const { interviewId, fullTranscript, hintsUsed } = req.body;

    if (!interviewId || !fullTranscript) {
      return res
        .status(400)
        .json({ error: "interviewId and fullTranscript are required" });
    }

    await Interview.findByIdAndUpdate(interviewId, {
      transcript: fullTranscript,
      hintsUsed: hintsUsed || [],
      status: "Completed",
      completedAt: new Date(),
    });

    // Fire-and-forget evaluation (runs in-process, no Redis needed)
    processEvaluation(interviewId).catch((err) =>
      console.error(`[evaluationWorker] Error evaluating ${interviewId}:`, err.message)
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Conclude interview error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
