import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechnicalQuestion",
      required: true,
    },
    selectedOption: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },
    weight: { type: Number, default: 1 },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false },
);

const TechnicalAttemptSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScreeningCandidate",
      required: true,
    },
    answers: { type: [answerSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TechnicalAttemptSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const TechnicalAttempt = mongoose.model(
  "TechnicalAttempt",
  TechnicalAttemptSchema,
);
export default TechnicalAttempt;
