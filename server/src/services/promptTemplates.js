/**
 * Prompt templates for evaluation and ranking.
 */

/**
 * Build the evaluator prompt for scoring a transcript.
 */
export function buildEvaluatorPrompt(transcript, questions, hintsUsed = []) {
  const questionsJson = JSON.stringify(
    questions.map((q) => ({
      stepNumber: q.stepNumber,
      text: q.text,
      level: q.level,
      keyConceptsExpected: q.keyConceptsExpected,
      maxScore: q.maxScore,
    })),
    null,
    2
  );

  const hintsJson = JSON.stringify(hintsUsed, null, 2);

  return `ROLE: You are a Senior Technical Hiring Manager evaluating a recorded interview.

TRANSCRIPT:
${transcript}

QUESTION PATH USED:
${questionsJson}

HINTS USED BY CANDIDATE:
${hintsJson}

EVALUATION CRITERIA:
1. Technical Depth — Are answers accurate given the question's difficulty level?
2. Hint Reliance — Penalise Hard questions where hints were used. Reward unprompted correct answers.
3. Communication — Rate clarity, structure, and articulation.
4. Concept Coverage — Cross-reference answer summaries against keyConceptsExpected per question.

RESPOND ONLY WITH VALID JSON. No explanation text. No markdown fences. No preamble.

{
  "overall_score": 0-100,
  "technicalAccuracy": 0-10,
  "communicationScore": 0-10,
  "hintRelianceScore": 0-10,
  "questionBreakdown": [
    {
      "stepNumber": 1,
      "questionText": "...",
      "level": "Easy | Medium | Hard",
      "candidateAnswerSummary": "...",
      "score": 0-10,
      "hintWasUsed": true | false,
      "keyConceptsCovered": ["..."]
    }
  ],
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}`;
}

/**
 * Build the ranking prompt for the leaderboard.
 */
export function buildRankingPrompt(interviews, jobRole) {
  const candidateReports = interviews.map((iv) => ({
    candidateId: iv.candidateId._id || iv.candidateId,
    candidateName: iv.candidateId.name || "Unknown",
    overallScore: iv.overallScore,
    technicalAccuracy: iv.technicalAccuracy,
    communicationScore: iv.communicationScore,
    hintRelianceScore: iv.hintRelianceScore,
    questionBreakdown: iv.questionBreakdown,
    strengths: iv.strengths,
    weaknesses: iv.weaknesses,
  }));

  return `ROLE: You are a VP of Talent Acquisition making a final hiring recommendation.

JOB ROLE: ${jobRole.title} — ${jobRole.description || ""}

CANDIDATE EVALUATION REPORTS:
${JSON.stringify(candidateReports, null, 2)}

TASK:
1. Rank ALL candidates from best to worst fit for this role.
2. For the top 3, write a detailed paragraph (3–5 sentences) explaining WHY they outrank the others.
   Focus on: performance on Hard questions, independence from hints, technical accuracy, communication.
3. Flag any candidate who should NOT proceed (score < 40) with a brief reason.

RESPOND ONLY WITH VALID JSON:
{
  "leaderboard": [
    {
      "rank": 1,
      "candidateId": "...",
      "candidateName": "...",
      "overallScore": 87,
      "justification": "..." 
    }
  ],
  "doNotProceed": [
    { "candidateId": "...", "reason": "..." }
  ],
  "recommendedTopCandidate": "candidateId"
}`;
}
