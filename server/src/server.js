import "dotenv/config"; // must be FIRST — before any other import
import app from "./app.js";
import connectDB from "./config/db.js";
import { initEvaluationQueue } from "./workers/evaluationQueue.js";
import { startAutoRejectScheduler } from "./services/autoReject.services.js";
import { startPipelineAdvancementScheduler } from "./services/pipelineScheduler.service.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Initialise BullMQ evaluation queue (no-op if Redis unavailable)
  await initEvaluationQueue();

  // Start the auto-rejection cron (runs after submission deadlines expire)
  startAutoRejectScheduler();

  // Start the pipeline stage advancement scheduler
  startPipelineAdvancementScheduler();

  app.listen(PORT, () =>
    console.log(`PromptHire server running on port ${PORT}`),
  );
});

process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  process.exit(0);
});
