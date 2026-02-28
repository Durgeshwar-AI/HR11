/**
 * ROUNDS
 * All available hiring pipeline stages.
 * Each round can be added once to a pipeline.
 *
 * Shape: {
 *   id:        string   — unique key, used as the backend round_id
 *   label:     string   — display name
 *   icon:      string   — emoji icon
 *   tag:       string   — category badge (AI / Assessment / Technical / Human / Vapi / Verification / Closing)
 *   duration:  string   — estimated time
 *   agents:    string[] — AI agents / humans involved
 * }
 */
export const ROUNDS = [
  {
    id:       "resume_screening",
    label:    "Resume Screening",
    icon:     "📄",
    tag:      "AI",
    duration: "Instant",
    agents:   ["Resume Parser", "Bias Filter"],
  },
  {
    id:       "aptitude_test",
    label:    "Aptitude Test",
    icon:     "🧠",
    tag:      "Assessment",
    duration: "30–45 min",
    agents:   ["Test Gen", "Auto Grader"],
  },
  {
    id:       "coding_challenge",
    label:    "Coding Challenge",
    icon:     "💻",
    tag:      "Technical",
    duration: "1–2 hrs",
    agents:   ["Code Eval", "Anti-Cheat"],
  },
  {
    id:       "ai_voice_interview",
    label:    "AI Voice Interview",
    icon:     "🎙️",
    tag:      "Vapi",
    duration: "20–30 min",
    agents:   ["Voice AI", "Sentiment AI"],
  },
  {
    id:       "technical_interview",
    label:    "Technical Interview",
    icon:     "⚙️",
    tag:      "Human",
    duration: "45–60 min",
    agents:   ["Scheduler", "Feedback Bot"],
  },
  {
    id:       "hr_round",
    label:    "HR Round",
    icon:     "🤝",
    tag:      "Human",
    duration: "30 min",
    agents:   ["HR Bot", "Offer Gen"],
  },
  {
    id:       "group_discussion",
    label:    "Group Discussion",
    icon:     "👥",
    tag:      "Assessment",
    duration: "45 min",
    agents:   ["GD Mod", "Leader Score"],
  },
  {
    id:       "background_check",
    label:    "Background Check",
    icon:     "🔍",
    tag:      "Verification",
    duration: "1–3 days",
    agents:   ["Verify Bot", "Risk AI"],
  },
  {
    id:       "final_offer",
    label:    "Offer & Onboarding",
    icon:     "🎉",
    tag:      "Closing",
    duration: "Instant",
    agents:   ["Offer Gen", "Onboard Bot"],
  },
];
