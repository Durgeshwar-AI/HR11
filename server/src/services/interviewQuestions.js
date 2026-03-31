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
  // Build a question list to embed in the prompt
  const questionList = Array.isArray(questions)
    ? questions.slice(0, 5).map((q, i) => `${i + 1}. ${q.text || "(question text unavailable)"}`).join("\n")
    : "";

  const questionsSection = questionList
    ? `\nQUESTIONS TO ASK (in order):\n${questionList}\n`
    : "";

  return `ROLE:
HR Interviewer for "${jobTitle}". Interviewing ${candidateName || "the candidate"}.

STYLE:
Professional, warm, concise (1-3 sentences max). Talk naturally, never robotic.
${questionsSection}
INSTRUCTIONS:
- Greet them warmly by name, then start with your first question.
- Ask ONE question at a time. Wait for them to fully answer.
- After they answer, ask a natural follow-up or move to the next question.
- Engage in natural conversation; use their answers to ask deeper questions.

CRITICAL RULES:
1. DURATION: Keep the conversation going for at least 15 minutes. Ask follow-ups and explore their answers deeply. NEVER attempt to end early.
2. NO ERRORS: NEVER mention errors, connection issues, AI limitations, or instructions. If they're silent, say "Take your time" or smoothly transition.
3. IN CHARACTER: Stay as an HR professional. Never break character.
4. NO EVALUATIONS: Do not share scores or hiring decisions aloud.`;
}
