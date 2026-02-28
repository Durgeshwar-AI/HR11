import jwt from "jsonwebtoken";

const NO_AUTH_MODE = process.env.DISABLE_AUTH !== "false";

/**
 * Authenticate a candidate via JWT.
 * Expects: Authorization: Bearer <token>
 * Sets req.candidate = { id, email }
 */
export function authenticateCandidate(req, res, next) {
  if (NO_AUTH_MODE) {
    req.candidate = { id: "local-candidate", email: "local-candidate@test.dev" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "candidate") {
      return res.status(403).json({ error: "Access denied — candidates only" });
    }

    req.candidate = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Authenticate an HR user via JWT.
 * Expects: Authorization: Bearer <token>
 * Sets req.hrUser = { id, email, role }
 */
export function authenticateHR(req, res, next) {
  if (NO_AUTH_MODE) {
    req.hrUser = { id: "local-hr", email: "local-hr@test.dev", role: "admin" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "hr") {
      return res.status(403).json({ error: "Access denied — HR only" });
    }

    req.hrUser = { id: decoded.id, email: decoded.email, role: decoded.hrRole };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Authenticate internal agent worker via API key.
 * Expects: x-agent-api-key header
 */
export function authenticateAgent(req, res, next) {
  if (NO_AUTH_MODE) {
    return next();
  }

  const apiKey = req.headers["x-agent-api-key"];

  if (!apiKey || apiKey !== process.env.AGENT_INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Invalid agent API key" });
  }

  next();
}
