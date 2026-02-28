/**
 * Core Interview Agent
 *
 * Uses Gemini Live API through LiveKit's multimodal agent pipeline.
 * Manages the interview state machine: greet → ask questions → conclude.
 */
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";
import { fetchCandidateContext } from "./tools/fetchContext.js";
import { fetchNextQuestion } from "./tools/fetchQuestion.js";
import { concludeInterview } from "./tools/concludeInterview.js";
/**
 * Tool definitions for Gemini function calling.
 */
const toolDefinitions = [
    {
        name: "fetch_candidate_context",
        description: "Retrieves the candidate's name and resume summary. Call this first before speaking.",
        parameters: {
            type: "object",
            properties: {
                candidateId: { type: "string" },
            },
            required: ["candidateId"],
        },
    },
    {
        name: "fetch_next_question",
        description: "Fetches the next question in the interview path. Returns null when all questions are done.",
        parameters: {
            type: "object",
            properties: {
                jobId: { type: "string" },
                currentStep: {
                    type: "number",
                    description: "Pass 0 to get the first question",
                },
            },
            required: ["jobId", "currentStep"],
        },
    },
    {
        name: "conclude_interview",
        description: "Called when all questions are answered or the candidate ends the session. Saves transcript and triggers evaluation.",
        parameters: {
            type: "object",
            properties: {
                candidateId: { type: "string" },
                interviewId: { type: "string" },
                fullTranscript: { type: "string" },
                hintsUsed: {
                    type: "array",
                    items: { type: "object" },
                },
            },
            required: ["candidateId", "interviewId", "fullTranscript"],
        },
    },
];
/**
 * Handle a tool call from Gemini.
 */
async function handleToolCall(name, args, config) {
    switch (name) {
        case "fetch_candidate_context":
            return fetchCandidateContext(args.candidateId || config.candidateId);
        case "fetch_next_question":
            return fetchNextQuestion(args.jobId || config.jobId, args.currentStep);
        case "conclude_interview":
            return concludeInterview({
                interviewId: args.interviewId || config.interviewId,
                fullTranscript: args.fullTranscript,
                hintsUsed: args.hintsUsed || [],
            });
        default:
            return { error: `Unknown tool: ${name}` };
    }
}
/**
 * Create the interview agent for a room.
 */
export async function createInterviewAgent(ctx, config) {
    console.log(`[Agent] Agent created for interview ${config.interviewId}`);
    console.log(`[Agent] System prompt loaded (${SYSTEM_PROMPT.length} chars)`);
    console.log(`[Agent] ${toolDefinitions.length} tools registered`);
    // NOTE: Full LiveKit agent pipeline integration depends on the specific
    // version of @livekit/agents and @livekit/agents-plugin-google installed.
    //
    // The pattern is:
    //
    // 1. Create a MultimodalAgent with Gemini Live model
    // 2. Provide the system prompt and tool definitions
    // 3. Start the agent in the room context
    // 4. Handle tool calls via the handleToolCall function above
    //
    // Example (adjust to your installed SDK version):
    //
    // import { MultimodalAgent } from "@livekit/agents";
    // import { GoogleLiveModel } from "@livekit/agents-plugin-google";
    //
    // const model = new GoogleLiveModel({
    //   model: process.env.GEMINI_LIVE_MODEL || "gemini-2.0-flash-live",
    //   apiKey: process.env.GEMINI_API_KEY,
    //   tools: toolDefinitions,
    //   systemInstruction: SYSTEM_PROMPT,
    // });
    //
    // const agent = new MultimodalAgent({ model });
    // agent.on("tool_call", async (call) => {
    //   const result = await handleToolCall(call.name, call.arguments, config);
    //   call.resolve(result);
    // });
    //
    // await agent.start(ctx.room);
    console.log("[Agent] Agent scaffold ready. Install @livekit/agents and configure the multimodal pipeline to enable live interviews.");
}
