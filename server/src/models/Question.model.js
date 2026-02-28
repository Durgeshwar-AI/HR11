import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },
    stepNumber: { type: Number, required: true }, // Enforces ordering: 1, 2, 3...

    // ── Core Question ──────────────────────────────
    text: { type: String, required: true },
    level: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    // ── Hint Configuration (HR sets per question) ──
    enableHint: { type: Boolean, default: false },
    hintText: String,
    hintTriggerSeconds: { type: Number, default: 8 },

    // ── Expected Answer Guidance (for evaluator) ───
    keyConceptsExpected: [String],
    maxScore: { type: Number, default: 10 },

    // ── Follow-up Options ──────────────────────────
    allowFollowUp: { type: Boolean, default: true },
    followUpPrompt: String,
  },
  { timestamps: true }
);

// Compound index for fast lookups
QuestionSchema.index({ jobId: 1, stepNumber: 1 });

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
