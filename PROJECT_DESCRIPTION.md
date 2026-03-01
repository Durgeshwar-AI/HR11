# PromptHire — Complete Project Description

---

## 1. THE USP (Unique Selling Proposition)

### What PromptHire Does That Nobody Else Does

PromptHire is **not** another applicant tracking system. It is an **AI-native, end-to-end autonomous hiring pipeline** that replaces 80% of the human hours in recruitment — from the moment a resume lands to the moment a ranked shortlist is delivered.

**The core differentiator is the agentic pipeline:**

| What Exists Today | What PromptHire Does Instead |
|---|---|
| HR manually screens 200+ resumes per opening | **Resume-Matcher-BERT** (`Om-Shandilya/resume-matcher-bert`) computes semantic embeddings of resume and job description, then uses cosine similarity + keyword/experience/education heuristics to auto-screen every resume with a detailed breakdown (0-100 score) |
| Companies schedule and conduct multiple interview rounds manually over weeks | PromptHire runs **up to 6 autonomous assessment rounds** — Resume Screening, Aptitude MCQ, Coding Challenge, Technical MCQ, AI Voice Interview, Custom Round — with no human involvement until the leaderboard. HR configures the pipeline order per job. |
| Recruiters spend hours comparing candidates in spreadsheets | **Gemini 2.0 Flash** evaluates transcripts and produces an **AI-ranked leaderboard** with justifications, "do not proceed" flags, and per-candidate strength/weakness reports |
| The recruiter has to log in, create postings, manage pipelines | PromptHire's **WhatsApp-to-Job pipeline** lets an HR manager type a natural-language message like _"I need a senior backend engineer who knows Go and Kafka, 5 rounds"_ on WhatsApp, and the job + question path is auto-created in the database within seconds |
| AI interview tools are either text-based or pre-recorded | PromptHire's **ElevenLabs Conversational AI interviewer** conducts a real-time voice interview with 20 structured HR questions, adaptive follow-ups based on candidate answers, silence handling, and personalized greetings |

**One line:** _PromptHire turns a 3-week, 40-hour-per-role hiring process into a 48-hour fully autonomous pipeline where HR only reviews the final AI-ranked shortlist._

### Why This Matters (Market Pain)

- **India alone** has 900M+ working-age adults. Naukri.com processes 15M+ applications/month. The screening bottleneck is real — average time to review one resume is **7 minutes**. For 200 applicants per role, that's **23 hours** of just reading resumes.
- The average cost-per-hire in India is **Rs.50,000-1,50,000** (source: SHRM India). 60% of that cost is human time spent on screening, scheduling, and conducting interviews.
- PromptHire collapses the marginal cost of screening a candidate to **Rs.0.5-2.0** (API inference cost), making it **50-100x cheaper** than a human recruiter's time.

---

## 2. SYSTEM ARCHITECTURE

### Tech Stack Overview

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | 20+ pages, custom brutalist design system (Barlow Condensed + DM Sans) |
| **Backend** | Express.js (Node.js ESM) + MongoDB + Mongoose | 30+ REST endpoints, JWT auth, Cloudinary uploads, email notifications |
| **Resume Screening** | HuggingFace Inference API + Resume-Matcher-BERT | Semantic embedding similarity for resume-to-job-description matching |
| **AI Voice Interview** | ElevenLabs Conversational AI (`@11labs/client`) | Real-time voice interview with dynamic prompt overrides and 20 HR questions |
| **Evaluation & Ranking** | Google Gemini 2.0 Flash | Transcript evaluation, candidate scoring, leaderboard ranking |
| **WhatsApp Integration** | Meta Business API + Groq/Llama | Natural-language job creation via WhatsApp messages |
| **File Storage** | Cloudinary (multer-storage-cloudinary) | Resume PDF/DOCX uploads with signed URLs |
| **Email** | Nodemailer + Gmail SMTP | Rejection emails, assessment link emails, notifications |
| **Agent (Scaffold)** | LiveKit Agents + Gemini 2.0 Flash Live | Multimodal interview agent with function-calling tools (scaffolded) |

### Architecture Diagram

