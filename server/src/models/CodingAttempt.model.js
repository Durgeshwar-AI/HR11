import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingQuestion",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["JavaScript", "Python", "Java", "C++", "Go"],
    },
    code: { type: String, required: true },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    runtime: { type: String, default: null },
    memory: { type: String, default: null },
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"],
      default: "Wrong Answer",
    },
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const CodingAttemptSchema = new mongoose.Schema(
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
    submissions: { type: [submissionSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

CodingAttemptSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const CodingAttempt = mongoose.model("CodingAttempt", CodingAttemptSchema);
export default CodingAttempt;
