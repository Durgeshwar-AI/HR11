import mongoose from "mongoose";

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
    totalRounds: { type: Number, default: 2, min: 0 }, // How many interview rounds remain after screening

    // ── Screening deadline & auto-rejection ──────────────────────
    submissionDeadline: { type: Date, default: null }, // After this date, no new resumes accepted
    topN: { type: Number, default: 5 }, // How many candidates to keep
    autoRejectionDone: { type: Boolean, default: false }, // True once the cron has processed this job
  },
  { timestamps: true },
);

const JobRole = mongoose.model("JobRole", JobRoleSchema);
export default JobRole;