```
+----------------------------------------------------------------------+
|                       FRONTEND (React 19 + TypeScript)               |
|  Vite + Tailwind + Custom Design System (Barlow Condensed + DM Sans)|
|  20+ pages - Auth - Dashboard - Pipeline Builder - 6 Round UIs       |
|  Candidate Portal - Interview Room (ElevenLabs client)               |
+----------------------------+-----------------------------------------+
                             | /api (Vite proxy -> :5000)
+----------------------------v-----------------------------------------+
|                      EXPRESS.JS API (Node.js ESM)                    |
|  30+ endpoints - JWT auth - Multer uploads - Helmet security         |
|  +-------------+ +--------------+ +---------------+ +------------+  |
|  | Auth Routes  | | Job/Question | | Round Routes  | |  Agent API |  |
|  | (HR + Cand.) | | CRUD Routes  | | (Apt/Code/    | | (candidate,|  |
|  |              | |              | |  Tech/Resume) | |  question,  |  |
|  +--------------+ +--------------+ +---------------+ |  conclude) |  |
|                                                       +------------+  |
|  +------------------------------------------------------------------+|
|  |                    AI SERVICE LAYER                               ||
|  |  Resume-Matcher-BERT  ->  Semantic Resume Screening (HuggingFace)||
|  |  Gemini 2.0 Flash     ->  Evaluation + Ranking                   ||
|  |  ElevenLabs Conv. AI  ->  Voice Interview (signed URL + prompt)  ||
|  |  pdf-parse + mammoth  ->  Resume Text Extraction                 ||
|  +------------------------------------------------------------------+|
|  +-------------------------+  +-----------------------------------+  |
|  |  WhatsApp Webhook       |  |  Cron: Auto-Reject + Email        |  |
|  |  (Meta Business API)    |  |  (node-cron + Nodemailer)         |  |
|  +-------------------------+  +-----------------------------------+  |
+----------------------------+-----------------------------------------+
                             |
         +-------------------+---------------------+
         v                   v                     v
+------------+    +-----------------+    +------------------+
|  MongoDB   |    |  Cloudinary     |    |  ElevenLabs      |
| (15 models)|    | (Resume files)  |    |  Conversational  |
+------------+    +-----------------+    |  AI API          |
                                         +------------------+
```

---

## 3. CORE FEATURES & FLOWS

### Flow 1: HR Creates Job -> Candidates Apply -> AI Screens -> Auto Shortlist

1. HR registers/logs in -> lands on Dashboard
2. Creates a job with title, description, skills, deadline, and **custom pipeline** (drag-and-drop round ordering)
3. Candidates browse open positions, upload resumes via Candidate Portal
4. **Resume-Matcher-BERT** screens each resume:
   - Generates semantic embeddings for both resume text and job description
   - Computes cosine similarity as the primary match signal
   - Augments with keyword overlap, experience detection, and education heuristics
   - Produces breakdown: skills (0-100), experience (0-100), education (0-100), overall (0-100), reasoning text
5. When deadline passes, cron job ranks by score -> keeps top N -> emails rejections -> deletes rejected data

### Flow 2: WhatsApp -> Job Created in 10 Seconds

1. HR sends a WhatsApp message like _"Need a React developer, 3 years experience, remote, 5 rounds"_
2. Meta webhook delivers message -> Groq/Llama parses it into structured JSON
3. JobRole + Questions auto-created in MongoDB
4. Confirmation message sent back to HR on WhatsApp

### Flow 3: Pipeline-Ordered Multi-Round Assessment

Each job has a **configurable pipeline** — HR picks which rounds to include and their order. Candidates progress through rounds in that exact order.

| Round | How It Works |
|---|---|
| **Resume Screening** | Automatic BERT-based semantic matching. No candidate action needed. |
| **Aptitude Test** | Timer-based MCQs fetched from question bank -> auto-graded -> score saved to InterviewProgress |
| **Coding Challenge** | Problem display with test cases -> code submission -> pass/fail results |
| **Technical Interview** | System design/architecture MCQs -> auto-graded |
| **AI Voice Interview** | ElevenLabs Conversational AI conducts real-time voice interview with 20 questions + adaptive follow-ups |
| **Custom Round** | Placeholder for HR-defined rounds |

