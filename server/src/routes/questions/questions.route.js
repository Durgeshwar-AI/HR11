import express from "express";
import { authenticateHR } from "../../middleware/auth.js";
import Question from "../../models/Question.model.js";
import JobRole from "../../models/JobRole.model.js";

const router = express.Router();

/**
 * Helper: recompute totalSteps on the parent JobRole.
 */
async function updateTotalSteps(jobId) {
  const count = await Question.countDocuments({ jobId });
  await JobRole.findByIdAndUpdate(jobId, { totalSteps: count });
}

// ─── Add question to a job's path ────────────────────────────────
router.post("/:jobId/questions", authenticateHR, async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      text,
      level,
      enableHint,
      hintText,
      hintTriggerSeconds,
      keyConceptsExpected,
      maxScore,
      allowFollowUp,
      followUpPrompt,
    } = req.body;

    if (!text || !level) {
      return res.status(400).json({ error: "text and level are required" });
    }

    // Auto-assign next stepNumber
    const lastQuestion = await Question.findOne({ jobId }).sort("-stepNumber");
    const stepNumber = lastQuestion ? lastQuestion.stepNumber + 1 : 1;

    const question = await Question.create({
      jobId,
      stepNumber,
      text,
      level,
      enableHint: enableHint || false,
      hintText,
      hintTriggerSeconds: hintTriggerSeconds || 8,
      keyConceptsExpected: keyConceptsExpected || [],
      maxScore: maxScore || 10,
      allowFollowUp: allowFollowUp !== undefined ? allowFollowUp : true,
      followUpPrompt,
    });

    await updateTotalSteps(jobId);
    res.status(201).json(question);
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get all questions for a job ─────────────────────────────────
router.get("/:jobId/questions", authenticateHR, async (req, res) => {
  try {
    const questions = await Question.find({ jobId: req.params.jobId }).sort(
      "stepNumber"
    );
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Edit a question ─────────────────────────────────────────────
router.put("/:jobId/questions/:id", authenticateHR, async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, jobId: req.params.jobId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete a question ───────────────────────────────────────────
router.delete("/:jobId/questions/:id", authenticateHR, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      jobId: req.params.jobId,
    });

    if (!question) return res.status(404).json({ error: "Question not found" });

    await updateTotalSteps(req.params.jobId);
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reorder steps ───────────────────────────────────────────────
// Body: { orderedIds: ["id1", "id2", "id3", ...] }
router.put("/:jobId/reorder", authenticateHR, async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: "orderedIds array is required" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, jobId: req.params.jobId },
        update: { stepNumber: index + 1 },
      },
    }));

    await Question.bulkWrite(bulkOps);

    const questions = await Question.find({ jobId: req.params.jobId }).sort(
      "stepNumber"
    );
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
