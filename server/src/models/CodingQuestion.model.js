import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false },
);

const CodingQuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    tags: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    testCases: {
      type: [testCaseSchema],
      validate: [
        (arr) => arr.length >= 1,
        "At least one test case is required",
      ],
    },
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HRUser",
    },
    jobIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobRole" }],
  },
  { timestamps: true },
);

CodingQuestionSchema.index({ difficulty: 1 });
CodingQuestionSchema.index({ tags: 1 });

const CodingQuestion = mongoose.model("CodingQuestion", CodingQuestionSchema);
export default CodingQuestion;