Pipeline navigation is fully dynamic — the "Next Round" button always routes to the correct next stage based on the job's configured pipeline.

### Flow 4: AI Voice Interview (ElevenLabs)

1. Candidate clicks "Start Interview" -> backend fetches a **signed URL** from ElevenLabs API
2. Backend loads the job's questions from DB (or falls back to **20 default HR questions** across 4 categories: behavioural, situational, technical depth, culture fit)
3. A **dynamic system prompt** is generated with the candidate's name, job title, all questions, and follow-up instructions
4. Frontend starts `@11labs/client` session with **prompt overrides** — the AI agent receives the full interview script
5. The AI interviewer:
   - Greets the candidate by name
   - Asks 20 questions in order, one at a time
   - Asks **adaptive follow-up questions** based on the candidate's actual answers
   - Handles silence (rephrasing after 8s, skipping after 16s)
   - Wraps up professionally when complete
6. Full transcript is saved to the Interview model

### Flow 5: AI Evaluation -> Ranked Leaderboard

1. After interview, transcript is sent to Gemini 2.0 Flash
2. Gemini scores: technical accuracy (0-10), communication (0-10), hint reliance (0-10), overall (0-100)
3. Per-question breakdown with key concepts covered
4. Leaderboard API calls Gemini to rank all candidates for a job with justifications

---

## 4. DATABASE MODELS (15 Total)

| # | Model | Purpose | Key Fields |
|---|---|---|---|
| 1 | HRUser | HR/recruiter accounts | name, email, passwordHash, whatsappPhone, role, company |
| 2 | InterviewCandidate | Candidate auth accounts | name, email, passwordHash, phone, skills[], resumeUrl, resumeSummary, appliedJobs[] |
| 3 | ScreeningCandidate | Resume screening pipeline | name, email, resume{url,cloudinaryId}, screeningResults[], status |
| 4 | JobRole | Job postings with pipeline | title, description, skills[], createdBy, status, pipeline[{stageType, order, thresholdScore}], totalRounds, topN, submissionDeadline |
| 5 | Question | Interview question path | jobId, stepNumber, text, level, enableHint, hintText, keyConceptsExpected[], allowFollowUp, followUpPrompt |
| 6 | Interview | AI interview records | candidateId, jobId, transcript, overallScore, technicalAccuracy, communicationScore, questionBreakdown[], strengths[], weaknesses[], status |
| 7 | AptitudeQuestion | MCQ question bank | text, options[], correctOption, difficulty, category, tags[] |
| 8 | AptitudeAttempt | Candidate aptitude scores | jobId, candidateId, answers[], totalScore, percentage |
| 9 | CodingQuestion | Coding problem bank | title, description, testCases[], starterCode, timeLimitMs |
| 10 | CodingAttempt | Code submissions | candidateId, submissions[], totalScore |
| 11 | TechnicalQuestion | Technical MCQ bank | categories: System Design, Architecture, Databases, etc. |
| 12 | TechnicalAttempt | Technical round scores | Same structure as AptitudeAttempt |
| 13 | InterviewProgress | Multi-round tracker | jobId, candidateId, rounds[{roundName, score, status}], rank |
| 14 | Form | Simple application form | name, email, phone, resume URL, skills |
| 15 | CandidateScoring | Composite scoring | Weighted cross-round scoring |

---

## 5. API ENDPOINTS (35+)

