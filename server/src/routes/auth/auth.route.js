import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Candidate from "../../models/Candidate.model.js";
import HRUser from "../../models/HRUser.model.js";
import { authenticateHR } from "../../middleware/auth.js";

const router = express.Router();

// ─── HR Register (admin-only, or first user becomes admin) ──────
router.post("/hr/register", async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, and password are required" });
    }

    const existing = await HRUser.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: "HR user with this email already exists" });
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
      company: company || "",
    });

    const token = jwt.sign(
      { id: hrUser._id, email: hrUser.email, role: "hr", hrRole: hrUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
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
      { expiresIn: "7d" },
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

// ─── Candidate Register ──────────────────────────────────────────
router.post("/candidate/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Candidate with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const candidate = await Candidate.create({
      name,
      email,
      passwordHash,
    });

    const token = jwt.sign(
      { id: candidate._id, email: candidate.email, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Candidate registered successfully",
      token,
      user: {
        _id: candidate._id,
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: "candidate",
        desiredRole: role || "",
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
    if (!candidate || !candidate.passwordHash) {
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
      user: {
        _id: candidate._id,
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: "candidate",
      },
    });
  } catch (err) {
    console.error("Candidate login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get current HR user profile ────────────────────────────────
router.get("/hr/me", authenticateHR, async (req, res) => {
  try {
    const hrUser = await HRUser.findById(req.hrUser.id).select(
      "name email role company whatsappPhone"
    );

    if (!hrUser) {
      return res.status(404).json({ error: "HR user not found" });
    }

    res.json({
      user: {
        id: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        role: hrUser.role,
        company: hrUser.company,
        whatsappPhone: hrUser.whatsappPhone,
      },
    });
  } catch (err) {
    console.error("Get HR profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Link / unlink WhatsApp phone number ─────────────────────────
// PATCH /api/auth/hr/whatsapp
// Body: { whatsappPhone: "919876543210" }  (E.164 without the +)
router.patch("/hr/whatsapp", authenticateHR, async (req, res) => {
  try {
    const { whatsappPhone } = req.body;

    // Allow unlinking by passing null / empty string
    const update = {
      whatsappPhone: whatsappPhone
        ? String(whatsappPhone).replace(/\D/g, "")
        : null,
    };

    const hrUser = await HRUser.findByIdAndUpdate(req.hrUser.id, update, {
      new: true,
      select: "name email whatsappPhone",
    });

    if (!hrUser) return res.status(404).json({ error: "HR user not found" });

    res.json({
      message: whatsappPhone
        ? "WhatsApp number linked successfully"
        : "WhatsApp number unlinked",
      user: hrUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "This WhatsApp number is already linked to another account",
      });
    }
    console.error("WhatsApp link error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
