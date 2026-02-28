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
import resumeRoutes from "./routes/agents/resume.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "AgenticHire API is running", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/jobs", questionsRoutes);
app.use("/api/interviews", interviewsRoutes);
app.use("/api/interview", livekitRoutes);
app.use("/api/agent", agentToolsRoutes);
app.use("/api/candidates", resumeRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/ai", resumeRoutes);

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;