module.exports = (app, db) => {
  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
    const values = [email, password];

    db.query(sql, values, (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      if (rows.length > 0) {
        const token = generateToken(email);
        res.json({ token }); // Send the token as JSON response
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    });
  });

  module.exports = generateToken;

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
};
