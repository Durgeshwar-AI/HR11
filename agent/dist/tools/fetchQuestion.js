/**
 * Tool: fetch_next_question
 * Returns the question at the given step, or { question: null } when done.
 */
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
const AGENT_KEY = process.env.AGENT_INTERNAL_API_KEY || "";
export async function fetchNextQuestion(jobId, currentStep) {
    const res = await fetch(`${API_BASE}/agent/question/${jobId}/${currentStep}`, {
        headers: { "x-agent-api-key": AGENT_KEY },
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch question: ${res.statusText}`);
    }
    return res.json();
}