| Group | Method | Endpoint | Purpose |
|---|---|---|---|
| **Auth** | POST | `/api/auth/hr/register` | HR registration |
| | POST | `/api/auth/hr/login` | HR login -> JWT |
| | POST | `/api/auth/candidate/register` | Candidate registration |
| | POST | `/api/auth/candidate/login` | Candidate login -> JWT |
| | PATCH | `/api/auth/hr/whatsapp` | Link WhatsApp number |
| **Jobs** | POST | `/api/jobs` | Create job with pipeline |
| | GET | `/api/jobs` | List all jobs |
| | GET | `/api/jobs/:id` | Get job + questions |
| | PUT | `/api/jobs/:id` | Update job |
| | DELETE | `/api/jobs/:id` | Archive job |
| **Questions** | POST | `/api/jobs/:jobId/questions` | Add question to path |
| | GET | `/api/jobs/:jobId/questions` | List questions |
| | PUT | `/api/jobs/:jobId/questions/:id` | Edit question |
| | DELETE | `/api/jobs/:jobId/questions/:id` | Delete question |
| | PUT | `/api/jobs/:jobId/reorder` | Reorder steps |
| **Interviews** | GET | `/api/interviews/:id` | Get interview with scores |
| | GET | `/api/interviews/job/:jobId` | All interviews for a job |
| | GET | `/api/interviews/job/:jobId/leaderboard` | AI-ranked leaderboard |
| | GET | `/api/interviews/job/:jobId/pipeline-progress` | Pipeline progress for all candidates |
| | POST | `/api/interviews/job/:jobId/shortlist-stage` | Manual stage shortlisting |
| | POST | `/api/interviews/job/:jobId/send-assessment-links` | Email assessment links to candidates |
| **ElevenLabs** | POST | `/api/interview/token` | Get signed URL + system prompt + first message for AI interview |
| **Agent** | GET | `/api/agent/candidate/:id` | Candidate context for AI agent |
| | GET | `/api/agent/question/:jobId/:step` | Fetch next question |
| | POST | `/api/agent/conclude` | Save transcript + trigger evaluation |
| **Resume** | POST | `/api/candidates/submit-and-screen` | Upload + AI screen (BERT) |
| | POST | `/api/candidates/:id/screen` | Re-screen existing candidate |
| **Candidate** | GET | `/api/candidate/jobs/active` | Browse open positions |
| | GET | `/api/candidate/me` | Get candidate profile |
| | POST | `/api/candidate/me/resume` | Upload resume to Cloudinary |
| | POST | `/api/candidate/me/apply/:jobId` | Apply to a job |
| **Aptitude** | GET | `/api/aptitude/questions` | Fetch MCQs |
| | POST | `/api/aptitude/submit` | Submit + auto-grade |
| **Coding** | GET | `/api/coding/questions` | Fetch problems |
| | POST | `/api/coding/submit` | Submit code |
| | POST | `/api/coding/finish` | Finalize round |
| **Technical** | GET | `/api/technical/questions` | Fetch technical MCQs |
| | POST | `/api/technical/submit` | Submit + auto-grade |
| **WhatsApp** | GET | `/api/whatsapp/webhook` | Meta verification |
| | POST | `/api/whatsapp/webhook` | Receive + process messages |
| **Forms** | POST | `/api/forms` | Submit application form |
| **Mail** | POST | `/api/mail/send` | Send notification emails |

---

## 6. FRONTEND PAGES (20+)

| Category | Page | Purpose |
|---|---|---|
| **Public** | RoleChoice | Landing page — "I'm a Company" / "I'm a Candidate" |
| | CompanyHome | Company-facing landing with comparison table |
| | CandidateHome | Candidate-facing landing with feature highlights |
| | HowItWorksPage | 6-step pipeline explanation + tech stack + FAQ |
| | WhyPromptHirePage | Comparison vs traditional hiring, CTA |
| **Auth** | CompanyLogin / CompanyRegister | HR auth forms |
| | CandidateLogin / CandidateRegister | Candidate auth forms |
| **Company (HR)** | CompanyDashboard | Stats, activity feed, quick actions |
| | PipelineBuilder | Drag-and-drop round ordering per job |
| | HiringLeaderboard | AI-ranked candidates with scores, flags, hire button |
| **Candidate** | CandidateProfile | Profile editing, resume upload to Cloudinary, application tracker with per-round status |
| | RecentOpenings | Browse open jobs, filter/search, apply (must have resume uploaded) |
| **Interview** | InterviewEntryPage | Pre-interview lobby with setup info |
| | InterviewPage | Live ElevenLabs voice interview with transcript, mute controls, anti-cheat indicator |
| **Rounds** | ResumeScreeningRound | AI screening results display (real candidate data) |
| | AptitudeTestRound | Timed MCQ interface with flagging |
| | CodingChallengeRound | Code editor + test case runner |
| | TechnicalInterviewRound | Technical MCQ round |
| | AIInterviewRound | AI voice interview simulation (fallback UI) |

