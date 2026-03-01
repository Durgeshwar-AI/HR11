/* ─── Central API helper ─────────────────────────────────────────
   All backend calls go through here so auth tokens, base URL, and
   error handling are in one place.
   ──────────────────────────────────────────────────────────────── */

const BASE = "/api"; // proxied by Vite → http://localhost:5000/api

type ErrorBody = { error?: string };
type JobMutationPayload = Record<string, unknown>;
type StoredUser = { _id?: string; [key: string]: unknown };

function getErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const maybeError = (body as ErrorBody).error;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }
  }
  return fallback;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("prompthire_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(opts.headers as Record<string, string>),
    },
    ...opts,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(getErrorMessage(body, res.statusText));
  return body as T;
}

/* helper that omits Content-Type for FormData uploads */
async function upload<T = unknown>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(body, res.statusText));
  return body as T;
}

/* ─── Auth ─────────────────────────────────────────────────────── */

export const authApi = {
  hrRegister: (data: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }) =>
    request("/auth/hr/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  hrLogin: (data: { email: string; password: string }) =>
    request("/auth/hr/login", { method: "POST", body: JSON.stringify(data) }),

  // Candidate auth — if your backend adds these endpoints later, they're ready
  candidateRegister: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) =>
    request("/auth/candidate/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  candidateLogin: (data: { email: string; password: string }) =>
    request("/auth/candidate/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  hrProfile: () =>
    request<{
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        company?: string;
        whatsappPhone?: string;
      };
    }>("/auth/hr/me"),
};

/* ─── Jobs ─────────────────────────────────────────────────────── */

