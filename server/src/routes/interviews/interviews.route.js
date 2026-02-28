import express from "express";
import { authenticateHR } from "../../middleware/auth.js";
import Interview from "../../models/Interview.model.js";
import JobRole from "../../models/JobRole.model.js";
import { callGeminiStandard } from "../../services/geminiService.js";
import {
  buildRankingPrompt,
} from "../../services/promptTemplates.js";

const router = express.Router();

// ─── Get single evaluated interview ──────────────────────────────
router.get("/:id", authenticateHR, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidateId", "name email resumeSummary")
      .populate("jobId", "title description skills");

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── All interviews for a job role ───────────────────────────────
router.get("/job/:jobId", authenticateHR, async (req, res) => {
  try {
    const interviews = await Interview.find({ jobId: req.params.jobId })
      .populate("candidateId", "name email")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leaderboard — ranked candidates for HR ──────────────────────
router.get("/job/:jobId/leaderboard", authenticateHR, async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobRole = await JobRole.findById(jobId);
    if (!jobRole) return res.status(404).json({ error: "Job not found" });

    const interviews = await Interview.find({
      jobId,
      status: "Evaluated",
    }).populate("candidateId", "name email");

    if (interviews.length === 0) {
      return res.json({ ranking: { leaderboard: [] }, raw: [] });
    }

    // If Gemini is not configured, return score-sorted list
    if (!process.env.GEMINI_API_KEY) {
      const sorted = interviews
        .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
        .map((iv, i) => ({
          rank: i + 1,
          candidateId: iv.candidateId._id,
          candidateName: iv.candidateId.name,
          overallScore: iv.overallScore || 0,
          justification: "",
        }));

      return res.json({
        ranking: { leaderboard: sorted, doNotProceed: [], recommendedTopCandidate: sorted[0]?.candidateId },
        raw: interviews,
      });
    }

    const prompt = buildRankingPrompt(interviews, jobRole);
    const result = await callGeminiStandard(prompt);
    const ranking = JSON.parse(result);

    res.json({ ranking, raw: interviews });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
