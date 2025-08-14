const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { z } = require("zod");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIENAME || "tpb_auth";

// Use a parent-domain cookie for all subdomains
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ".thepilgrimbeez.com";

module.exports = (app, pool) => {
  // ---- Email (uses app password or SMTP creds in .env)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  // ---- Helpers
  const sendAuthCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // true on prod HTTPS
      sameSite: "lax", // fine for same-site subdomains
      domain: COOKIE_DOMAIN,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };

  const clearAuthCookie = (res) => {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      domain: COOKIE_DOMAIN,
      path: "/",
    });
  };

  const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  });

  const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  // ---- SIGNUP
  app.post("/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = SignupSchema.parse(req.body);
      const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
      if (rows.length) return res.status(400).json({ error: "Email already registered" });

      const hash = await bcrypt.hash(password, 12);
      const id = cryptoRandomId();

      await pool.query(
        "INSERT INTO users (id, name, email, password, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())",
        [id, name, email, hash]
      );

      // Optional: send verification email (hook)
      // const verifyToken = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "1d" });
      // const verifyLink = `${process.env.FRONTEND_ORIGIN}/verify?token=${verifyToken}`;
      // await transporter.sendMail({ to: email, subject: "Verify your email", text: `Verify: ${verifyLink}` });

      res.status(201).json({ message: "Signup successful" });
    } catch (e) {
      if (e.errors) return res.status(400).json({ error: "Invalid input" });
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ---- LOGIN (cookie-based)
  app.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const [rows] = await pool.query("SELECT id, name, email, password FROM users WHERE email = ?", [email]);
      if (!rows.length) return res.status(400).json({ error: "Invalid credentials" });

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      sendAuthCookie(res, token);

      res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
      if (e.errors) return res.status(400).json({ error: "Invalid input" });
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ---- LOGOUT
  app.post("/auth/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logged out" });
  });

  // ---- ME (validates cookie)
  app.get("/auth/me", requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [req.user.id]
      );
      if (!rows.length) return res.status(401).json({ error: "Unauthorized" });
      res.json({ user: rows[0] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ---- PASSWORD RESET: request
  app.post("/auth/request-reset", async (req, res) => {
    const email = String(req.body.email || "");
    if (!email) return res.status(400).json({ error: "Email required" });

    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.json({ message: "If that email exists, a reset link has been sent." });

    const userId = rows[0].id;
    const resetToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "30m" });

    await pool.query(
      "UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
      [resetToken, userId]
    );

    const link = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${encodeURIComponent(resetToken)}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: `Reset your password: ${link}`,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  });

  // ---- PASSWORD RESET: confirm
  app.post("/auth/reset-password", async (req, res) => {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Invalid request" });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const [rows] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND reset_token = ? AND reset_expires > NOW()",
        [payload.id, token]
      );
      if (!rows.length) return res.status(400).json({ error: "Invalid or expired token" });

      const hash = await bcrypt.hash(password, 12);
      await pool.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL, updated_at = NOW() WHERE id = ?",
        [hash, payload.id]
      );
      res.json({ message: "Password updated" });
    } catch {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  });

  // ---- Middleware
  function requireAuth(req, res, next) {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // ---- Example protected route
  app.get("/account/profile", requireAuth, async (req, res) => {
    const [rows] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
    res.json({ user: rows[0] });
  });
};

// simple id
function cryptoRandomId() {
  return require("crypto").randomBytes(12).toString("hex");
}