export const jobsApi = {
  list: (status?: string) =>
    request(`/jobs${status ? `?status=${status}` : ""}`),

  get: (id: string) => request(`/jobs/${id}`),

  create: (data: JobMutationPayload) =>
    request("/jobs", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: JobMutationPayload) =>
    request(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  archive: (id: string) => request(`/jobs/${id}`, { method: "DELETE" }),

  // ── Pipeline management ────────────────────────────────────────
  getPipeline: (id: string) => request(`/jobs/${id}/pipeline`),

  schedulePipeline: (id: string, startDate?: string) =>
    request(`/jobs/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify({ startDate }),
    }),
};

/* ─── Resume / Screening ──────────────────────────────────────── */

export const resumeApi = {
  submitAndScreen: (form: FormData) =>
    upload("/candidates/submit-and-screen", form),

  screenExisting: (
    candidateId: string,
    data: { jobTitle: string; jobDescription: string; jobId?: string },
  ) =>
    request(`/candidates/${candidateId}/screen`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ─── Aptitude ─────────────────────────────────────────────────── */

export const aptitudeApi = {
  getQuestions: (params?: {
    limit?: number;
    difficulty?: string;
    category?: string;
    jobId?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.difficulty) sp.set("difficulty", params.difficulty);
    if (params?.category) sp.set("category", params.category);
    if (params?.jobId) sp.set("jobId", params.jobId);
    return request(`/aptitude/questions?${sp}`);
  },

  submit: (data: {
    jobId: string;
    candidateId: string;
    answers: { questionId: string; selectedOption: number }[];
  }) =>
    request("/aptitude/submit", { method: "POST", body: JSON.stringify(data) }),
};

/* ─── Coding Challenge ─────────────────────────────────────────── */

export const codingApi = {
  getQuestions: (params?: {
    limit?: number;
    difficulty?: string;
    tag?: string;
    jobId?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.difficulty) sp.set("difficulty", params.difficulty);
    if (params?.tag) sp.set("tag", params.tag);
    if (params?.jobId) sp.set("jobId", params.jobId);
    return request(`/coding/questions?${sp}`);
  },

  submit: (data: {
    jobId: string;
    candidateId: string;
    questionId: string;
    language: string;
    code: string;
  }) =>
    request("/coding/submit", { method: "POST", body: JSON.stringify(data) }),

  finish: (data: { jobId: string; candidateId: string }) =>
    request("/coding/finish", { method: "POST", body: JSON.stringify(data) }),
};

/* ─── Technical Interview ──────────────────────────────────────── */

export const technicalApi = {
  getQuestions: (params?: {
    limit?: number;
    difficulty?: string;
    category?: string;
    jobId?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.difficulty) sp.set("difficulty", params.difficulty);
    if (params?.category) sp.set("category", params.category);
    if (params?.jobId) sp.set("jobId", params.jobId);
    return request(`/technical/questions?${sp}`);
  },

  submit: (data: {
    jobId: string;
    candidateId: string;
    answers: { questionId: string; selectedOption: number }[];
  }) =>
    request("/technical/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ─── Interviews / Leaderboard ────────────────────────────────── */

export const interviewsApi = {
  getByJob: (jobId: string) => request(`/interviews/job/${jobId}`),

  get: (interviewId: string) => request(`/interviews/${interviewId}`),

  leaderboard: (jobId: string) =>
    request(`/interviews/job/${jobId}/leaderboard`),

  // Pipeline progress
  pipelineProgress: (jobId: string) =>
    request(`/interviews/job/${jobId}/pipeline-progress`),

  candidateProgress: (candidateId: string, jobId: string) =>
    request(`/interviews/progress/${candidateId}/job/${jobId}`),

  shortlistStage: (jobId: string, roundNumber: number) =>
    request(`/interviews/job/${jobId}/shortlist-stage`, {
      method: "POST",
      body: JSON.stringify({ roundNumber }),
    }),

  // ── Assessment link sending ────────────────────────────────────

  /** Send assessment links to ALL eligible candidates for a specific round */
  sendAssessmentLinks: (
    jobId: string,
    roundNumber: number,
    customMessage?: string,
  ) =>
    request(`/interviews/job/${jobId}/send-assessment-links`, {
      method: "POST",
      body: JSON.stringify({ roundNumber, customMessage }),
    }),

  /** Send assessment link to a SINGLE candidate for a specific round */
  sendAssessmentLink: (
    jobId: string,
    candidateId: string,
    roundNumber: number,
    customMessage?: string,
  ) =>
    request(`/interviews/job/${jobId}/send-assessment-link/${candidateId}`, {
      method: "POST",
      body: JSON.stringify({ roundNumber, customMessage }),
    }),
};

/* ─── ElevenLabs Interview Session ────────────────────────────── */

export const interviewSessionApi = {
  /** Get a signed URL to start an ElevenLabs Conversational AI session */
  startSession: (jobId: string) =>
    request<{
      signedUrl: string;
      agentId: string;
      interviewId: string;
      systemPrompt: string;
      firstMessage: string;
      questionCount: number;
      metadata: Record<string, string>;
    }>("/interview/token", {
      method: "POST",
      body: JSON.stringify({ jobId, mode: "interview" }),
    }),
};

/* ─── Candidate Portal ─────────────────────────────────────────── */

export interface ActiveJob {
  id: string;
  title: string;
  description: string;
  skills: string[];
  company: string;
  totalRounds: number;
  pipeline: string[];
  deadline: string | null;
  createdAt: string;
}

export interface RoundProgress {
  roundNumber: number;
  roundName: string;
  stageType: string | null;
  score: number | null;
  passed: boolean | null;
  status: "Pending" | "InProgress" | "Completed" | "Skipped";
}

export interface ApplicationProgress {
  status: "Pending" | "InProgress" | "Completed";
  rounds: RoundProgress[];
  candidateScore: number;
  rank: number | null;
}

export interface MyApplication {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
  jobStatus: string;
  totalRounds: number;
  pipeline: { stageType: string; stageName: string; order: number }[];
  screeningScore: number | null;
  screeningStatus: string;
  appliedAt: string;
  progress: ApplicationProgress | null;
}

export interface CandidateMe {
  _id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  resumeUrl: string;
  resumeSummary: string | null;
  appliedJobs: {
    _id: string;
    title: string;
    description?: string;
    skills?: string[];
    status?: string;
    totalRounds?: number;
  }[];
  createdAt: string;
}

export const candidateApi = {
  /** Public — no auth required */
  activeJobs: () => request<ActiveJob[]>("/candidate/jobs/active"),

  /** Get logged-in candidate profile */
  me: () => request<CandidateMe>("/candidate/me"),

  /** Update candidate profile */
  updateProfile: (data: { name?: string; phone?: string; skills?: string[] }) =>
    request<CandidateMe>("/candidate/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Upload / replace resume (returns { resumeUrl, message }) */
  uploadResume: (file: File) => {
    const form = new FormData();
    form.append("resume", file);
    return upload<{ resumeUrl: string; message: string }>(
      "/candidate/me/resume",
      form,
    );
  },

  /** Get all my applications with progress */
  myApplications: () =>
    request<{ applications: MyApplication[] }>("/candidate/my-applications"),

  /** Get my progress for a specific job */
  myProgress: (jobId: string) =>
    request<{ progress: ApplicationProgress | null }>(
      `/candidate/my-progress/${jobId}`,
    ),
};

/* ─── Token helpers ───────────────────────────────────────────── */

export function saveAuth(token: string, user: StoredUser) {
  localStorage.setItem("prompthire_token", token);
  localStorage.setItem("prompthire_user", JSON.stringify(user));
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("prompthire_user");
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem("prompthire_token");
}

export function clearAuth() {
  localStorage.removeItem("prompthire_token");
  localStorage.removeItem("prompthire_user");
}

export function isLoggedIn() {
  return !!localStorage.getItem("prompthire_token");
}
