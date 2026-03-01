export const ROUNDS = [
  { id:"resume_screening",    label:"Resume Screening",    icon:"", tag:"AI",          duration:"Instant",   agents:["Resume Parser","Bias Filter"] },
  { id:"aptitude_test",       label:"Aptitude Test",       icon:"", tag:"Assessment",  duration:"30–45 min", agents:["Test Gen","Auto Grader"] },
  { id:"coding_challenge",    label:"Coding Challenge",    icon:"", tag:"Technical",   duration:"1–2 hrs",   agents:["Code Eval","Anti-Cheat"] },
  { id:"ai_voice_interview",  label:"AI Voice Interview",  icon:"", tag:"Vapi",        duration:"20–30 min", agents:["Voice AI","Sentiment AI"] },
  { id:"technical_interview", label:"Technical Interview", icon:"", tag:"Human",       duration:"45–60 min", agents:["Scheduler","Feedback Bot"] },
  { id:"custom_round",        label:"Custom Round",        icon:"", tag:"Custom",      duration:"—",           agents:["Your Tools"] },
];

export const MOCK_CANDIDATES = [
  { id:1, name:"Arjun Mehta",    score:94, status:"shortlisted", round:"AI Voice Interview",  avatar:"AM", skills:["React","Node","AWS"],      appliedDate:"2 days ago" },
  { id:2, name:"Priya Sharma",   score:91, status:"shortlisted", round:"Technical Interview", avatar:"PS", skills:["Python","ML","FastAPI"],   appliedDate:"3 days ago" },
  { id:3, name:"Rohan Das",      score:88, status:"in_progress", round:"Coding Challenge",    avatar:"RD", skills:["Go","Docker","K8s"],       appliedDate:"1 day ago" },
  { id:4, name:"Sneha Iyer",     score:85, status:"in_progress", round:"Aptitude Test",       avatar:"SI", skills:["Java","Spring","SQL"],     appliedDate:"4 days ago" },
  { id:5, name:"Vikram Nair",    score:82, status:"pending",     round:"Resume Screening",    avatar:"VN", skills:["Flutter","Dart","Firebase"],appliedDate:"5 days ago" },
  { id:6, name:"Ananya Roy",     score:79, status:"pending",     round:"Resume Screening",    avatar:"AR", skills:["Vue","TypeScript","SCSS"],  appliedDate:"5 days ago" },
  { id:7, name:"Kiran Patel",    score:75, status:"rejected",    round:"Coding Challenge",    avatar:"KP", skills:["PHP","Laravel","MySQL"],    appliedDate:"6 days ago" },
];

export const MOCK_OPENINGS = [
  { id:1, title:"Senior Backend Engineer",  department:"Engineering", applicants:47, shortlisted:8,  status:"active",   posted:"5 days ago",  pipeline:["resume_screening","aptitude_test","coding_challenge","technical_interview"] },
  { id:2, title:"Product Designer",         department:"Design",      applicants:31, shortlisted:5,  status:"active",   posted:"3 days ago",  pipeline:["resume_screening","ai_voice_interview"] },
  { id:3, title:"ML Engineer",              department:"AI/ML",       applicants:28, shortlisted:4,  status:"paused",   posted:"8 days ago",  pipeline:["resume_screening","coding_challenge","technical_interview"] },
  { id:4, title:"DevOps Lead",              department:"Infrastructure",applicants:19,shortlisted:3, status:"active",   posted:"1 day ago",   pipeline:["resume_screening","aptitude_test","technical_interview"] },
];

export const MOCK_STATS = {
  totalApplicants: 247,
  activeOpenings:  12,
  shortlisted:     38,
  hiredThisMonth:  6,
  avgTimeToHire:   "14 days",
  pipelineHealth:  84,
};

export const WHY_POINTS = [
  { icon:"", title:"10× Faster Screening",    desc:"AI agents scan 1,000 resumes in the time it takes a human to read 10. No bottlenecks." },
  { icon:"", title:"Zero Bias Guaranteed",    desc:"Demographic data is redacted before any scoring. Candidates win on merit — nothing else." },
  { icon:"", title:"Real Voice Interviews",   desc:"Vapi-powered AI conducts natural voice interviews, generating unique questions from each resume." },
  { icon:"", title:"Anti-Cheat Built In",      desc:"Audio pattern analysis detects scripted reading or external aids in real time." },
  { icon:"", title:"Full Score Reports",       desc:"Every candidate gets a technical depth score, communication rating, and red-flag summary." },
  { icon:"", title:"Auto-Calendar Sync",       desc:"Winners are scheduled directly into Google or Outlook. Zero manual coordination." },
];

export const HOW_IT_WORKS_STEPS = [
  { num:"01", title:"Company Designs the Pipeline", desc:"HR picks rounds, sets criteria, and drags the flow into order in under 5 minutes.", icon:"" },
  { num:"02", title:"Job Goes Live",                desc:"The opening is published. AI immediately begins sourcing from job boards and databases.", icon:"" },
  { num:"03", title:"AI Screens Resumes",           desc:"LlamaParse parses PDFs into structured data. The Bias Filter hides demographics before scoring.", icon:"" },
  { num:"04", title:"Agents Debate Each Candidate", desc:"A Recruiter Agent and Tech Lead Agent debate fit based on project depth, not keywords.", icon:"" },
  { num:"05", title:"Voice Interview Conducted",    desc:"Vapi dials in. The AI asks adaptive, resume-specific questions. Anti-cheat monitors in real time.", icon:"" },
  { num:"06", title:"HR Reviews the Leaderboard",   desc:"A ranked dashboard shows every candidate with scores, red flags, and a one-click hire button.", icon:"" },
];
