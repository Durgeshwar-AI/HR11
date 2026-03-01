import express from "express";
import { authenticateCandidate } from "../../middleware/auth.js";
import { upload, uploadToCloudinary } from "../../config/cloudinary.js";
import Candidate from "../../models/Candidate.model.js";
import JobRole from "../../models/JobRole.model.js";
import InterviewProgress from "../../models/InterviewProgress.model.js";
import ScreeningCandidate from "../../models/candidate.screening.model.js";

const router = express.Router();

// ─── Public: List job openings (no auth needed) ─────────────────
router.get("/jobs/active", async (_req, res) => {
  try {
    const jobs = await JobRole.find({ status: { $regex: /^(active|draft)$/i } })
      .populate("createdBy", "name company")
      .select("title description skills status pipeline totalRounds createdAt submissionDeadline")
      .sort({ createdAt: -1 });

    const result = jobs.map((j) => {
      const obj = j.toObject();
      return {
        id: obj._id,
        title: obj.title,
        description: obj.description || "",
        skills: obj.skills || [],
        company: obj.createdBy?.company || obj.createdBy?.name || "Company",
        totalRounds: obj.totalRounds || 0,
        pipeline: (obj.pipeline || []).map((s) => s.stageType),
        deadline: obj.submissionDeadline || null,
        createdAt: obj.createdAt,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Active jobs error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Candidate profile (/me) ─────────────────────────────────────
router.get("/me", authenticateCandidate, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate.id)
      .populate("appliedJobs", "title description skills status totalRounds");

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || "",
      skills: candidate.skills || [],
      resumeUrl: candidate.resumeUrl || "",
      resumeSummary: candidate.resumeSummary || null,
      appliedJobs: candidate.appliedJobs || [],
      createdAt: candidate.createdAt,
    });
  } catch (err) {
    console.error("Candidate /me error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Update candidate profile ────────────────────────────────────
router.put("/me", authenticateCandidate, async (req, res) => {
  try {
    const { name, phone, skills } = req.body;
    const update = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof phone === "string") update.phone = phone.trim();
    if (Array.isArray(skills)) update.skills = skills.map(String).slice(0, 15);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.candidate.id,
      { $set: update },
      { new: true }
    ).populate("appliedJobs", "title description skills status totalRounds");

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || "",
      skills: candidate.skills || [],
      resumeUrl: candidate.resumeUrl || "",
      resumeSummary: candidate.resumeSummary || null,
      appliedJobs: candidate.appliedJobs || [],
      createdAt: candidate.createdAt,
    });
  } catch (err) {
    console.error("Candidate update /me error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Upload / replace resume ─────────────────────────────────────
router.post(
  "/me/resume",
  authenticateCandidate,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Resume file is required" });
      }

      // Upload buffer to Cloudinary
      const cloudResult = await uploadToCloudinary(req.file);

      const candidate = await Candidate.findByIdAndUpdate(
        req.candidate.id,
        { $set: { resumeUrl: cloudResult.url } },
        { new: true }
      );

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      res.json({
        resumeUrl: candidate.resumeUrl,
        message: "Resume uploaded successfully",
      });
    } catch (err) {
      console.error("Resume upload error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── Get my application progress for a job ───────────────────────
router.get(
  "/my-progress/:jobId",
  authenticateCandidate,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const candidateEmail = req.candidate.email;

      // InterviewProgress links to ScreeningCandidate, not InterviewCandidate.
      // Look up the screening candidate by email, then find progress.
      const screeningCandidate = await ScreeningCandidate.findOne({
        email: candidateEmail,
        jobId,
      });

      if (!screeningCandidate) {
        return res.json({ progress: null });
      }

      const progress = await InterviewProgress.findOne({
        jobId,
        candidateId: screeningCandidate._id,
      }).populate("jobId", "title description skills pipeline totalRounds status");

      res.json({ progress: progress || null });
    } catch (err) {
      console.error("My progress error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ─── Get all my applications across all jobs ─────────────────────
router.get(
  "/my-applications",
  authenticateCandidate,
  async (req, res) => {
    try {
      const candidateEmail = req.candidate.email;

      // Find all screening records for this email
      const screeningRecords = await ScreeningCandidate.find({
        email: candidateEmail,
      }).select("jobId name email screeningResults status createdAt");

      if (!screeningRecords.length) {
        return res.json({ applications: [] });
      }

      // Get progress records for each
      const applications = await Promise.all(
        screeningRecords.map(async (sc) => {
          const job = await JobRole.findById(sc.jobId).select(
            "title description skills status pipeline totalRounds"
          );

          const progress = await InterviewProgress.findOne({
            jobId: sc.jobId,
            candidateId: sc._id,
          });

          const screenResult = sc.screeningResults?.[0] || null;

          return {
            jobId: sc.jobId,
            jobTitle: job?.title || "Unknown",
            jobDescription: job?.description || "",
            jobSkills: job?.skills || [],
            jobStatus: job?.status || "Unknown",
            totalRounds: job?.totalRounds || 0,
            pipeline: (job?.pipeline || []).map((s) => ({
              stageType: s.stageType,
              stageName: s.stageName,
              order: s.order,
            })),
            screeningScore: screenResult?.score ?? null,
            screeningStatus: sc.status,
            appliedAt: sc.createdAt,
            progress: progress
              ? {
                  status: progress.status,
                  rounds: progress.rounds,
                  candidateScore: progress.candidateScore,
                  rank: progress.rank,
                }
              : null,
          };
        }),
      );

      res.json({ applications });
    } catch (err) {
      console.error("My applications error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

export default router;
