/**
 * Tool: conclude_interview
 * Saves transcript and triggers async evaluation.
 */
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
const AGENT_KEY = process.env.AGENT_INTERNAL_API_KEY || "";
export async function concludeInterview(params) {
    const res = await fetch(`${API_BASE}/agent/conclude`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-agent-api-key": AGENT_KEY,
        },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        throw new Error(`Failed to conclude interview: ${res.statusText}`);
    }
    return res.json();
}
