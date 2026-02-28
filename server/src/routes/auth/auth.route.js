import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Candidate from "../../models/Candidate.model.js";
import HRUser from "../../models/HRUser.model.js";

const router = express.Router();

// ─── Candidate Register ──────────────────────────────────────────
router.post("/candidate/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Candidate with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const candidate = await Candidate.create({ name, email, passwordHash });

    const token = jwt.sign(
      { id: candidate._id, email: candidate.email, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Candidate registered successfully",
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
      },
    });
  } catch (err) {
    console.error("Candidate register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Candidate Login ─────────────────────────────────────────────
router.post("/candidate/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, candidate.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: candidate._id, email: candidate.email, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
      },
    });
  } catch (err) {
    console.error("Candidate login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── HR Register (admin-only, or first user becomes admin) ──────
router.post("/hr/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const existing = await HRUser.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "HR user with this email already exists" });
    }

    // First HR user auto-becomes admin
    const hrCount = await HRUser.countDocuments();
    const assignedRole = hrCount === 0 ? "admin" : role || "viewer";

    const passwordHash = await bcrypt.hash(password, 10);
    const hrUser = await HRUser.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
    });

    const token = jwt.sign(
      { id: hrUser._id, email: hrUser.email, role: "hr", hrRole: hrUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "HR user registered successfully",
      token,
      user: {
        id: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        role: hrUser.role,
      },
    });
  } catch (err) {
    console.error("HR register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── HR Login ────────────────────────────────────────────────────
router.post("/hr/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const hrUser = await HRUser.findOne({ email });
    if (!hrUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, hrUser.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: hrUser._id, email: hrUser.email, role: "hr", hrRole: hrUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        role: hrUser.role,
      },
    });
  } catch (err) {
    console.error("HR login error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
