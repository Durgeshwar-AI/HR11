/**
 * Tool: fetch_next_question
 * Returns the question at the given step, or { question: null } when done.
 */
interface QuestionData {
    id: string;
    stepNumber: number;
    text: string;
    level: string;
    enableHint: boolean;
    hintText: string;
    hintTriggerSeconds: number;
    keyConceptsExpected: string[];
    maxScore: number;
    allowFollowUp: boolean;
    followUpPrompt: string;
}
export declare function fetchNextQuestion(jobId: string, currentStep: number): Promise<{
    question: QuestionData | null;
}>;
export {};
