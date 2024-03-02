const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require('jsonwebtoken');

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

// Function to generate JWT token
function generateToken(email) {
  // Define payload (data to be encoded in the token)
  const payload = {
    email: email,
    // You can include additional data in the payload if needed
  };

  // Define options (e.g., token expiration time)
  const options = {
    expiresIn: '1h', // Token will expire in 1 hour
    // You can include additional options as needed
  };

  // Generate JWT token
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
}

// Handle login form submission
app.post("/api.thepilgrimbeez.com/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
  const values = [email, password];

  db.query(sql, values, (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    if (rows.length > 0) {
      // Assuming you have a function to generate JWT tokens
      const token = generateToken(email); // Implement this function to generate a token
      res.json({ token }); // Send the token as JSON response
    } else {
      res.status(401).json({ error: "Invalid email or password" }); // Send error response
    }
  });
});

// app.post("/api.thepilgrimbeez.com/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
//   const values = [email, password];

//   db.query(sql, values, (err, rows) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     if (rows.length > 0) {
//       res.send("Login Successfully");
//       require("./travelPackages")(app, db, upload, uuidv4);
//       // res.redirect("/api.thepilgrimbeez.com/packages");
//     } else {
//       res.send("Invalid email or password");
//     }
//   });
// });

// Serve dashboard page
// app.get("/dashboard", (req, res) => {
//   // Routes and middleware for handling travel packages
  
// });

module.exports = generateToken;

// Other routes and logic...
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
