module.exports = (app, db) => {
  // Login route and logic
  app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Query the database to check if the user exists and credentials are correct
    db.query(
      "SELECT * FROM user WHERE email = ? AND password = ?",
      [email, password],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
          return;
        }

        if (results.length > 0) {
          // User exists and credentials are correct
          // Generate and send JWT token as a response
          const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          res.json({ token });
        } else {
          // User doesn't exist or credentials are incorrect
          res.status(401).json({ message: "Invalid credentials" });
        }
      }
    );
  });
};
