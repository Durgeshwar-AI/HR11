import express from "express";
import { authenticateHR } from "../../middleware/auth.js";
import JobRole from "../../models/JobRole.model.js";
import Question from "../../models/Question.model.js";

const router = express.Router();

// ─── Create new job role ─────────────────────────────────────────
router.post("/", authenticateHR, async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      submissionDeadline,
      topN,
      totalRounds,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const jobRole = await JobRole.create({
      title,
      description,
      skills: skills || [],
      createdBy: req.hrUser.id,
      ...(submissionDeadline && {
        submissionDeadline: new Date(submissionDeadline),
      }),
      ...(topN && { topN: Number(topN) }),
      ...(totalRounds !== undefined && { totalRounds: Number(totalRounds) }),
    });

    res.status(201).json(jobRole);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── List all jobs ───────────────────────────────────────────────
router.get("/", authenticateHR, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const jobs = await JobRole.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get single job with questions ───────────────────────────────
router.get("/:id", authenticateHR, async (req, res) => {
  try {
    const job = await JobRole.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!job) return res.status(404).json({ error: "Job not found" });

    const questions = await Question.find({ jobId: job._id }).sort(
      "stepNumber",
    );

    res.json({ ...job.toObject(), questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update job role metadata ────────────────────────────────────
router.put("/:id", authenticateHR, async (req, res) => {
  try {
    const {
      title,
      description,
      skills,
      status,
      submissionDeadline,
      topN,
      totalRounds,
    } = req.body;

    const update = { title, description, skills, status };
    if (submissionDeadline !== undefined)
      update.submissionDeadline = submissionDeadline
        ? new Date(submissionDeadline)
        : null;
    if (topN !== undefined) update.topN = Number(topN);
    if (totalRounds !== undefined) update.totalRounds = Number(totalRounds);

    const job = await JobRole.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Archive (delete) job role ───────────────────────────────────
router.delete("/:id", authenticateHR, async (req, res) => {
  try {
    const job = await JobRole.findByIdAndUpdate(
      req.params.id,
      { status: "Closed" },
      { new: true },
    );
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Job archived", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
