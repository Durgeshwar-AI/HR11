import cron from "node-cron";
import JobRole from "../models/JobRole.model.js";
import ScreeningCandidate from "../models/candidate.screening.model.js";
import InterviewProgress from "../models/InterviewProgress.model.js";
import { sendRejectionEmail } from "./mail.services.js";

function buildRoundSkeleton(totalRounds = 0) {
  const safeCount = Math.max(Number(totalRounds) || 0, 0);
  return Array.from({ length: safeCount }, (_, idx) => ({
    roundNumber: idx + 1,
    roundName: `Round ${idx + 1}`,
    score: null,
    status: "Pending",
    updatedAt: null,
  }));
}

async function upsertInterviewProgress(job, candidates = []) {
  if (!candidates.length) return;

  const totalRounds = job.totalRounds ?? 0;

  await Promise.all(
    candidates.map((candidate, idx) => {
      const rounds = buildRoundSkeleton(totalRounds).map((round) => ({
        ...round,
      }));

      return InterviewProgress.findOneAndUpdate(
        {
          candidateId: candidate._id,
          jobId: job._id,
        },
        {
          candidateName: candidate.name || "Candidate",
          candidateEmail: candidate.email || "",
          candidateScore: candidate._bestScore ?? 0,
          totalRounds,
          rounds,
          status: totalRounds > 0 ? "Pending" : "Completed",
          rank: candidate._rank ?? idx + 1,
        },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }),
  );
}

/**
 * Process a single job that has passed its submission deadline:
 *   1. Screen any remaining "pending" candidates (skip — they missed the window).
 *   2. Rank all "screened" candidates by score.
 *   3. Shortlist the top N, email + delete the rest.
 *   4. Mark autoRejectionDone on the job so it's never processed again.
 */
async function processJobAutoReject(job) {
  const jobId = job._id.toString();
  const jobTitle = job.title;
  const topN = job.topN || 5;

  console.log(
    `[AutoReject] Processing job "${jobTitle}" (${jobId}) — deadline was ${job.submissionDeadline}`,
  );

  // ── Mark any still-pending candidates as rejected (they missed the deadline) ──
  const pending = await ScreeningCandidate.find({
    jobId,
    status: "pending",
  }).lean();
  if (pending.length > 0) {
    await Promise.allSettled(
      pending.map((c) =>
        c.email
          ? sendRejectionEmail(c.email, c.name, jobTitle)
          : Promise.resolve(),
      ),
    );
    await ScreeningCandidate.deleteMany({
      _id: { $in: pending.map((c) => c._id) },
    });
    console.log(
      `[AutoReject] jobId=${jobId} — ${pending.length} pending candidate(s) rejected (missed deadline)`,
    );
  }

  // ── Rank screened candidates ───────────────────────────────────
  const candidates = await ScreeningCandidate.find({
    jobId,
    status: "screened",
  }).lean();

  if (candidates.length === 0) {
    await JobRole.findByIdAndUpdate(jobId, {
      autoRejectionDone: true,
      status: "Closed",
    });
    console.log(
      `[AutoReject] jobId=${jobId} — no screened candidates, job closed`,
    );
    return;
  }

  const ranked = candidates
    .map((c) => {
      const latest = c.screeningResults?.[c.screeningResults.length - 1];
      return { ...c, _bestScore: latest?.score ?? 0 };
    })
    .sort((a, b) => b._bestScore - a._bestScore);

  const kept = ranked.slice(0, topN);
  const rejected = ranked.slice(topN);
  const keptWithRank = kept.map((candidate, index) => ({
    ...candidate,
    _rank: index + 1,
  }));

  // ── Shortlist top N ────────────────────────────────────────────
  if (keptWithRank.length > 0) {
    await ScreeningCandidate.bulkWrite(
      keptWithRank.map((candidate) => ({
        updateOne: {
          filter: { _id: candidate._id },
          update: {
            $set: {
              status: "shortlisted",
              shortlistRank: candidate._rank,
            },
          },
        },
      })),
    );

    await upsertInterviewProgress(job, keptWithRank);
  }

  // ── Reject & email the rest ────────────────────────────────────
  if (rejected.length > 0) {
    const emailResults = await Promise.allSettled(
      rejected.map((c) =>
        c.email
          ? sendRejectionEmail(c.email, c.name, jobTitle)
          : Promise.resolve(),
      ),
    );

    const failedEmails = emailResults
      .map((r, i) => (r.status === "rejected" ? rejected[i].email : null))
      .filter(Boolean);

    if (failedEmails.length > 0) {
      console.warn(
        `[AutoReject] Failed to email ${failedEmails.length} candidate(s):`,
        failedEmails,
      );
    }

    const rejectedIds = rejected.map((c) => c._id);
    await ScreeningCandidate.updateMany(
      { _id: { $in: rejectedIds } },
      { $set: { status: "rejected" } },
    );
    await ScreeningCandidate.deleteMany({ _id: { $in: rejectedIds } });
  }

  // ── Mark the job as processed ──────────────────────────────────
  await JobRole.findByIdAndUpdate(jobId, {
    autoRejectionDone: true,
    ...(keptWithRank.length === 0 && { status: "Closed" }),
  });

  console.log(
    `[AutoReject] jobId=${jobId} — kept ${keptWithRank.length}, rejected & deleted ${rejected.length}`,
  );
}

/**
 * Scans for all jobs whose submissionDeadline has passed and
 * autoRejectionDone is still false, then processes each one.
 */
async function runScheduledAutoReject() {
  try {
    const now = new Date();

    const expiredJobs = await JobRole.find({
      submissionDeadline: { $lte: now },
      autoRejectionDone: false,
      status: { $ne: "Closed" },
    });

    if (expiredJobs.length === 0) return;

    console.log(
      `[AutoReject] Found ${expiredJobs.length} expired job(s) to process`,
    );

    for (const job of expiredJobs) {
      await processJobAutoReject(job);
    }
  } catch (err) {
    console.error("[AutoReject] Scheduled run error:", err);
  }
}

function startAutoRejectScheduler() {
  const cronExpr = process.env.AUTO_REJECT_CRON || "0 * * * *";

  console.log(`[AutoReject] Scheduler started — cron: "${cronExpr}"`);

  // Run once immediately on boot so any already-expired jobs are handled
  runScheduledAutoReject();

  // Then keep running on the cron schedule
  cron.schedule(cronExpr, () => {
    runScheduledAutoReject();
  });
}

export { startAutoRejectScheduler, runScheduledAutoReject };
