/**
 * Tool: conclude_interview
 * Saves transcript and triggers async evaluation.
 */
interface ConcludeParams {
    interviewId: string;
    fullTranscript: string;
    hintsUsed: object[];
}
export declare function concludeInterview(params: ConcludeParams): Promise<{
    success: boolean;
}>;
export {};
