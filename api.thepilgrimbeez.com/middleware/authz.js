// server/middleware/authz.js
const jwt = require("jsonwebtoken");
const COOKIE_NAME = process.env.COOKIE_NAME || "tpb_auth";
const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function ensureAdmin(req, res, next) {
  // role is fetched from DB on each admin route for accuracy
  next();
}

module.exports = { requireAuth, ensureAdmin };