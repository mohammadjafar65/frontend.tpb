module.exports = (app, db) => {
  // Route for user login
  app.post("/api.thepilgrimbeez.com/login", (req, res) => {
    const { email, password } = req.body;

    // Perform authentication logic here
    // Check if the email and password match a user in the database
    // Example authentication logic:
    db.query(
      "SELECT * FROM user WHERE email = ? AND password = ?",
      [email, password],
      (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res
            .status(500)
            .json({ error: "Database error: " + error.message });
        }

        if (results.length > 0) {
          // Authentication successful
          // Fetch dashboard data and return it along with login message
          db.query("SELECT * FROM travel_packages", (err, packages) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ error: "Database error: " + err.message });
            }
            return res.status(200).json({
              message: "Login successful",
              packages: packages,
            });
          });
        } else {
          // Authentication failed
          return res.status(403).json({ error: "Invalid credentials" });
        }
      }
    );
  });
};
