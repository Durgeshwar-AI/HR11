import express from "express";
import { upload, uploadToCloudinary } from "../../config/cloudinary.js";
import { screenResume } from "../../services/aiService.services.js";
import Candidate from "../../models/candidate.screening.model.js";
import AuthCandidate from "../../models/Candidate.model.js";
import JobRole from "../../models/JobRole.model.js";

const router = express.Router();

// Wrap multer middleware so its errors are caught by our route handler
function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("resume")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.post("/:id/screen", async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;

    if (!jobTitle || !jobDescription) {
      return res
        .status(400)
        .json({ error: "jobTitle and jobDescription are required" });
    }

    // First try the ScreeningCandidate collection
    let candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      // Existing screening candidate — use their stored resume
      const result = await screenResume({
        resumeUrl: candidate.resume.url,
        mimeType: candidate.resume.mimeType,
        jobTitle,
        jobDescription,
        formData: candidate.formData,
      });
      candidate.screeningResults.push(result);
      candidate.status = "screened";
      await candidate.save();

      return res.json({
        candidateId: candidate._id,
        screening: result,
      });
    }

    // Fallback: check the auth Candidate (InterviewCandidate) collection
    const authCandidate = await AuthCandidate.findById(req.params.id);
    if (!authCandidate || !authCandidate.resumeUrl) {
      return res.status(404).json({
        error: authCandidate
          ? "No resume found on candidate profile. Please upload a resume first."
          : "Candidate not found",
      });
    }

    // Screen using the auth candidate's resume URL
    const result = await screenResume({
      resumeUrl: authCandidate.resumeUrl,
      mimeType: "application/pdf",
      jobTitle,
      jobDescription,
      name: authCandidate.name,
      email: authCandidate.email,
    });

    // Create a ScreeningCandidate record so progress is tracked properly
    const screeningRecord = await Candidate.create({
      name: authCandidate.name,
      email: authCandidate.email,
      phone: authCandidate.phone || "",
      resume: {
        url: authCandidate.resumeUrl,
        cloudinaryId: "auth_profile",
        originalName: "Resume.pdf",
        mimeType: "application/pdf",
      },
      jobId: req.body.jobId || "",
      screeningResults: [result],
      status: "screened",
    });

    return res.json({
      candidateId: screeningRecord._id,
      screening: result,
    });
  } catch (err) {
    console.error("[submit-and-screen] Error:", err);
    const message = err?.message || err?.toString() || "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.post("/submit-and-screen", async (req, res) => {
  try {
    await runUpload(req, res);

    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const { jobTitle, jobDescription, jobId } = req.body;
    const FormFields = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        error: "jobTitle and jobDescription are required",
      });
    }

    // ── Block submissions after the deadline ─────────────────────
    if (jobId) {
      const job = await JobRole.findById(jobId);
      if (
        job?.submissionDeadline &&
        new Date() > new Date(job.submissionDeadline)
      ) {
        return res.status(403).json({
          error:
            "The submission deadline for this job has passed. Applications are no longer accepted.",
        });
      }
    }

    // Upload buffer to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file);

    const candidate = await Candidate.create({
      name: FormFields.name || "Unnamed Candidate",
      email: FormFields.email || "",
      phone: FormFields.phone || "",
      resume: {
        url: cloudResult.url,
        cloudinaryId: cloudResult.publicId,
        originalName: cloudResult.originalName,
        mimeType: cloudResult.mimeType,
      },
      jobId,
      status: "pending",
    });

    const result = await screenResume({
      resumeUrl: candidate.resume.url,
      mimeType: candidate.resume.mimeType,
      jobTitle,
      jobDescription,
      name: candidate.name,
      email: candidate.email,
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

export default router;
