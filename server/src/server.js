import { config } from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initEvaluationQueue } from "./workers/evaluationQueue.js";
import { startAutoRejectScheduler } from "./services/autoReject.services.js";

config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Initialise BullMQ evaluation queue (no-op if Redis unavailable)
  await initEvaluationQueue();

  // Start the auto-rejection cron (runs after submission deadlines expire)
  startAutoRejectScheduler();

  app.listen(PORT, () =>
    console.log(`AgenticHire server running on port ${PORT}`),
  );
});

process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  process.exit(0);
});
