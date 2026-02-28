/**
 * AgenticHire — LiveKit Agent Worker Entry Point
 *
 * This worker listens for new LiveKit rooms and joins them as an AI
 * interviewer participant, powered by Gemini Live API.
 *
 * Run: npx tsx src/index.ts
 */
import { config } from "dotenv";
config();
import { WorkerOptions, defineAgent, cli } from "@livekit/agents";
import { createInterviewAgent } from "./agent.js";
export default defineAgent({
    entry: async (ctx) => {
        // Wait for a participant (candidate) to connect
        await ctx.waitForParticipant();
        console.log(`[Agent] Participant joined room: ${ctx.room.name}`);
        // Extract metadata from the room participant token
        const participant = ctx.room.remoteParticipants.values().next().value;
        const metadata = participant?.metadata
            ? JSON.parse(participant.metadata)
            : {};
        const { jobId, interviewId } = metadata;
        const candidateId = participant?.identity || "unknown";
        console.log(`[Agent] Starting interview — candidate: ${candidateId}, job: ${jobId}`);
        // Create and run the interview agent
        await createInterviewAgent(ctx, {
            candidateId,
            jobId,
            interviewId,
        });
    },
});
// Start the worker via CLI
cli.runApp(new WorkerOptions({
    agent: import.meta.url,
}));
