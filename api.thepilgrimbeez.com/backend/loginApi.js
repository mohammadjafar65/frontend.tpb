const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path'); // Import path module

module.exports = (app, db) => {
  app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Specify the path to your login.json file
    const loginFilePath = path.join(__dirname, 'path', 'to', 'login.json');

    // Read user credentials from login.json
    const users = JSON.parse(fs.readFileSync(loginFilePath, 'utf8')).users;

    // Check if the provided credentials match any user
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const token = generateToken(email);
      res.json({ token }); // Send the token as JSON response
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
};

// Function to generate JWT token
function generateToken(email) {
  // Define payload (data to be encoded in the token)
  const payload = {
    email: email,
    // You can include additional data in the payload if needed
  };

  // Define options (e.g., token expiration time)
  const options = {
    expiresIn: "1h", // Token will expire in 1 hour
    // You can include additional options as needed
  };

  // Generate JWT token
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  return token;
}
