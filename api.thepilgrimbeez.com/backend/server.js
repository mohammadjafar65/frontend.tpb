const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors()); // CORS middleware applied here
// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Change * to your specific origin if needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());

require("dotenv").config();

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
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/testapi", express.static("This is test api"));
app.use("/api.thepilgrimbeez.com/uploads", express.static("uploads"));
app.use("/static", express.static(path.join(__dirname, "public")));

// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Routes and middleware for handling travel packages
require("./travelPackages")(app, db, upload, uuidv4);
// require("./login")(app, db, uuidv4);

const users = [
  { id: 1, username: 'user1', password: 'password1', name: 'User One' },
  { id: 2, username: 'user2', password: 'password2', name: 'User Two' }
];

// Login endpoint
app.post('/api.thepilgrimbeez.com/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Other routes and logic...
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
