/**
 * BullMQ evaluation queue setup.
 * Only initialises if Redis is available.
 */

let evaluationQueue = null;

export function getEvaluationQueue() {
  return evaluationQueue;
}

export async function initEvaluationQueue() {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set — evaluation queue disabled");
    return null;
  }

  try {
    const { Queue } = await import("bullmq");

    evaluationQueue = new Queue("evaluation", {
      connection: {
        url: process.env.REDIS_URL,
      },
    });

    console.log("Evaluation queue initialised");
    return evaluationQueue;
  } catch (err) {
    console.warn("BullMQ not available:", err.message);
    return null;
  }
}
