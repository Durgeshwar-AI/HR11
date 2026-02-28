/**
 * Core Interview Agent
 *
 * Uses Gemini Live API through LiveKit's multimodal agent pipeline.
 * Manages the interview state machine: greet → ask questions → conclude.
 */
import type { JobContext } from "@livekit/agents";
interface AgentConfig {
    candidateId: string;
    jobId: string;
    interviewId: string;
}
/**
 * Create the interview agent for a room.
 */
export declare function createInterviewAgent(ctx: JobContext, config: AgentConfig): Promise<void>;
export {};
