const mongoose = require("mongoose");

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
    recommendation: {
      type: String,
      enum: ["strong_yes", "yes", "maybe", "no"],
    },
    reasoning: String,
    screendAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    // Resume file stored on Cloudinary — URL is public so Claude can fetch it anytime
    resume: {
      url: { type: String, required: true },       // Cloudinary public URL
      cloudinaryId: { type: String, required: true }, // For deletion if needed
      originalName: String,
      mimeType: String,
    },

    // Flexible HR form data — no fixed schema enforced here.
    // Each HR team can submit whatever fields they collect (name, phone, LinkedIn, etc.)
    // MongoDB stores it as-is in a Mixed type field.
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Track which HR/job pipeline this candidate came from
    jobId: { type: String, index: true },
    source: String, // e.g. "linkedin", "referral", "careers_page"

    // Screening results — array so a candidate can be screened against multiple JDs
    screeningResults: [screeningResultSchema],

    status: {
      type: String,
      enum: ["pending", "screened", "shortlisted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    strict: false,    // allows extra top-level fields if an HR sends unexpected keys
  }
);

module.exports = mongoose.model("Candidate", candidateSchema);