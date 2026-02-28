import mongoose from "mongoose";

const TechnicalQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: [(arr) => arr.length >= 2, "At least two options are required"],
    },
    correctOption: { type: Number, required: true, min: 0 },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    category: {
      type: String,
      default: "General",
      enum: [
        "General",
        "System Design",
        "Architecture",
        "Databases",
        "Networking",
        "Security",
        "DevOps",
        "Data Structures",
        "Algorithms",
        "OS Internals",
      ],
    },
    tags: { type: [String], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HRUser",
    },
    jobIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobRole" }],
  },
  { timestamps: true },
);

TechnicalQuestionSchema.index({ difficulty: 1 });
TechnicalQuestionSchema.index({ category: 1 });

const TechnicalQuestion = mongoose.model(
  "TechnicalQuestion",
  TechnicalQuestionSchema,
);
export default TechnicalQuestion;
