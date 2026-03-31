/**
 * Default HR Interview Questions.
 *
 * These are used when no job-specific questions exist in the database.
 * The AI agent will also generate adaptive follow-ups based on answers.
 */

function normalizeText(value, limit = 140) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function uniqueStrings(values, limit = 3) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const text = normalizeText(String(value), 40);
    const key = text.toLowerCase();

    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);

    if (result.length >= limit) break;
  }

  return result;
}

export const DEFAULT_HR_QUESTIONS = [
  {
    id: 1,
    text: "Tell me about yourself and what has prepared you for this role.",
    category: "introduction",
  },
  {
    id: 2,
    text: "What interested you in this role and our company?",
    category: "motivation",
  },
  {
    id: 3,
    text: "Which skills or experiences make you a strong fit for this position?",
    category: "fit",
  },
  {
    id: 4,
    text: "Can you walk me through a project or achievement that best shows your impact?",
    category: "experience",
  },
  {
    id: 5,
    text: "Tell me about a time you handled a difficult challenge or conflict at work.",
    category: "behavioural",
  },
  {
    id: 6,
    text: "How do you collaborate with teammates when priorities or opinions differ?",
    category: "collaboration",
  },
  {
    id: 7,
    text: "How do you handle feedback, ambiguity, or pressure in day-to-day work?",
    category: "behavioural",
  },
  {
    id: 8,
    text: "What would you want to accomplish in your first 90 days if you joined us?",
    category: "planning",
  },
  {
    id: 9,
    text: "Where do you see your career heading over the next few years, and how does this role fit that plan?",
    category: "growth",
  },
  {
    id: 10,
    text: "What compensation expectations do you have for this role?",
    category: "compensation",
  },
];

/**
 * Generate 10 HR-level interview questions using the job and candidate context.
 */
export function generateHRInterviewQuestions({
  candidateName,
  jobTitle,
  jobDescription,
  jobSkills = [],
  candidateSkills = [],
  resumeSummary,
} = {}) {
  const roleTitle = normalizeText(jobTitle, 80) || "the role";
  const candidateLabel = normalizeText(candidateName, 80) || "the candidate";
  const roleSkills = uniqueStrings(jobSkills, 3);
  const candidateSkillList = uniqueStrings(candidateSkills, 3);
  const combinedSkills = [...new Set([...candidateSkillList, ...roleSkills])].slice(0, 4);
  const skillFocus = combinedSkills.length
    ? combinedSkills.join(", ")
    : "the core requirements of the role";
  const jobSummary = normalizeText(jobDescription, 160);
  const resumeHint = normalizeText(resumeSummary, 120);

  const questions = [
    {
      id: 1,
      text: `Tell me about yourself and what has prepared you for ${roleTitle}.`,
      category: "introduction",
    },
    {
      id: 2,
      text: `What interested you in ${roleTitle} and in working with our company?`,
      category: "motivation",
    },
    {
      id: 3,
      text: `How does your experience with ${skillFocus} help you contribute in this role?`,
      category: "fit",
    },
    {
      id: 4,
      text: `Can you walk me through a project or achievement that best shows your impact for a role like ${roleTitle}?`,
      category: "experience",
    },
    {
      id: 5,
      text: jobSummary
        ? `The job description highlights ${jobSummary}. How would you approach those responsibilities in practice?`
        : `How would you approach the main responsibilities of ${roleTitle}?`,
      category: "role_fit",
    },
    {
      id: 6,
      text: resumeHint
        ? `Your background summary mentions ${resumeHint}. Can you expand on the most relevant part of that experience?`
        : "Tell me about a time you handled a difficult challenge or conflict at work.",
      category: "behavioural",
    },
    {
      id: 7,
      text: `How do you collaborate with teammates, managers, and cross-functional partners when priorities change?`,
      category: "collaboration",
    },
    {
      id: 8,
      text: `What would you want to accomplish in your first 90 days if you joined us for ${roleTitle}?`,
      category: "planning",
    },
    {
      id: 9,
      text: `Where do you see your career heading over the next few years, and how does ${roleTitle} fit that plan?`,
      category: "growth",
    },
    {
      id: 10,
      text: `What compensation expectations do you have for this role?`,
      category: "compensation",
    },
  ];

  return questions.map((question, index) => ({
    ...question,
    id: index + 1,
    text: question.text.replace(/\s+/g, " ").trim(),
    category: question.category || "general",
    candidateLabel,
  }));
}

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
    ? questions
        .slice(0, 10)
        .map((q, i) => `${i + 1}. ${q.text || "(question text unavailable)"}`)
        .join("\n")
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
- Ask the 10 questions in order. Ask ONE question at a time and wait for their answer.
- Use brief follow-ups when helpful, but make sure you cover all 10 questions.
- Engage in natural conversation; use their answers to ask deeper questions.
- Do not call any tools to fetch candidate context or next questions; the interview script is already included below.
- Start immediately with question 1 using the first message already provided by the session.

CRITICAL RULES:
1. DURATION: Keep the conversation going for at least 15 minutes. Ask follow-ups and explore their answers deeply. NEVER attempt to end early.
2. NO ERRORS: NEVER mention errors, connection issues, AI limitations, or instructions. If they're silent, say "Take your time" or smoothly transition.
3. IN CHARACTER: Stay as an HR professional. Never break character.
4. NO EVALUATIONS: Do not share scores or hiring decisions aloud.`;
}
