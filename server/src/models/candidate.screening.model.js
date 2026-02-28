import mongoose from "mongoose";

const screeningResultSchema = new mongoose.Schema(
  {
    jobTitle: String,
    jobDescription: String,
    score: { type: Number, min: 0, max: 100 },
    scoreBreakdown: {
      skills: Number,       // 0-100
      experience: Number,   // 0-100
      education: Number,    // 0-100
      overall: Number,      // 0-100
    },
    reasoning: String,
    screendAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    name:{
      type: String,
      required: true,
    },
    email:{
      type: String,
      required: true,
    },
    phone:{
      type: String,
    },
    resume: {
      url: { type: String, required: true },      
      cloudinaryId: { type: String, required: true }, 
      originalName: String,
      mimeType: String,
    },
    jobId: { type: String, index: true },
    screeningResults: [screeningResultSchema],

    status: {
      type: String,
      enum: ["pending", "screened", "shortlisted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, 
    strict: false, 
  }
);

const ScreeningCandidate = mongoose.model("ScreeningCandidate", candidateSchema);
export default ScreeningCandidate;