---

## 7. AI SERVICES DETAIL

### Resume Screening — Resume-Matcher-BERT

- **Primary model:** `Om-Shandilya/resume-matcher-bert` — domain-adapted MiniLM for resume-to-job-description matching
- **Fallback model:** `sentence-transformers/all-MiniLM-L6-v2` — general-purpose sentence embeddings
- **Process:**
  1. Extract text from PDF (pdf-parse) or DOCX (mammoth)
  2. Generate embeddings for resume text and job description via HuggingFace Inference API
  3. Compute cosine similarity between the two embeddings
  4. Convert similarity (0.25-0.85 range) to a 0-100 score
  5. Augment with heuristic checks: keyword overlap (skills matching), experience detection (years regex), education detection (degree keywords)
  6. Generate reasoning text explaining the score
- **Cost:** Free (HuggingFace Inference API free tier)

### AI Voice Interview — ElevenLabs Conversational AI

- **20 default HR questions** across 4 categories:
  - Behavioural (5): career journey, challenges, conflict resolution, failure, learning agility
  - Situational (5): deadlines, team disagreements, production bugs, pushback, prioritization
  - Technical Depth (5): architecture, code quality, explanation, testing, optimization
  - Culture & Soft Skills (5): work environment, staying current, career goals, motivation, candidate questions
- **Each question has a built-in follow-up** prompt
- **Dynamic system prompt** generated per session with:
  - Candidate's name (from DB) for personalized greeting
  - Job title for context
  - All questions embedded in the prompt
  - Instructions for adaptive follow-ups based on candidate's actual answers
  - Silence handling rules (rephrase after 8s, skip after 16s)
- **Session flow:** Backend generates signed URL + prompt -> frontend passes as `overrides` to `@11labs/client` -> agent conducts the full interview
- Supports job-specific questions from DB (if HR has added custom questions)

### Evaluation & Ranking — Gemini 2.0 Flash

