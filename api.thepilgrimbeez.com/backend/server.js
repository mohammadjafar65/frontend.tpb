const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // CORS middleware applied here
// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change * to your specific origin if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1); // Exit the process if database connection fails
  }
  console.log('Connected to database.');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Email sending endpoint
app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'New Form Submission',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error submitting form:', error);
    res.sendStatus(500);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Include routes and logic for travel packages
require('./travelPackages')(app, db, upload, uuidv4);
// Uncomment the line below to include routes and logic for users
// require('./users')(app, db);
