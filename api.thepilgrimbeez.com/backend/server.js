const express = require('express');
const cors = require('cors');
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

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

const port = process.env.PORT;

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

app.use(bodyParser.json());

app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create a nodemailer transporter using your email service credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Update with your email service provider
      auth: {
        user: 'info@thepilgrimbeez.com', // Update with your email address
        pass: 'AgateMall12@#' // Update with your email password
      }
    });

    // Configure the email to be sent
    const mailOptions = {
      from: 'info@thepilgrimbeez.com', // Update with your email address
      to: email, // Update with recipient's email address
      subject: 'New Form Submission',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    res.sendStatus(200);
  } catch (error) {
    console.error('Error submitting form:', error);
    res.sendStatus(500);
  }
});

// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Routes and middleware for handling travel packages
require('./travelPackages')(app, db, upload, uuidv4);
// require('./visaList')(app, db, upload, uuidv4);
// require('./users')(app, db);


// Other routes and logic...
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
