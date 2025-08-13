// --- top of file ---
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mysql = require("mysql");
const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");

const app = express();

// ---- CORS: allow only configured origins, handle OPTIONS globally
const allowed = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean); // e.g. ["http://localhost:3005","http://localhost:3007","https://thepilgrimbeez.com","https://admin.thepilgrimbeez.com"]

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser clients (no Origin) and allowed web origins
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

app.use((req, res, next) => {
  // Ensure CORS headers are present on *all* responses (incl. 404/500)
  const origin = req.headers.origin;
  if (!origin || allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Vary", "Origin"); // avoid CDN/proxy cache issues
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for every route

// ---- parsers
app.use(express.json());

// ---- Razorpay
global.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---- DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
db.connect(err => {
  if (err) { console.error("DB connect failed:", err.stack); return; }
  console.log("Connected to database.");
});

// ---- uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const multerStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage: multerStorage });

// ---- static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/static", express.static(path.join(__dirname, "public")));

// simple test route
app.get("/testapi", (_, res) => res.send("This is test api"));

// health
app.get("/", (_, res) => res.send("Hello, World!"));

// ---- ROUTES (make sure these are AFTER CORS + parsers)
require("./controllers/travelPackages")(app, db, upload, uuidv4);
require("./controllers/continents")(app, db, upload, uuidv4);
require("./controllers/countries")(app, db, upload, uuidv4);
require("./controllers/states")(app, db, upload, uuidv4);

// If your auth/admin controllers expect a pool, change them to accept `db` or create a real pool.
// For now, pass `db` so this file is consistent with your connection above.
require("./controllers/auth")(app, db);
require("./controllers/admin")(app, db);

// Payment routes (declare ONCE)
const paymentRoutes = require("./controllers/paymentController");
app.use("/api", paymentRoutes);

// ---- 404 with CORS headers intact
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// ---- error handler LAST (keeps CORS headers we added above)
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ---- start
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));