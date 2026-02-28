/**
 * Evaluation queue — Redis-free implementation.
 * Jobs run in-process as fire-and-forget async tasks.
 */

export function getEvaluationQueue() {
  return null; // No queue — evaluations run directly
}

export async function initEvaluationQueue() {
  console.log("Evaluation queue: running in-process (no Redis)");
  return null;
}
