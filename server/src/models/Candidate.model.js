import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: String,
    phone: { type: String, default: "" },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: "" },
    resumeSummary: String, // Pre-extracted by HR or uploaded by candidate
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobRole" }],
  },
  { timestamps: true }
);

const Candidate = mongoose.model("InterviewCandidate", CandidateSchema);
export default Candidate;
