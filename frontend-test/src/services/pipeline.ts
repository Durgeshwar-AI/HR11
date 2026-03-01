/* ── Pipeline progress helpers ────────────────────────────────────
   Persists candidate round progress in localStorage so the profile
   page can display a tracker and candidates can resume where they
   left off.

   Supports both a legacy hardcoded pipeline and **job-specific**
   pipelines that follow the exact order configured by HR.
   ─────────────────────────────────────────────────────────────── */

export type RoundStatus = "completed" | "current" | "locked";

export interface PipelineRound {
  key: string;
  label: string;
  icon: string;
  path: string;
  status: RoundStatus;
}

/* ── Stage-type → route / icon / label maps ──────────────────── */

export const STAGE_ROUTE_MAP: Record<string, string> = {
  resume_screening: "/round/resume-screening",
  aptitude_test: "/round/aptitude-test",
  coding_challenge: "/round/coding-challenge",
  ai_voice_interview: "/interview-entry",
  technical_interview: "/round/technical-interview",
  custom_round: "/candidate-profile",
};

const STAGE_ICONS: Record<string, string> = {
  resume_screening: "",
  aptitude_test: "",
  coding_challenge: "",
  ai_voice_interview: "",
  technical_interview: "",
  custom_round: "",
};

const STAGE_LABELS: Record<string, string> = {
  resume_screening: "Resume Screening",
  aptitude_test: "Aptitude Test",
  coding_challenge: "Coding Challenge",
  ai_voice_interview: "AI Voice Interview",
  technical_interview: "Technical Interview",
  custom_round: "Custom Round",
};

/* ── Legacy default pipeline (kept for backward compat) ───────── */

const PIPELINE_KEY = "hr11_pipeline_progress";

const DEFAULT_ROUNDS: Omit<PipelineRound, "status">[] = [
  { key: "resume",        label: "Resume Screening",    icon: "", path: "/round/resume-screening" },
  { key: "aptitude",      label: "Aptitude Test",       icon: "", path: "/round/aptitude-test" },
  { key: "coding",        label: "Coding Challenge",    icon: "", path: "/round/coding-challenge" },
  { key: "ai-interview",  label: "AI Voice Interview",  icon: "", path: "/interview-entry" },
  { key: "technical",     label: "Technical Interview", icon: "", path: "/round/technical-interview" },
];

export function getDefaultPipeline(): PipelineRound[] {
  return DEFAULT_ROUNDS.map((r) => ({ ...r, status: "locked" as RoundStatus }));
}

export function loadPipeline(): PipelineRound[] {
  try {
    const raw = localStorage.getItem(PIPELINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PipelineRound[];
      if (Array.isArray(parsed) && parsed.length === DEFAULT_ROUNDS.length) {
        return parsed;
      }
    }
  } catch { /* fall through */ }
  return getDefaultPipeline();
}

function savePipeline(rounds: PipelineRound[]) {
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(rounds));
}

/**
 * Mark a round as "current" (i.e. the candidate has entered it).
 * All previous rounds stay completed; future rounds stay locked.
 */
export function startRound(roundKey: string): PipelineRound[] {
  const pipeline = loadPipeline();
  const idx = pipeline.findIndex((r) => r.key === roundKey);
  if (idx < 0) return pipeline;

  pipeline.forEach((r, i) => {
    if (i < idx) r.status = "completed";
    else if (i === idx) r.status = "current";
    else r.status = "locked";
  });

  savePipeline(pipeline);
  return pipeline;
}

/**
 * Mark a round as "completed" and advance the next round to "current".
 * If it was the last round, everything is "completed".
 */
export function completeRound(roundKey: string): PipelineRound[] {
  const pipeline = loadPipeline();
  const idx = pipeline.findIndex((r) => r.key === roundKey);
  if (idx < 0) return pipeline;

  pipeline[idx].status = "completed";

  // Advance the next round to "current"
  if (idx + 1 < pipeline.length) {
    pipeline[idx + 1].status = "current";
  }

  savePipeline(pipeline);
  return pipeline;
}

/** Reset pipeline (e.g. for a new application). */
export function resetPipeline(): PipelineRound[] {
  const fresh = getDefaultPipeline();
  savePipeline(fresh);
  return fresh;
}

/* ═════════════════════════════════════════════════════════════════
   Job-specific pipeline support
   ═══════════════════════════════════════════════════════════════ */

/** Shape of a pipeline stage as returned by the backend */
export interface JobPipelineStage {
  stageType: string;
  stageName?: string;
  order: number;
}

function jobPipelineKey(jobId: string) {
  return `hr11_job_pipeline_${jobId}`;
}

/**
 * Store a job's pipeline stages in localStorage (keyed by jobId).
 * Call this when loading application data from backend so round
 * pages can later look up the correct next round.
 */
export function initJobPipeline(
  jobId: string,
  stages: JobPipelineStage[],
): PipelineRound[] {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const rounds: PipelineRound[] = sorted.map((s) => ({
    key: s.stageType,
    label: s.stageName || STAGE_LABELS[s.stageType] || s.stageType,
    icon: STAGE_ICONS[s.stageType] || "",
    path: STAGE_ROUTE_MAP[s.stageType] || "/candidate-profile",
    status: "locked" as RoundStatus,
  }));
  localStorage.setItem(jobPipelineKey(jobId), JSON.stringify(rounds));
  return rounds;
}

/** Load a job's pipeline from localStorage. */
export function loadJobPipeline(jobId: string): PipelineRound[] | null {
  try {
    const raw = localStorage.getItem(jobPipelineKey(jobId));
    return raw ? (JSON.parse(raw) as PipelineRound[]) : null;
  } catch {
    return null;
  }
}

/**
 * Get the navigation path for the **next** round after `currentStageType`
 * in a specific job's pipeline.
 *
 * Returns `null` when no pipeline is stored for the job, or when the
 * current stage is the last one.  The returned path already includes
 * `?jobId=…` so callers can navigate directly.
 */
export function getNextRoundPath(
  jobId: string,
  currentStageType: string,
): string | null {
  const pipeline = loadJobPipeline(jobId);
  if (!pipeline || pipeline.length === 0) return null;

  // Find the *first* occurrence of this stageType that hasn't been passed yet.
  // (Handles pipelines with repeated stage types.)
  const idx = pipeline.findIndex((r) => r.key === currentStageType);
  if (idx < 0 || idx >= pipeline.length - 1) return null;

  const next = pipeline[idx + 1];
  return `${next.path}?jobId=${jobId}`;
}

/**
 * Human-readable label of the next round (for button text).
 */
export function getNextRoundLabel(
  jobId: string,
  currentStageType: string,
): string | null {
  const pipeline = loadJobPipeline(jobId);
  if (!pipeline || pipeline.length === 0) return null;

  const idx = pipeline.findIndex((r) => r.key === currentStageType);
  if (idx < 0 || idx >= pipeline.length - 1) return null;

  return pipeline[idx + 1].label;
}
