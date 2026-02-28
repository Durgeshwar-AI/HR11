/**
 * Evaluation Worker
 *
 * Called directly (fire-and-forget) from the conclude endpoint.
 * No Redis or BullMQ required.
 */

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
