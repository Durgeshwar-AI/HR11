import mongoose from "mongoose";

// ── Valid stage types matching frontend ROUNDS constant ──────────
export const STAGE_TYPES = [
  "resume_screening",
  "aptitude_test",
  "coding_challenge",
  "ai_voice_interview",
  "technical_interview",
  "custom_round",
];

const pipelineStageSchema = new mongoose.Schema(
  {
    stageType: { type: String, enum: STAGE_TYPES, required: true },
    stageName: { type: String }, // optional display name override
    order: { type: Number, required: true }, // 1-based position in pipeline
    scheduledDate: { type: Date, default: null }, // auto-filled by scheduler
    thresholdScore: { type: Number, default: 60 }, // min score to advance (0–100)
    daysAfterPrev: { type: Number, default: 3 }, // days gap used by auto-scheduler
  },
  { _id: false },
);

const JobRoleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // "Senior React Engineer"
    description: String, // Role summary shown to candidate
    skills: [String], // ["React", "Redux", "TypeScript"]
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HRUser",
      required: false,
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Closed"],
      default: "Draft",
    },
    totalSteps: { type: Number, default: 0 }, // Auto-computed from Question count
    totalRounds: { type: Number, default: 2, min: 0 }, // Derived from pipeline length

    // ── Ordered pipeline (allows repeats, e.g. two technical rounds) ──
    pipeline: { type: [pipelineStageSchema], default: [] },

    // ── Scheduling ───────────────────────────────────────────────
    schedulingStartDate: { type: Date, default: null }, // when to start scheduling stages
    schedulingDone: { type: Boolean, default: false },

    // ── Screening deadline & auto-rejection ──────────────────────
    submissionDeadline: { type: Date, default: null }, // After this date, no new resumes accepted
    topN: { type: Number, default: 5 }, // How many candidates to keep
    autoRejectionDone: { type: Boolean, default: false }, // True once the cron has processed this job
  },
  { timestamps: true },
);

const JobRole = mongoose.model("JobRole", JobRoleSchema);
export default JobRole;
