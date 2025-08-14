// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");

// ⬇ use mysql2/promise (NOT mysql)
const mysql = require("mysql2/promise");

const app = express();
app.set("trust proxy", 1); // behind nginx/cloudflare etc.

// --- CORS (credentials across subdomains)
const ALLOWED_ORIGINS = [
  "https://thepilgrimbeez.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // SSR/tools
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith(".thepilgrimbeez.com")) return cb(null, true);
    } catch {}
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

app.use(express.json());
app.use(cookieParser());

// ---- Razorpay
global.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const port = process.env.PORT || 3000;

// ---- DB (mysql2/promise pool)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// quick probe so you see it in logs
db.query("SELECT 1").then(() => console.log("DB OK")).catch(err => {
  console.error("DB connect failed:", err);
});

// ---- uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const multerStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) =>
    cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage: multerStorage });

// ---- static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/static", express.static(path.join(__dirname, "public")));

// simple test route
app.get("/testapi", (_, res) => res.send("This is test api"));
app.get("/", (_, res) => res.send("Hello, World!"));

// ---- ROUTES (after CORS + parsers)
require("./controllers/travelPackages")(app, db, upload, uuidv4);
require("./controllers/continents")(app, db, upload, uuidv4);
require("./controllers/countries")(app, db, upload, uuidv4);
require("./controllers/states")(app, db, upload, uuidv4);

require("./controllers/auth")(app, db);
require("./controllers/admin")(app, db);

// Payment routes
const paymentRoutes = require("./controllers/paymentController");
app.use("/api", paymentRoutes);

// error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// start
app.listen(port, () => console.log(`Server running on port ${port}`));