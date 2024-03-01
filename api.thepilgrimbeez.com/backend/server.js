const express = require('express');
const cors = require('cors');
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors()); // CORS middleware applied here
// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change * to your specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());

require('dotenv').config();

const port = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
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
  res.status(500).send('Something went wrong!');
});

// Routes and middleware for handling travel packages
require('./travelPackages')(app, db, upload, uuidv4);

// Login route and logic
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Query the database to check if the user exists and credentials are correct
  db.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (results.length > 0) {
      // User exists and credentials are correct
      // Generate and send JWT token as a response
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      // User doesn't exist or credentials are incorrect
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  // Check for valid token
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Here you can fetch user data from the database based on decoded user id
    // Then you can send the dashboard data as response
    // For now, let's just send a sample response
    res.status(200).json({ message: 'Dashboard data', user: decoded });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Other routes and logic...
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
