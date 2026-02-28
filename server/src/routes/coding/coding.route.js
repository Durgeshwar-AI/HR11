import express from "express";
import mongoose from "mongoose";
import { authenticateAgent } from "../../middleware/auth.js";
import CodingQuestion from "../../models/CodingQuestion.model.js";
import CodingAttempt from "../../models/CodingAttempt.model.js";
import JobRole from "../../models/JobRole.model.js";
import ScreeningCandidate from "../../models/candidate.screening.model.js";
import { updateRoundScore } from "../../services/interviewProgress.service.js";

const router = express.Router();

const DIFFICULTY_WEIGHT = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

// ── GET /questions — fetch coding problems ──────────────────────
router.get("/questions", authenticateAgent, async (req, res) => {
  try {
    const { limit = 3, difficulty, tag, jobId } = req.query;
    const parsedLimit = Math.max(1, Math.min(Number(limit) || 3, 20));

    const match = {};
    if (difficulty) match.difficulty = difficulty;
    if (tag) match.tags = tag;
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      match.$or = [
        { jobIds: new mongoose.Types.ObjectId(jobId) },
        { jobIds: { $size: 0 } },
      ];
    }

    let questions = [];
    try {
      questions = await CodingQuestion.aggregate([
        { $match: Object.keys(match).length ? match : {} },
        { $sample: { size: parsedLimit } },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            difficulty: 1,
            tags: 1,
            constraints: 1,
            examples: 1,
            starterCode: 1,
            timeLimitMs: 1,
            memoryLimitMb: 1,
            // hide test cases from candidate
          },
        },
      ]);
    } catch {
      questions = await CodingQuestion.find(match)
        .limit(parsedLimit)
        .select("-testCases -createdBy -jobIds")
        .lean();
    }

    res.json({ questions });
  } catch (err) {
    console.error("Coding questions error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /submit — evaluate a single question submission ────────
router.post("/submit", authenticateAgent, async (req, res) => {
  try {
    const { jobId, candidateId, questionId, language, code } = req.body;

    if (!jobId || !candidateId || !questionId) {
      return res
        .status(400)
        .json({ error: "jobId, candidateId, and questionId are required" });
    }
    if (!code || !language) {
      return res
        .status(400)
        .json({ error: "code and language are required" });
    }

    // Fetch question with test cases
    const question = await CodingQuestion.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // ── Mock execution engine ──────────────────────────────────
    // In production this would call a sandboxed code runner.
    // For now we simulate results.
    const totalTestCases = question.testCases.length;
    const passed = Math.floor(Math.random() * (totalTestCases + 1));
    const runtimeMs = Math.floor(40 + Math.random() * 200);
    const memoryMb = (30 + Math.random() * 30).toFixed(1);

    const status =
      passed === totalTestCases
        ? "Accepted"
        : passed === 0
          ? "Wrong Answer"
          : "Wrong Answer";

    const weight = DIFFICULTY_WEIGHT[question.difficulty] || 1;
    const questionScore =
      passed === totalTestCases ? weight * 10 : Math.round((passed / totalTestCases) * weight * 10);

    const submission = {
      questionId: question._id,
      language,
      code,
      testCasesPassed: passed,
      totalTestCases,
      runtime: `${runtimeMs} ms`,
      memory: `${memoryMb} MB`,
      status,
      score: questionScore,
      submittedAt: new Date(),
    };

    // Upsert attempt, push submission
    const attempt = await CodingAttempt.findOneAndUpdate(
      { jobId, candidateId },
      {
        $push: { submissions: submission },
        $setOnInsert: { jobId, candidateId, startedAt: new Date() },
      },
      { new: true, upsert: true },
    );

    // Recompute totals from all submissions (best per question)
    const bestByQuestion = new Map();
    for (const sub of attempt.submissions) {
      const qKey = sub.questionId.toString();
      if (!bestByQuestion.has(qKey) || sub.score > bestByQuestion.get(qKey)) {
        bestByQuestion.set(qKey, sub.score);
      }
    }

    const totalScore = [...bestByQuestion.values()].reduce((a, b) => a + b, 0);
    const uniqueQuestions = bestByQuestion.size;
    const maxScore = uniqueQuestions * 30; // max weight(3) * 10

    attempt.totalScore = totalScore;
    attempt.maxScore = maxScore || 1;
    attempt.percentage = maxScore ? (totalScore / maxScore) * 100 : 0;
    await attempt.save();

    res.json({
      attemptId: attempt._id,
      submission: {
        status,
        testCasesPassed: passed,
        totalTestCases,
        runtime: submission.runtime,
        memory: submission.memory,
        score: questionScore,
      },
      overall: {
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
      },
    });
  } catch (err) {
    console.error("Coding submission error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /finish — finalise the coding round ────────────────────
router.post("/finish", authenticateAgent, async (req, res) => {
  try {
    const { jobId, candidateId } = req.body;

    if (!jobId || !candidateId) {
      return res.status(400).json({ error: "jobId and candidateId are required" });
    }

    const attempt = await CodingAttempt.findOne({ jobId, candidateId });
    if (!attempt) {
      return res.status(404).json({ error: "No coding attempt found" });
    }

    attempt.finishedAt = new Date();
    await attempt.save();

    const [job, candidate] = await Promise.all([
      JobRole.findById(jobId),
      ScreeningCandidate.findById(candidateId).lean(),
    ]);

    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    await updateRoundScore({
      job,
      candidateId: candidate._id,
      candidateSnapshot: {
        name: candidate.name,
        email: candidate.email,
        _bestScore:
          candidate.screeningResults?.[candidate.screeningResults.length - 1]
            ?.score ?? 0,
        _rank: candidate.shortlistRank,
      },
      score: attempt.totalScore,
      roundNumber: 2,
      roundName: "Coding Challenge",
    });

    res.json({
      attemptId: attempt._id,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      finishedAt: attempt.finishedAt,
    });
  } catch (err) {
    console.error("Coding finish error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
