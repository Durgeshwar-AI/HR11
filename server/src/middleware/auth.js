import jwt from "jsonwebtoken";

/** Read at call-time so dotenv has already loaded */
function isNoAuthMode() {
  return process.env.DISABLE_AUTH !== "false";
}

/**
 * Authenticate a candidate via JWT.
 * Expects: Authorization: Bearer <token>
 * Sets req.candidate = { id, email }
 */
export function authenticateCandidate(req, res, next) {
  const authHeader = req.headers.authorization;

  // If a Bearer token is present, always try to decode it
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "candidate") {
        return res.status(403).json({ error: "Access denied — candidates only" });
      }

      req.candidate = { id: decoded.id, email: decoded.email };
      return next();
    } catch (err) {
      // Token invalid — fall through to no-auth check
    }
  }

  // No valid token: allow through only in dev/no-auth mode
  if (isNoAuthMode()) {
    req.candidate = { id: "000000000000000000000002", email: "local-candidate@test.dev" };
    return next();
  }

  return res.status(401).json({ error: "No token provided" });
}

/**
 * Authenticate an HR user via JWT.
 * Expects: Authorization: Bearer <token>
 * Sets req.hrUser = { id, email, role }
 */
export function authenticateHR(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "hr") {
        return res.status(403).json({ error: "Access denied — HR only" });
      }

      req.hrUser = { id: decoded.id, email: decoded.email, role: decoded.hrRole };
      return next();
    } catch (err) {
      // Token invalid — fall through to no-auth check
    }
  }

  if (isNoAuthMode()) {
    req.hrUser = { id: "000000000000000000000001", email: "local-hr@test.dev", role: "admin" };
    return next();
  }

  return res.status(401).json({ error: "No token provided" });
}

/**
 * Authenticate internal agent worker via API key.
 * Expects: x-agent-api-key header
 */
export function authenticateAgent(req, res, next) {
  if (isNoAuthMode()) {
    return next();
  }

  const apiKey = req.headers["x-agent-api-key"];

  if (!apiKey || apiKey !== process.env.AGENT_INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Invalid agent API key" });
  }

  next();
}
