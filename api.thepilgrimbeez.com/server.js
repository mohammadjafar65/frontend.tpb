// server.js  (replace your DB+controllers section with this)
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS: allow credentials for cookie-based auth
// const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
//   .split(",")
//   .map(s => s.trim())
//   .filter(Boolean);

// --- CORS (normalized + wildcard for subdomains) ---
const rawOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// normalize: drop trailing slashes
const normalize = o => (o || "").replace(/\/+$/, "");
const allowedList = rawOrigins.map(normalize);

// allow any HTTPS subdomain of your domain (e.g., https://admin.thepilgrimbeez.com)
const wildcardRules = [
  /^https:\/\/([a-z0-9-]+\.)*thepilgrimbeez\.com$/i,
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl/Postman/server-to-server
  const o = normalize(origin);
  if (allowedList.includes(o)) return true;
  if (wildcardRules.some(r => r.test(o))) return true;
  return false;
}

const corsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin || "";
  cb(null, {
    origin: isAllowedOrigin(origin),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  });
};

app.use(cors(corsOptionsDelegate));
app.options("*", cors(corsOptionsDelegate));

// app.use(
//   cors({
//     origin(origin, cb) {
//       // allow same-origin / server-to-server / curl (no Origin header)
//       if (!origin) return cb(null, true);
//       // allow if matches one of the approved origins
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       // otherwise block
//       return cb(new Error(`CORS blocked: ${origin} not allowed`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// Fast preflight handler (ensures OPTIONS returns headers too)
app.options("*", cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin} not allowed`));
  },
  credentials: true,
}));

// Rate-limit auth endpoints
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });
app.use("/auth", authLimiter);

// Razorpay
global.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const port = process.env.PORT || 3000;

// uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });

app.use("/uploads", express.static("uploads"));
app.get("/", (_, res) => res.send("Hello, World!"));

// ---------- DB + controller boot
(async () => {
  try {
    const mysql = require("mysql2/promise");
    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    await pool.query("SELECT 1");
    console.log("Connected to database.");

    // Adapter so legacy controllers using db.query(sql, params, cb) keep working
    const db = {
      query(sql, params, cb) {
        if (typeof params === "function") { cb = params; params = []; }
        pool
          .query(sql, params)
          .then(([rows]) => cb && cb(null, rows))
          .catch((err) => cb && cb(err));
      },
      _pool: pool, // expose if you want promise queries somewhere else
    };

    // Load controllers AFTER db exists (very important)
    require("./controllers/travelPackages")(app, db, upload, uuidv4);
    require("./controllers/continents")(app, db, upload, uuidv4);
    require("./controllers/countries")(app, db, upload, uuidv4);
    require("./controllers/states")(app, db, upload, uuidv4);

    // New auth uses promise-style pool directly:
    require("./controllers/auth")(app, pool);
    require("./controllers/admin")(app, pool);

    const paymentRoutes = require("./controllers/paymentController");
    app.use("/api", paymentRoutes);

    // Global error last
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).send("Something went wrong!");
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("DB init failed:", err);
    process.exit(1);
  }
})();
