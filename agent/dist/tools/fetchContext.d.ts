/**
 * Tool: fetch_candidate_context
 * Returns candidate name + resume summary for the agent greeting.
 */
export declare function fetchCandidateContext(candidateId: string): Promise<{
    name: string;
    email: string;
    resumeSummary: string;
}>;
