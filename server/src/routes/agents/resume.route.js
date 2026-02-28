import express from "express";
import multer from "multer";
import { screenResume } from "../../services/aiService.services.js";
import Candidate from "../../models/candidate.screening.model.js";

const router = express.Router();
/**
 * POST /api/candidates
 *
 * Submit a candidate with resume + any HR form fields.
 * HR teams can send any form fields they want — all captured in formData.
 *
 * multipart/form-data fields:
 *   - resume (file, required)         — PDF or DOCX
 *   - jobId  (string, optional)       — which job pipeline
 *   - source (string, optional)       — e.g. "linkedin"
 *   - ...anything else HR adds        — stored as-is in formData
 */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    // Separate known fields from arbitrary HR form data
    const { jobId, source, ...hrFormFields } = req.body;

    const candidate = await Candidate.create({
      resume: {
        url: req.file.path,           // Cloudinary public URL
        cloudinaryId: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      formData: hrFormFields,          // Whatever HR sent — no schema enforcement
      jobId,
      source,
      status: "pending",
    });

    res.status(201).json({
      message: "Candidate submitted successfully",
      candidateId: candidate._id,
      resumeUrl: candidate.resume.url,
    });
  } catch (err) {
    console.error("Submit candidate error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/candidates/:id/screen
 *
 * Screen an existing candidate's resume against a job description.
 * Can be called multiple times (e.g. for different roles).
 *
 * Body (JSON):
 *   - jobTitle       (string, required)
 *   - jobDescription (string, required)
 */
router.post("/:id/screen", async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "jobTitle and jobDescription are required" });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    // Run AI screening — passes resume URL so Claude can access it anytime
    const result = await screenResume({
      resumeUrl: candidate.resume.url,
      mimeType: candidate.resume.mimeType,
      jobTitle,
      jobDescription,
      formData: candidate.formData, // HR form context helps Claude score more accurately
    });

    // Append result (supports screening against multiple JDs over time)
    candidate.screeningResults.push(result);
    candidate.status = "screened";
    await candidate.save();

    res.json({
      candidateId: candidate._id,
      screening: result,
    });
  } catch (err) {
    console.error("Screen candidate error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/candidates/submit-and-screen
 *
 * Convenience endpoint: upload resume + screen in one request.
 * Useful when HR wants instant results on submission.
 *
 * multipart/form-data fields:
 *   - resume          (file, required)
 *   - jobTitle        (string, required)
 *   - jobDescription  (string, required)
 *   - jobId, source   (optional)
 *   - ...any HR fields
 */
router.post("/submit-and-screen", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Resume file is required" });

    const { jobTitle, jobDescription, jobId, source, ...hrFormFields } = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "jobTitle and jobDescription are required" });
    }

    // 1. Save candidate
    const candidate = await Candidate.create({
      resume: {
        url: req.file.path,
        cloudinaryId: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      formData: hrFormFields,
      jobId,
      source,
      status: "pending",
    });

    // 2. Screen immediately
    const result = await screenResume({
      resumeUrl: candidate.resume.url,
      mimeType: candidate.resume.mimeType,
      jobTitle,
      jobDescription,
      formData: hrFormFields,
    });

    candidate.screeningResults.push(result);
    candidate.status = "screened";
    await candidate.save();

    res.status(201).json({
      candidateId: candidate._id,
      resumeUrl: candidate.resume.url,
      screening: result,
    });
  } catch (err) {
    console.error("Submit and screen error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/candidates/:id
 * Fetch a candidate with all their screening results.
 */
router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/candidates?jobId=xxx&status=screened&minScore=70
 * List candidates, optionally filtered by jobId, status, or minimum score.
 */
router.get("/", async (req, res) => {
  try {
    const { jobId, status, minScore } = req.query;
    const filter = {};

    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    let candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    // Filter by minimum score post-query (score lives inside screeningResults array)
    if (minScore) {
      const min = Number(minScore);
      candidates = candidates.filter((c) =>
        c.screeningResults.some((r) => r.score >= min)
      );
    }

    res.json({ total: candidates.length, candidates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;