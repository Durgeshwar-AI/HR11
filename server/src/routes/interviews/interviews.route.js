import express from "express";
import { authenticateHR, authenticateCandidate } from "../../middleware/auth.js";
import Interview from "../../models/Interview.model.js";
import JobRole from "../../models/JobRole.model.js";
import InterviewProgress from "../../models/InterviewProgress.model.js";
import { callGeminiStandard } from "../../services/geminiService.js";
import { processFailedCandidates } from "../../services/pipelineScheduler.service.js";
import { buildRankingPrompt } from "../../services/promptTemplates.js";
import { sendAssessmentLinkEmail } from "../../services/mail.services.js";
import { buildAssessmentLink } from "../../utils/assessmentLinks.js";

const router = express.Router();


router.get("/result/:interviewId", authenticateCandidate, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const candidateId = req.candidate.id;
 
    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({ error: "Invalid interviewId" });
    }
 
    const interview = await Interview.findOne({
      _id: interviewId,
      candidateId, // ← ensures candidate can only see their own interview
    }).select(
      "status overallScore technicalAccuracy communicationScore hintRelianceScore " +
      "questionBreakdown strengths weaknesses completedAt evaluatedAt"
    );
 
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
 
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
        ranking: {
          leaderboard: sorted,
          doNotProceed: [],
          recommendedTopCandidate: sorted[0]?.candidateId,
        },
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

