import { config } from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initEvaluationQueue } from "./workers/evaluationQueue.js";

config();

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Initialise BullMQ evaluation queue (no-op if Redis unavailable)
  await initEvaluationQueue();

  app.listen(PORT, () => console.log(`AgenticHire server running on port ${PORT}`));
});

process.on("SIGINT", async () => {
  console.log("Server is shutting down...");
  process.exit(0);
});
