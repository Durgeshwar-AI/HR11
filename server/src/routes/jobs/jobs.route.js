import express from "express";
import { authenticateHR } from "../../middleware/auth.js";
import JobRole, { STAGE_TYPES } from "../../models/JobRole.model.js";
import Question from "../../models/Question.model.js";

const router = express.Router();

/**
 * Normalise the pipeline array received from client, ensuring each stage
 * has the required fields and a sequential order value.
 */
function normalisePipeline(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .filter((s) => STAGE_TYPES.includes(s.stageType || s.id))
    .map((s, idx) => ({
      stageType: s.stageType || s.id,
      stageName: s.stageName || s.label || null,
      order: s.order ?? idx + 1,
      difficulty: s.difficulty || "Medium",
      thresholdScore: s.thresholdScore ?? 60,
      daysAfterPrev: s.daysAfterPrev ?? 3,
      scheduledDate: s.scheduledDate ? new Date(s.scheduledDate) : null,
    }));
}

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
      pipeline,
      schedulingStartDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const normPipeline = normalisePipeline(pipeline);
    const computedTotalRounds =
      normPipeline.length > 0
        ? normPipeline.length
        : totalRounds !== undefined
          ? Number(totalRounds)
          : 2;

    const jobRole = await JobRole.create({
      title,
      description,
      skills: skills || [],
      createdBy: req.hrUser.id,
      pipeline: normPipeline,
      totalRounds: computedTotalRounds,
      ...(submissionDeadline && {
        submissionDeadline: new Date(submissionDeadline),
      }),
      ...(schedulingStartDate && {
        schedulingStartDate: new Date(schedulingStartDate),
      }),
      ...(topN && { topN: Number(topN) }),
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
    const filter = { createdBy: req.hrUser.id };
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
      pipeline,
      schedulingStartDate,
    } = req.body;

    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (skills !== undefined) update.skills = skills;
    if (status !== undefined) update.status = status;

    if (submissionDeadline !== undefined)
      update.submissionDeadline = submissionDeadline
        ? new Date(submissionDeadline)
        : null;

    if (schedulingStartDate !== undefined)
      update.schedulingStartDate = schedulingStartDate
        ? new Date(schedulingStartDate)
        : null;

    if (topN !== undefined) update.topN = Number(topN);

    if (pipeline !== undefined) {
      const normPipeline = normalisePipeline(pipeline);
      update.pipeline = normPipeline;
      update.totalRounds =
        normPipeline.length > 0
          ? normPipeline.length
          : totalRounds !== undefined
            ? Number(totalRounds)
            : undefined;
      // Reset scheduling so dates can be re-computed
      if (normPipeline.length > 0) update.schedulingDone = false;
    } else if (totalRounds !== undefined) {
      update.totalRounds = Number(totalRounds);
    }

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

// ─── Get pipeline stages & their scheduled dates ─────────────────
router.get("/:id/pipeline", authenticateHR, async (req, res) => {
  try {
    const job = await JobRole.findById(req.params.id).select(
      "title pipeline totalRounds schedulingStartDate schedulingDone submissionDeadline",
    );
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({
      pipeline: job.pipeline,
      totalRounds: job.totalRounds,
      schedulingDone: job.schedulingDone,
      schedulingStartDate: job.schedulingStartDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trigger automatic date scheduling for a job's pipeline ──────
router.post("/:id/schedule", authenticateHR, async (req, res) => {
  try {
    const { startDate } = req.body; // ISO date string; defaults to tomorrow
    const job = await JobRole.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!job.pipeline?.length)
      return res
        .status(400)
        .json({ error: "No pipeline stages defined for this job" });

    const { autoSchedulePipeline } =
      await import("../../services/pipelineScheduler.service.js");
    const updated = await autoSchedulePipeline(
      job,
      startDate ? new Date(startDate) : null,
    );
    res.json({ message: "Pipeline scheduled", pipeline: updated.pipeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