// ─── Pipeline progress — all candidates for a job ─────────────────
router.get(
  "/job/:jobId/pipeline-progress",
  authenticateHR,
  async (req, res) => {
    try {
      const progress = await InterviewProgress.find({ jobId: req.params.jobId })
        .sort({ rank: 1 })
        .lean();

      const job = await JobRole.findById(req.params.jobId).select(
        "title pipeline totalRounds schedulingDone",
      );

      res.json({ progress, pipeline: job?.pipeline ?? [], job });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── Single candidate pipeline progress ──────────────────────────
router.get(
  "/progress/:candidateId/job/:jobId",
  authenticateHR,
  async (req, res) => {
    try {
      const progress = await InterviewProgress.findOne({
        candidateId: req.params.candidateId,
        jobId: req.params.jobId,
      });
      if (!progress)
        return res.status(404).json({ error: "Progress record not found" });
      res.json(progress);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── Manually trigger shortlisting for a pipeline stage ──────────
router.post("/job/:jobId/shortlist-stage", authenticateHR, async (req, res) => {
  try {
    const { roundNumber } = req.body;
    if (!roundNumber)
      return res.status(400).json({ error: "roundNumber is required" });

    const result = await processFailedCandidates(
      req.params.jobId,
      Number(roundNumber),
    );
    res.json({ message: "Shortlisting complete", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send assessment links to ALL eligible candidates for a round ─
// POST /api/interviews/job/:jobId/send-assessment-links
// Body: { roundNumber: 2, customMessage?: "Please complete within 24h" }
router.post(
  "/job/:jobId/send-assessment-links",
  authenticateHR,
  async (req, res) => {
    try {
      const { roundNumber, customMessage } = req.body;
      const { jobId } = req.params;

      if (!roundNumber) {
        return res.status(400).json({ error: "roundNumber is required" });
      }

      const job = await JobRole.findById(jobId);
      if (!job) return res.status(404).json({ error: "Job not found" });

      const stage = job.pipeline?.find((s) => s.order === Number(roundNumber));
      if (!stage) {
        return res
          .status(404)
          .json({ error: `No pipeline stage with order=${roundNumber}` });
      }

      // Check that this stageType supports links
      const testLink = buildAssessmentLink({
        stageType: stage.stageType,
        jobId,
        candidateId: "test",
      });
      if (!testLink) {
        return res.status(400).json({
          error: `Stage type "${stage.stageType}" does not have an associated assessment page`,
        });
      }

      // Find all candidates in this job whose round is Pending or InProgress
      const progressRecords = await InterviewProgress.find({
        jobId,
        rounds: {
          $elemMatch: {
            roundNumber: Number(roundNumber),
            status: { $in: ["Pending", "InProgress"] },
          },
        },
      });

      if (progressRecords.length === 0) {
        return res.json({
          message: "No eligible candidates found for this round",
          sent: 0,
          failed: 0,
        });
      }

      const results = await Promise.allSettled(
        progressRecords.map((progress) =>
          sendAssessmentLinkEmail({
            to: progress.candidateEmail,
            name: progress.candidateName,
            jobTitle: job.title,
            jobId,
            candidateId: progress.candidateId.toString(),
            stage,
            customMessage,
          }),
        ),
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Mark that the round is now InProgress for candidates who were Pending
      await Promise.all(
        progressRecords.map(async (progress) => {
          const roundIdx = progress.rounds.findIndex(
            (r) => r.roundNumber === Number(roundNumber),
          );
          if (
            roundIdx !== -1 &&
            progress.rounds[roundIdx].status === "Pending"
          ) {
            progress.rounds[roundIdx].status = "InProgress";
            if (progress.status === "Pending") progress.status = "InProgress";
            await progress.save();
          }
        }),
      );

      console.log(
        `[AssessmentLinks] Job "${job.title}" round ${roundNumber} — sent ${sent}, failed ${failed}`,
      );

      res.json({
        message: `Assessment links sent for round ${roundNumber}`,
        sent,
        failed,
        total: progressRecords.length,
      });
    } catch (err) {
      console.error("Send assessment links error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── Send assessment link to a SINGLE candidate for a round ──────
// POST /api/interviews/job/:jobId/send-assessment-link/:candidateId
// Body: { roundNumber: 2, customMessage?: "..." }
router.post(
  "/job/:jobId/send-assessment-link/:candidateId",
  authenticateHR,
  async (req, res) => {
    try {
      const { roundNumber, customMessage } = req.body;
      const { jobId, candidateId } = req.params;

      if (!roundNumber) {
        return res.status(400).json({ error: "roundNumber is required" });
      }

      const job = await JobRole.findById(jobId);
      if (!job) return res.status(404).json({ error: "Job not found" });

      const stage = job.pipeline?.find((s) => s.order === Number(roundNumber));
      if (!stage) {
        return res
          .status(404)
          .json({ error: `No pipeline stage with order=${roundNumber}` });
      }

      const progress = await InterviewProgress.findOne({ jobId, candidateId });
      if (!progress) {
        return res
          .status(404)
          .json({ error: "Candidate progress record not found" });
      }

      const round = progress.rounds.find(
        (r) => r.roundNumber === Number(roundNumber),
      );
      if (!round) {
        return res
          .status(404)
          .json({ error: "Round not found in candidate progress" });
      }

      if (round.status === "Completed") {
        return res
          .status(400)
          .json({ error: "Candidate has already completed this round" });
      }

      await sendAssessmentLinkEmail({
        to: progress.candidateEmail,
        name: progress.candidateName,
        jobTitle: job.title,
        jobId,
        candidateId,
        stage,
        customMessage,
      });

      // Mark the round InProgress if it was Pending
      if (round.status === "Pending") {
        const roundIdx = progress.rounds.findIndex(
          (r) => r.roundNumber === Number(roundNumber),
        );
        progress.rounds[roundIdx].status = "InProgress";
        if (progress.status === "Pending") progress.status = "InProgress";
        await progress.save();
      }

      console.log(
        `[AssessmentLinks] Sent to ${progress.candidateEmail} for job "${job.title}" round ${roundNumber}`,
      );

      res.json({
        message: `Assessment link sent to ${progress.candidateEmail}`,
        assessmentLink: buildAssessmentLink({
          stageType: stage.stageType,
          jobId,
          candidateId,
          roundNumber: stage.order,
        }),
      });
    } catch (err) {
      console.error("Send single assessment link error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
