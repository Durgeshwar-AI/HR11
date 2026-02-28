import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewCandidate",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },
    livekitRoomId: String, // For debugging / replay

    // ── Raw Output ─────────────────────────────────
    transcript: String, // Full conversation text

    // ── Hint tracking ────────────────────────────
    hintsUsed: [
      {
        stepNumber: Number,
        questionText: String,
        hintText: String,
        timestamp: Date,
      },
    ],

    // ── Evaluated Scores (set by evaluator worker) ─
    overallScore: { type: Number, min: 0, max: 100 },
    technicalAccuracy: { type: Number, min: 0, max: 10 },
    communicationScore: { type: Number, min: 0, max: 10 },
    hintRelianceScore: { type: Number, min: 0, max: 10 },

    questionBreakdown: [
      {
        stepNumber: Number,
        questionText: String,
        level: String,
        candidateAnswerSummary: String,
        score: { type: Number, min: 0, max: 10 },
        hintWasUsed: Boolean,
        keyConceptsCovered: [String],
      },
    ],

    strengths: [String],
    weaknesses: [String],

    // ── Status ─────────────────────────────────────
    status: {
      type: String,
      enum: ["Scheduled", "InProgress", "Completed", "Evaluated", "Ranked"],
      default: "Scheduled",
    },

    completedAt: Date,
    evaluatedAt: Date,
  },
  { timestamps: true }
);

// Indexes for fast queries
InterviewSchema.index({ jobId: 1, status: 1 });
InterviewSchema.index({ candidateId: 1, jobId: 1 });

const Interview = mongoose.model("Interview", InterviewSchema);
export default Interview;