- Evaluates completed interview transcripts
- Scoring: technical accuracy (0-10), communication (0-10), hint reliance (0-10), overall (0-100)
- Per-question breakdown with key concepts covered
- Leaderboard ranking with justifications and "do not proceed" flags
- Fire-and-forget async evaluation (candidate doesn't wait)

---

## 8. TECH CHOICES & OPTIMIZATIONS

### Why These Specific Technologies

| Choice | The "Why" |
|---|---|
| **Resume-Matcher-BERT for screening** | Domain-adapted for resume matching. Free HuggingFace Inference API. Semantic similarity captures meaning, not just keywords. Cosine similarity is deterministic and fast. Falls back to general-purpose MiniLM if primary model is unavailable. |
| **ElevenLabs Conversational AI for interviews** | Natural-sounding voice with low latency. Supports real-time prompt overrides via signed URL sessions. The `@11labs/client` SDK handles WebSocket connections, mode changes, and transcription. No need to manage audio infrastructure. |
| **Gemini 2.0 Flash for evaluation/ranking** | Google's free tier with generous token limits. Excels at structured JSON output for score breakdowns. Low-volume use (only evaluated after interviews). |
| **MongoDB + Mongoose** | Schema flexibility for varying pipeline configurations, question structures, and score breakdowns per job. Document model maps naturally to the data. |
| **Cloudinary for resumes** | Free tier with 25 credits/month. Handles PDF/DOCX storage. `multer-storage-cloudinary` integrates directly with Express file upload middleware. |
| **Node.js (not Python) for backend** | Same language as frontend. AI-heavy work is offloaded to HuggingFace/ElevenLabs/Gemini APIs, so Python's ML ecosystem advantage doesn't apply. |
| **React 19 + Vite + Tailwind** | Vite's HMR is <50ms. Tailwind eliminates CSS files. Custom design token system (3-colour brutalist palette) ensures consistency without component libraries. |

### Performance Optimizations

| Optimization | Impact |
|---|---|
| **Lazy HuggingFace client initialization** | Server boots without API keys; client created on first call. No cold-start penalty. |
| **BERT embedding fallback chain** | If primary model fails, automatically retries with fallback model. No screening failures. |
| **Fire-and-forget evaluation** | After interview ends, evaluation runs asynchronously. Candidate doesn't wait. |
| **Resume text caching** | Once extracted, `resumeSummary` is stored on the candidate document. Re-screening doesn't re-parse the file. |
| **Pipeline progress in localStorage** | Client-side pipeline state keyed by job ID (`prompthire_job_pipeline_{jobId}`). Instant round navigation without extra API calls. |
| **Vite proxy** | Frontend dev server proxies `/api` calls to backend, eliminating CORS overhead. |
| **Dynamic interview prompt** | System prompt is built server-side with candidate name + job title + questions, then sent as overrides. No hardcoded agent configuration needed on ElevenLabs dashboard. |

---

## 9. BUSINESS VIABILITY

### Revenue Model: SaaS Subscription + Per-Hire Fee

| Tier | Monthly Price | Included | Overage |
|---|---|---|---|
| **Starter** (SMBs, 1-50 employees) | Rs.4,999/mo | 5 active job postings, 500 resume screens/mo, 20 AI interviews | Rs.50/interview, Rs.2/screen |
| **Growth** (Mid-market, 50-500 employees) | Rs.19,999/mo | 25 active postings, 5,000 screens/mo, 100 AI interviews, WhatsApp integration | Rs.30/interview, Rs.1/screen |
| **Enterprise** (500+ employees) | Custom (Rs.50,000+/mo) | Unlimited postings, custom pipelines, SSO, dedicated support, on-prem option | Volume discounts |

### Cost Analysis Per Hire

| Step | API Cost | Human Time Replaced |
|---|---|---|
| Resume screening (200 candidates x BERT) | **Rs.0** (free tier) | 23 hours of manual reading |
| Aptitude test (50 shortlisted) | **Rs.0** (self-graded) | 5 hours of test administration |
| Coding challenge (30 remaining) | **Rs.0** (self-graded) | 8 hours of code review |
| AI Voice Interview (15 finalists x ElevenLabs) | **~Rs.100-300** (at scale) | 15 hours of interviewing |
| Evaluation + Ranking (Gemini) | **~Rs.0-20** (at scale) | 3 hours of deliberation |
| **TOTAL** | **Rs.0-320 per hire** | **54 hours of HR time saved** |

### Target Customers

1. **Indian IT Services (50-500 employees)** — hire 50-200/quarter, HR teams spend 70% on screening
2. **High-Growth Startups (Series A-C)** — scaling engineering teams, CTOs doing interviews
3. **RPO Firms (Randstad, TeamLease)** — razor-thin margins, need 10x throughput

---

## 10. ENVIRONMENT VARIABLES

```env
PORT=5000
DISABLE_AUTH=true

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hr11

# JWT
JWT_SECRET=your_jwt_secret_here

# Cloudinary (resume file storage)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# HuggingFace (Resume-Matcher-BERT for semantic screening)
HF_API_TOKEN=...

# Google Gemini (evaluation + ranking)
GEMINI_API_KEY=...
GEMINI_EVAL_MODEL=gemini-2.0-flash

# ElevenLabs (Conversational AI voice interview)
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...

# Groq (WhatsApp NLP parsing — optional)
GROQ_API_KEY=...

# Internal agent key
AGENT_INTERNAL_API_KEY=...

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASS=...
```

---

## 11. GETTING STARTED

```bash
# 1. Start MongoDB
mongod --dbpath /data/db

# 2. Backend
cd server
npm install
cp .env.example .env   # Fill in API keys
npm run dev             # Starts on :5000

# 3. Frontend
cd frontend-test
npm install
npm run dev             # Starts on :5173, proxies /api -> :5000

# 4. (Optional) LiveKit Agent
cd agent
npm install
npx tsx src/index.ts
```

---

_Three AI models. 20 HR questions with adaptive follow-ups. Zero human intervention from resume to ranked shortlist._
