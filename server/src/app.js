import express from "express";
import helmet from "helmet";
import cors from "cors";

// ── Route imports ────────────────────────────────────────────────
import authRoutes from "./routes/auth/auth.route.js";
import jobsRoutes from "./routes/jobs/jobs.route.js";
import questionsRoutes from "./routes/questions/questions.route.js";
import interviewsRoutes from "./routes/interviews/interviews.route.js";
import livekitRoutes from "./routes/livekit/livekit.route.js";
import agentToolsRoutes from "./routes/agents/agentTools.route.js";
import resumeRoutes from "./routes/agents/resume.route.js";
import formsRoutes from "./routes/forms/forms.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "AgenticHire API is running", status: "ok" });
});

// ── Auth ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── HR — Job Management ──────────────────────────────────────────
app.use("/api/jobs", jobsRoutes);

// ── HR — Question Path Builder ───────────────────────────────────
// Routes: POST/GET/PUT/DELETE /api/jobs/:jobId/questions[/:id]
// Also: PUT /api/jobs/:jobId/reorder
app.use("/api/jobs", questionsRoutes);

// ── Interviews & Results ─────────────────────────────────────────
app.use("/api/interviews", interviewsRoutes);

// ── LiveKit Token ────────────────────────────────────────────────
app.use("/api/interview", livekitRoutes);

// ── Agent Tools (internal, called by LiveKit worker) ─────────────
app.use("/api/agent", agentToolsRoutes);

// ── Resume Screening (existing) ──────────────────────────────────
app.use("/api/candidates", resumeRoutes);

// ── Forms (existing) ─────────────────────────────────────────────
app.use("/api/forms", formsRoutes);

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;