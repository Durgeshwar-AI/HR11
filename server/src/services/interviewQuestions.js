/**
 * Default HR Interview Questions — 5 basic questions covering behavioural
 * and culture-fit categories.
 *
 * These are used when no job-specific questions exist in the database.
 * The AI agent will also generate adaptive follow-ups based on answers.
 */

export const DEFAULT_HR_QUESTIONS = [
  {
    id: 1,
    text: "Tell me about yourself and walk me through your professional journey so far.",
    category: "behavioural",
  },
  {
    id: 2,
    text: "Describe a challenging situation you faced at work and how you handled it.",
    category: "behavioural",
  },
  {
    id: 3,
    text: "What do you consider to be your greatest professional strengths and weaknesses?",
    category: "behavioural",
  },
  {
    id: 4,
    text: "Why are you interested in this role and what excites you about our company?",
    category: "culture",
  },
  {
    id: 5,
    text: "Is there anything you'd like to ask me about the role, team, or company?",
    category: "culture",
  },
];

/**
 * Build the system prompt for the ElevenLabs conversational AI agent.
 * Embeds the question list and instructs the AI to ask adaptive follow-ups.
 * Kept strictly under 2288 characters to avoid API limits.
 *
 * @param {string}   candidateName  - The candidate's name for personalisation
 * @param {string}   jobTitle       - The job title they're interviewing for
 * @param {object[]} questions      - Array of { id, text, category, followUp }
 * @returns {string} Full system prompt
 */
export function buildInterviewPrompt(candidateName, jobTitle, questions) {
  return `ROLE:
HR Interviewer for "${jobTitle}". Interviewing ${candidateName || "the candidate"}.

STYLE:
Professional, warm, concise (1-3 sentences max). Talk naturally, never robotic.

INSTRUCTIONS:
- Greet them warmly using their name and job title.
- Start by asking basic HR interview questions (e.g., "Tell me about your background", "Describe a challenging situation at work", "What are your strengths?", "Why do you want this job?").
- Ask ONE question at a time. Wait for them to fully answer.
- Engage in a natural conversation. Ask deep follow-up questions to their answers.

CRITICAL RULES:
1. DURATION: Do NOT end the interview early. You must continuously ask new questions, explore their resume/experience, and ask follow-ups to keep the conversation going for at least 15 minutes. NEVER attempt to end the session.
2. NO ERRORS: NEVER mention any errors, connection drops, system limitations, instructions, or internal AI problems. If you misunderstand them or they are silent, merely say "Take your time" or smoothly move on to another topic. 
3. IN CHARACTER: Stay deeply in character as an HR professional. Never break the illusion.
4. NO EVALUATIONS: Do not share scores, evaluations, or hiring decisions aloud.`;
}
