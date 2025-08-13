const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const paymentRoutes = require("./controllers/paymentController");

const app = express();
require("dotenv").config();
const allowed = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean); // e.g. ["http://localhost:3005","http://localhost:3007","https://thepilgrimbeez.com","https://admin.thepilgrimbeez.com"]

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser clients (no Origin) and allowed web origins
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // needed if you ever send cookies
  maxAge: 86400, // cache preflight 1 day
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for all routes

// Razorpay instance
global.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const port = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/testapi", express.static("This is test api"));
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.send("Hello, World!"); // Send a response to the client
});

app.use(bodyParser.json());

// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Routes and middleware for handling travel packages
require("./controllers/travelPackages")(app, db, upload, uuidv4);
require("./controllers/continents")(app, db, upload, uuidv4);
require("./controllers/countries")(app, db, upload, uuidv4);
require("./controllers/states")(app, db, upload, uuidv4);

// New auth uses promise-style pool directly:
require("./controllers/auth")(app, pool);
require("./controllers/admin")(app, pool);

// const paymentRoutes = require("./controllers/paymentController");
app.use("/api", paymentRoutes);
// require('./visaList')(app, db, upload, uuidv4);
// require('./users')(app, db);

// Other routes and logic...
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
