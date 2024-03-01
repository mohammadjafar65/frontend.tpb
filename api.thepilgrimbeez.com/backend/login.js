// routes/login.js
module.exports = (app, db) => {
    // Route for user login
    app.post("/api.thepilgrimbeez.com/login", (req, res) => {
      const { email, password } = req.body;
  
      // Perform authentication logic here
      // Check if the email and password match a user in the database
      // Example authentication logic:
      if (email === "admin@tpb.com" && password === "TPB@2024") {
        // Authentication successful
        return res.status(200).json({ message: "Login successful" });
      } else {
        // Authentication failed
        return res.status(403).json({ error: "Invalid credentials" });
      }
    });
  };
  