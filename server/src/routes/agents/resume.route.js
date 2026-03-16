import express from "express";
import { upload, uploadToCloudinary } from "../../config/cloudinary.js";
import { screenResume } from "../../services/aiService.services.js";
import Candidate from "../../models/candidate.screening.model.js";
import AuthCandidate from "../../models/Candidate.model.js";
import JobRole from "../../models/JobRole.model.js";

const router = express.Router();

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: wrap multer so errors propagate cleanly to route handlers
   ───────────────────────────────────────────────────────────────────────────── */
function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("resume")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: fetch job record once and resolve all fields
   Returns { jobTitle, jobDescription, requiredSkills, deadlinePassed }
   ───────────────────────────────────────────────────────────────────────────── */
async function resolveJobFields(jobId, bodyTitle, bodyDescription) {
  let jobTitle       = bodyTitle       || null;
  let jobDescription = bodyDescription || null;
  let requiredSkills = null;
  let deadlinePassed = false;

  if (!jobId) {
    return { jobTitle, jobDescription, requiredSkills, deadlinePassed };
  }

  try {
    const job = await JobRole.findById(jobId);
    if (!job) {
      console.warn(`[screening] Job ${jobId} not found in DB — using request body fields`);
      return { jobTitle, jobDescription, requiredSkills, deadlinePassed };
    }

    // Fill in missing fields from the job record
    if (!jobTitle       && job.jobTitle)    jobTitle       = job.jobTitle;
    if (!jobTitle       && job.title)       jobTitle       = job.title;       // handle both field names
    if (!jobDescription && job.description) jobDescription = job.description;

    // Explicit skills list
    if (job.skills && job.skills.length > 0) {
      requiredSkills = job.skills;
      console.log(`[screening] Skills from job record: ${requiredSkills.join(", ")}`);
    }

    // Deadline check
    if (job.submissionDeadline && new Date() > new Date(job.submissionDeadline)) {
      deadlinePassed = true;
    }
  } catch (err) {
    console.warn(`[screening] Could not fetch job ${jobId}: ${err.message}`);
  }

  return { jobTitle, jobDescription, requiredSkills, deadlinePassed };
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /:id/screen
   Re-screen an existing candidate (by their DB _id) against a job.
   Body: { jobTitle?, jobDescription?, jobId? }
   ───────────────────────────────────────────────────────────────────────────── */
router.post("/:id/screen", async (req, res) => {
  try {
    const { jobId } = req.body;

    // Resolve job fields (single DB call)
    const { jobTitle, jobDescription, requiredSkills } = await resolveJobFields(
      jobId,
      req.body.jobTitle,
      req.body.jobDescription
    );

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        error:
          "jobTitle and jobDescription are required. " +
          "Provide them directly, or supply a valid jobId so they can be fetched automatically.",
      });
    }

    // VALIDATE: Job description must be substantively different from title (not just a duplicate)
    // OR explicit skills must be provided
    const descriptionLower = jobDescription.toLowerCase().trim();
    const titleLower = jobTitle.toLowerCase().trim();
    const isSameAsTitle = descriptionLower === titleLower || descriptionLower.startsWith(titleLower) && descriptionLower.length <= titleLower.length + 10;
    const hasExplicitSkills = requiredSkills && requiredSkills.length > 0;
    
    if (isSameAsTitle && !hasExplicitSkills) {
      return res.status(400).json({
        error: "INSUFFICIENT JOB DESCRIPTION",
        message: "Job description cannot be the same as job title. Please provide actual job requirements.",
        suggestion: "Either provide: (1) A detailed job description with technical requirements, OR (2) An explicit 'requiredSkills' list",
        example: {
          approach1: "Detailed description: 'We need a Senior Backend Engineer with: experience with microservices, database optimization, message queues like Kafka, distributed systems knowledge...'",
          approach2: "Or explicit skills: ['microservices', 'kafka', 'redis', 'distributed systems', 'database optimization']"
        }
      });
    }

    /* ── Try ScreeningCandidate collection first ── */
    let candidate = await Candidate.findById(req.params.id);

    if (candidate) {
      console.log(
        `[screen] Re-screening existing candidate: ${candidate.name} | ${jobTitle}`
      );

      const result = await screenResume({
        resumeUrl    : candidate.resume.url,
        mimeType     : candidate.resume.mimeType,
        jobTitle,
        jobDescription,
        name         : candidate.name,
        email        : candidate.email,
        requiredSkills,
      });

      candidate.screeningResults.push(result);
      candidate.status = "screened";
      await candidate.save();

      return res.json({ candidateId: candidate._id, screening: result });
    }

    /* ── Fallback: AuthCandidate (interview-flow candidate) ── */
    const authCandidate = await AuthCandidate.findById(req.params.id);

    if (!authCandidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }
    if (!authCandidate.resumeUrl) {
      return res.status(404).json({
        error:
          "No resume found on this candidate's profile. " +
          "Please ask them to upload a resume first.",
      });
    }

    console.log(
      `[screen] Screening auth-candidate: ${authCandidate.name} | ${jobTitle}`
    );

    const result = await screenResume({
      resumeUrl    : authCandidate.resumeUrl,
      mimeType     : "application/pdf",
      jobTitle,
      jobDescription,
      name         : authCandidate.name,
      email        : authCandidate.email,
      requiredSkills,
    });

    // Create a ScreeningCandidate record so progress is tracked
    const screeningRecord = await Candidate.create({
      name  : authCandidate.name,
      email : authCandidate.email,
      phone : authCandidate.phone || "",
      resume: {
        url          : authCandidate.resumeUrl,
        cloudinaryId : "auth_profile",
        originalName : "Resume.pdf",
        mimeType     : "application/pdf",
      },
      jobId            : jobId || "",
      screeningResults : [result],
      status           : "screened",
    });

    return res.json({ candidateId: screeningRecord._id, screening: result });
  } catch (err) {
    console.error("[screen] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /submit-and-screen
   Upload a new resume, create a candidate record, and run screening in one shot.

   Multipart form fields:
     resume       (file, required)
     name         (string)
     email        (string)
     phone        (string)
     jobTitle     (string)  ─┐ at least one required,
     jobDescription(string) ─┤ or supply jobId and they
     jobId        (string)  ─┘ will be fetched from DB
   ───────────────────────────────────────────────────────────────────────────── */
router.post("/submit-and-screen", async (req, res) => {
  console.log(`\n[submit-and-screen] Request received`);

  try {
    /* ── 1. Handle file upload ── */
    await runUpload(req, res);

    if (!req.file) {
      return res.status(400).json({
        error: "Resume file is required. Please attach a PDF or DOCX file.",
      });
    }

    console.log(
      `[submit-and-screen] File received: "${req.file.originalname}" ` +
      `(${(req.file.size / 1024).toFixed(1)} KB, ${req.file.mimetype})`
    );

    const { name, email, phone, jobId } = req.body;

    /* ── 2. Resolve job fields — single DB call ── */
    const { jobTitle, jobDescription, requiredSkills, deadlinePassed } =
      await resolveJobFields(jobId, req.body.jobTitle, req.body.jobDescription);

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        error:
          "jobTitle and jobDescription are required. " +
          "Provide them in the form, or supply a valid jobId.",
      });
    }

    // VALIDATE: Job description must be substantively different from title (not just a duplicate)
    // OR explicit skills must be provided
    const descriptionLower = jobDescription.toLowerCase().trim();
    const titleLower = jobTitle.toLowerCase().trim();
    const isSameAsTitle = descriptionLower === titleLower || descriptionLower.startsWith(titleLower) && descriptionLower.length <= titleLower.length + 10;
    const hasExplicitSkills = requiredSkills && requiredSkills.length > 0;
    
    if (isSameAsTitle && !hasExplicitSkills) {
      return res.status(400).json({
        error: "INSUFFICIENT JOB DESCRIPTION",
        message: "Job description cannot be the same as job title. Please provide actual job requirements.",
        suggestion: "Either provide: (1) A detailed job description with technical requirements, OR (2) An explicit 'requiredSkills' array",
        example: {
          approach1: "Detailed description: 'Senior Backend Engineer needed with: 5+ years experience, microservices architecture, Kafka, Redis, distributed systems knowledge...'",
          approach2: "Or explicit skills: ['microservices', 'kafka', 'redis', 'distributed systems', 'database design']"
        }
      });
    }

    /* ── 3. Submission deadline guard ── */
    if (deadlinePassed) {
      console.warn(
        `[submit-and-screen] Submission deadline passed for job ${jobId}`
      );
      return res.status(403).json({
        error:
          "The submission deadline for this position has passed. " +
          "Applications are no longer accepted.",
      });
    }

    /* ── 4. Upload resume to Cloudinary ── */
    console.log(`[submit-and-screen] Uploading to Cloudinary...`);
    const cloudResult = await uploadToCloudinary(req.file);
    console.log(
      `[submit-and-screen] ✓ Cloudinary upload: ${cloudResult.url.substring(0, 60)}...`
    );

    /* ── 5. Create candidate record (status: pending) ── */
    const candidate = await Candidate.create({
      name  : name  || "Unnamed Candidate",
      email : email || "",
      phone : phone || "",
      resume: {
        url          : cloudResult.url,
        cloudinaryId : cloudResult.publicId,
        originalName : cloudResult.originalName || req.file.originalname,
        mimeType     : cloudResult.mimeType     || req.file.mimetype,
      },
      jobId : jobId || "",
      status: "pending",
    });

    console.log(
      `[submit-and-screen] Candidate created: ${candidate._id} — "${candidate.name}"`
    );

    /* ── 6. Run AI screening ── */
    console.log(`[submit-and-screen] Running Claude AI screening...`);
    const result = await screenResume({
      resumeUrl    : candidate.resume.url,
      mimeType     : candidate.resume.mimeType,
      jobTitle,
      jobDescription,
      name         : candidate.name,
      email        : candidate.email,
      requiredSkills,
    });

    /* ── 7. Persist screening result ── */
    candidate.screeningResults.push(result);
    candidate.status = "screened";
    await candidate.save();

    console.log(
      `[submit-and-screen] ✓ Complete — Score: ${result.score}/100 ` +
      `| Recommendation: ${result.report?.recommendation}`
    );

    return res.status(201).json({
      candidateId: candidate._id,
      resumeUrl  : candidate.resume.url,
      screening  : result,
    });
  } catch (err) {
    console.error(`\n❌ [submit-and-screen] ERROR: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ error: err.message });
  }
});

export default router;