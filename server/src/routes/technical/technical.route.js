import express from "express";
import mongoose from "mongoose";
import { authenticateAgent } from "../../middleware/auth.js";
import TechnicalQuestion from "../../models/TechnicalQuestion.model.js";
import TechnicalAttempt from "../../models/TechnicalAttempt.model.js";
import JobRole from "../../models/JobRole.model.js";
import ScreeningCandidate from "../../models/candidate.screening.model.js";
import { updateRoundScore } from "../../services/interviewProgress.service.js";

const router = express.Router();

const DIFFICULTY_WEIGHT = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

// ── GET /questions — fetch technical MCQs ───────────────────────
router.get("/questions", authenticateAgent, async (req, res) => {
  try {
    const { limit = 5, difficulty, category, jobId } = req.query;
    const parsedLimit = Math.max(1, Math.min(Number(limit) || 5, 50));

    const match = {};
    if (difficulty) match.difficulty = difficulty;
    if (category) match.category = category;
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      match.$or = [
        { jobIds: new mongoose.Types.ObjectId(jobId) },
        { jobIds: { $size: 0 } },
      ];
    }

    let questions = [];
    try {
      questions = await TechnicalQuestion.aggregate([
        { $match: Object.keys(match).length ? match : {} },
        { $sample: { size: parsedLimit } },
        {
          $project: {
            _id: 1,
            text: 1,
            options: 1,
            difficulty: 1,
            category: 1,
          },
        },
      ]);
    } catch {
      questions = await TechnicalQuestion.find(match)
        .limit(parsedLimit)
        .select("text options difficulty category")
        .lean();
    }

    res.json({ questions });
  } catch (err) {
    console.error("Technical questions error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /submit — evaluate answers ────────────────────────────
router.post("/submit", authenticateAgent, async (req, res) => {
  try {
    const { jobId, candidateId, answers } = req.body;

    if (!jobId || !candidateId) {
      return res
        .status(400)
        .json({ error: "jobId and candidateId are required" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers array is required" });
    }

    const questionIds = answers
      .map((ans) => ans.questionId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const questions = await TechnicalQuestion.find({
      _id: { $in: questionIds },
    }).lean();

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q]),
    );

    let totalScore = 0;
    let maxScore = 0;

    const evaluatedAnswers = answers.map((answer) => {
      const key = answer.questionId?.toString();
      const question = questionMap.get(key);
      if (!question) {
        return {
          questionId: key,
          selectedOption: answer.selectedOption,
          difficulty: answer.difficulty || "Easy",
          weight: 0,
          isCorrect: false,
        };
      }

      const weight = DIFFICULTY_WEIGHT[question.difficulty] || 1;
      const isCorrect = question.correctOption === answer.selectedOption;

      maxScore += weight;
      if (isCorrect) totalScore += weight;

      return {
        questionId: question._id,
        selectedOption: answer.selectedOption,
        difficulty: question.difficulty,
        weight,
        isCorrect,
      };
    });

    const attempt = await TechnicalAttempt.findOneAndUpdate(
      { jobId, candidateId },
      {
        jobId,
        candidateId,
        answers: evaluatedAnswers,
        totalScore,
        maxScore,
        percentage: maxScore ? (totalScore / maxScore) * 100 : 0,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

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
      score: totalScore,
      roundNumber: 4,
      roundName: "Technical Interview",
    });

    res.json({
      attemptId: attempt._id,
      totalScore,
      maxScore,
      percentage: attempt.percentage,
    });
  } catch (err) {
    console.error("Technical submission error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
