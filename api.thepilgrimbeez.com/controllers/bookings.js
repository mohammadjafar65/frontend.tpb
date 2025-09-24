// controllers/bookings.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { requireAuth } = require("./auth");

const IS_LOCAL = process.env.NODE_ENV !== "production" ||
  (process.env.FRONTEND_ORIGIN || "").includes("localhost");
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

/**
 * Mounts /booking routes:
 *  - POST /booking/create
 *  - GET  /booking/:id
 */
module.exports = (app, db) => {
  const router = express.Router();

  // ---- Config
  const COOKIE_NAME = process.env.COOKIE_NAME || "tpb_auth";
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined; // e.g. ".thepilgrimbeez.com"
  const JWT_SECRET = process.env.JWT_SECRET;
  const DB_NAME = process.env.DB_NAME; // required for INFORMATION_SCHEMA lookups

  if (!JWT_SECRET) {
    // Hard fail early to avoid issuing unsigned cookies in prod
    console.error("❌ Missing JWT_SECRET in environment");
  }
  if (!DB_NAME) {
    console.warn("⚠️  DB_NAME is not set; INFORMATION_SCHEMA checks may fail.");
  }

  // ---- Small cache for schema probes (table.column -> boolean)
  const schemaCache = new Map();
  const cacheKey = (table, col) => `${table}::${col}`;

  async function hasColumn(conn, table, col) {
    const key = cacheKey(table, col);
    if (schemaCache.has(key)) return schemaCache.get(key);
    const [[row]] = await conn.query(
      `SELECT COUNT(*) AS c
         FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`,
      [DB_NAME, table, col]
    );
    const ok = row.c > 0;
    schemaCache.set(key, ok);
    return ok;
  }

  // ---- Helpers
  const makePassword = () =>
    // 12 random bytes -> 16+ char URL-safe base64
    crypto.randomBytes(12).toString("base64url");

  function setAuthCookie(res, userPayload) {
    const token = jwt.sign(
      {
        id: userPayload.id,
        email: userPayload.email,
        name: userPayload.name,
        role: userPayload.role || "user",
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: !IS_LOCAL,               // secure only in prod
      sameSite: IS_LOCAL ? "lax" : "none",
      domain: IS_LOCAL ? undefined : COOKIE_DOMAIN, // NO domain on localhost
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  async function usersIdIsNumericAuto(conn) {
    const [[row]] = await conn.query(
      `SELECT DATA_TYPE, COLUMN_TYPE, EXTRA
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA=? AND TABLE_NAME='users' AND COLUMN_NAME='id'
      LIMIT 1`,
      [DB_NAME]
    );
    // treat as auto-increment numeric only if EXTRA has 'auto_increment'
    return !!row && /auto_increment/i.test(row.EXTRA || "");
  }

  // Create (or reuse) a user by email. Returns { id, email, name, role, tempPassword? }
  async function ensureUserForEmail(conn, customer) {
    const email = (customer.email || "").trim().toLowerCase();
    const name = (customer.customer_name || "").trim();
    const phone = (customer.phone || null);

    // Existing user?
    const [rows] = await conn.query(
      "SELECT id, email, name, role FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (rows.length) return { ...rows[0] };

    // New user
    const tempPassword = makePassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    // which password column exists?
    const hasPwdHashCol = await hasColumn(conn, "users", "password_hash");
    const hasPwdCol = await hasColumn(conn, "users", "password");
    if (!hasPwdHashCol && !hasPwdCol) {
      throw new Error("users table has neither password_hash nor password");
    }

    // does users.id auto-increment?
    const idIsAuto = await usersIdIsNumericAuto(conn);

    const cols = [];
    const vals = [];
    const push = (c, v) => { cols.push(c); vals.push(v); };

    // if id is NOT auto, generate one
    let newId = null;
    if (!idIsAuto) {
      newId = uuidv4();
      if (await hasColumn(conn, "users", "id")) push("id", newId);
    }

    push("name", name || email.split("@")[0]);
    push("email", email);
    if (await hasColumn(conn, "users", "phone")) push("phone", phone);
    if (hasPwdHashCol) push("password_hash", hash);
    if (hasPwdCol) push("password", hash);
    if (await hasColumn(conn, "users", "role")) push("role", "user");
    if (await hasColumn(conn, "users", "created_at")) push("created_at", new Date());
    if (await hasColumn(conn, "users", "updated_at")) push("updated_at", new Date());

    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT INTO users (${cols.join(", ")}) VALUES (${placeholders})`;
    const [ins] = await conn.query(sql, vals);

    // pick proper id
    const id = idIsAuto ? ins.insertId : newId;

    return { id, email, name: name || email, role: "user", tempPassword };
  }

  // ---- GET /bookings (list with pagination & search)
  router.get("/", async (req, res) => {
    const { search = "", page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    try {
      let sql = "SELECT * FROM tpb_bookings";
      let countSql = "SELECT COUNT(*) as total FROM tpb_bookings";
      const params = [];

      if (search) {
        sql += " WHERE customer_name LIKE ? OR email LIKE ? OR phone LIKE ?";
        countSql += " WHERE customer_name LIKE ? OR email LIKE ? OR phone LIKE ?";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(Number(pageSize), offset);

      const [rows] = await db.query(sql, params);
      const [[countRow]] = await db.query(countSql, params.slice(0, -2));

      res.json({
        data: rows,
        total: countRow.total,
        page: Number(page),
        pageSize: Number(pageSize),
      });
    } catch (err) {
      console.error("GET /bookings error:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // ---- POST /booking/create
  router.post("/create", async (req, res) => {
    const conn = await db.getConnection();
    try {
      const {
        packageId,
        packageName,
        packageSnapshot = {},
        selection = {},
        customer = {},
      } = req.body || {};

      // Basic validation
      if (!packageId) return res.status(400).json({ error: "packageId required" });
      if (!customer?.email) return res.status(400).json({ error: "email required" });
      if (!customer?.customer_name) customer.customer_name = customer.email.split("@")[0];

      // Compute amounts
      const guests = Number(selection.guests ?? 1);
      const pricePerPerson = Number(selection.pricePerPerson ?? 0);
      const total = selection.total != null
        ? Number(selection.total)
        : (pricePerPerson * guests);
      const amountPaise = Math.max(0, Math.round(total * 100));

      await conn.beginTransaction();

      // Get/create user (and login them)
      const user = await ensureUserForEmail(conn, customer);
      setAuthCookie(res, user);

      // Build a resilient INSERT for tpb_bookings (only include existing columns)
      const bookingId = uuidv4();
      const cols = [];
      const vals = [];

      // Helper to push if column exists
      const add = async (col, val) => {
        if (await hasColumn(conn, "tpb_bookings", col)) {
          cols.push(col); vals.push(val);
        }
      };

      await add("booking_id", bookingId);
      await add("user_id", user.id);
      await add("package_id", packageId);
      // await add("amount_paise", amountPaise);
      await add("currency", "INR");
      await add("status", "pending");

      await add("customer_name", customer.customer_name || null);
      await add("email", customer.email || null);
      await add("phone", customer.phone || null);
      await add("address1", customer.address1 || null);
      await add("address2", customer.address2 || null);
      await add("state", customer.state || null);
      await add("zip", customer.zip || null);
      await add("special_requests", customer.special_requests || null);

      await add("start_date", selection.startDate || null);
      await add("end_date", selection.endDate || null);
      await add("guests", guests);
      await add("price_per_person", pricePerPerson);
      await add("total_amount", total);

      // Optional snapshots if your schema has them
      await add("package_name", packageName || null);
      await add("package_snapshot", JSON.stringify(packageSnapshot || {}));

      // Timestamps
      const now = new Date();
      await add("created_at", now);
      await add("updated_at", now);

      if (cols.length === 0) {
        throw new Error("No compatible columns found for tpb_bookings INSERT");
      }

      const placeholders = cols.map(() => "?").join(", ");
      const sql = `INSERT INTO tpb_bookings (${cols.join(", ")}) VALUES (${placeholders})`;

      await conn.query(sql, vals);
      await conn.commit();

      // In dev you might tell the temp password once; in prod email it instead.
      res.json({
        bookingId,
        user: { id: user.id, email: user.email, name: user.name },
        newUser: Boolean(user.tempPassword),
        tempPassword: process.env.NODE_ENV === "production" ? undefined : user.tempPassword,
      });
    } catch (e) {
      try { await conn.rollback(); } catch { }
      // Log verbosely on server; keep client message generic in prod
      console.error("booking/create error:", e);
      res.status(500).json({
        error: process.env.NODE_ENV === "production" ? "Failed to create booking" : (e.message || "Failed to create booking"),
      });
    } finally {
      if (conn) conn.release();
    }
  });

  // ---- GET /booking/:id  (used by PaymentInfo.jsx)
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [[row]] = await db.query(
        "SELECT * FROM tpb_bookings WHERE booking_id=? LIMIT 1",
        [id]
      );
      if (!row) return res.status(404).json({ error: "Not found" });

      // Provide a light "selection" object for the client stepper
      const selection = {
        guests: Number(row.guests ?? 1),
        pricePerPerson: Number(row.price_per_person ?? 0),
        total: Number(row.total_amount ?? 0),
        startDate: row.start_date,
        endDate: row.end_date,
      };

      res.json({ ...row, selection });
    } catch (e) {
      console.error("booking/:id error:", e);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Get latest booking details for logged-in user
  app.get("/booking/my-latest", requireAuth, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT customer_name, email, phone, address1, address2, state, zip, special_requests 
       FROM tpb_bookings 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 1`,
        [req.user.id]
      );

      if (!rows.length) {
        return res.json({ booking: null });
      }

      res.json({ booking: rows[0] });
    } catch (err) {
      console.error("Fetch latest booking error:", err);
      res.status(500).json({ error: "Failed to fetch booking details" });
    }
  });

  // Mount at /booking
  app.use("/booking", router);
  console.log("✔ bookings routes mounted at /booking");
};
