/**
 * Tool: fetch_candidate_context
 * Returns candidate name + resume summary for the agent greeting.
 */
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
const AGENT_KEY = process.env.AGENT_INTERNAL_API_KEY || "";
export async function fetchCandidateContext(candidateId) {
    const res = await fetch(`${API_BASE}/agent/candidate/${candidateId}`, {
        headers: { "x-agent-api-key": AGENT_KEY },
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch candidate context: ${res.statusText}`);
    }
    return res.json();
}
