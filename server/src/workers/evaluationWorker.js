/**
 * Evaluation Worker
 *
 * Runs as a separate process (or within the server if no Redis).
 * Picks up evaluation jobs from BullMQ, calls Gemini Standard API,
 * and updates the Interview document with scores.
 *
 * Usage (standalone):
 *   node src/workers/evaluationWorker.js
 *
 * Or called programmatically via processEvaluation(interviewId).
 */

import mongoose from "mongoose";
import { config } from "dotenv";

config();

import Interview from "../models/Interview.model.js";
import Question from "../models/Question.model.js";
import { callGeminiStandard } from "../services/geminiService.js";
import { buildEvaluatorPrompt } from "../services/promptTemplates.js";

/**
 * Process a single evaluation job.
 */
export async function processEvaluation(interviewId) {
  const interview = await Interview.findById(interviewId).populate("jobId");

  if (!interview) {
    throw new Error(`Interview not found: ${interviewId}`);
  }

  if (!interview.transcript) {
    throw new Error(`No transcript for interview: ${interviewId}`);
  }

  const questions = await Question.find({ jobId: interview.jobId }).sort(
    "stepNumber"
  );

  const prompt = buildEvaluatorPrompt(
    interview.transcript,
    questions,
    interview.hintsUsed || []
  );

  const result = await callGeminiStandard(prompt);
  const scores = JSON.parse(result);

  await Interview.findByIdAndUpdate(interviewId, {
    overallScore: scores.overall_score,
    technicalAccuracy: scores.technicalAccuracy,
    communicationScore: scores.communicationScore,
    hintRelianceScore: scores.hintRelianceScore,
    questionBreakdown: scores.questionBreakdown,
    strengths: scores.strengths,
    weaknesses: scores.weaknesses,
    status: "Evaluated",
    evaluatedAt: new Date(),
  });

  console.log(
    `Interview ${interviewId} evaluated — score: ${scores.overall_score}`
  );
  return scores;
}

/**
 * Start BullMQ worker if Redis is available.
 */
async function startWorker() {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set — worker cannot start");
    return;
  }

  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Worker connected to MongoDB");
  }

  try {
    const { Worker } = await import("bullmq");

    const worker = new Worker(
      "evaluation",
      async (job) => {
        console.log(`Processing evaluation job: ${job.data.interviewId}`);
        await processEvaluation(job.data.interviewId);
      },
      {
        connection: { url: process.env.REDIS_URL },
      }
    );

    worker.on("completed", (job) => {
      console.log(`Evaluation job completed: ${job.data.interviewId}`);
    });

    worker.on("failed", (job, err) => {
      console.error(
        `Evaluation job failed: ${job.data.interviewId}`,
        err.message
      );
    });

    console.log("Evaluation worker started and listening for jobs...");
  } catch (err) {
    console.error("Failed to start evaluation worker:", err.message);
  }
}

// Run standalone if executed directly
const isMain =
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`;
if (isMain) {
  startWorker().catch(console.error);
}
