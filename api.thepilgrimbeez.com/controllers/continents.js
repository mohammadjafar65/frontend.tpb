// controllers/continents.js
module.exports = (app, db) => {
  // Get all continents
  app.get("/continents", async (_req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, name, photo_url, countries FROM continents"
      );
      res.json(rows);
    } catch (err) {
      console.error("GET /continents failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Add new continent
  app.post("/continents", async (req, res) => {
    try {
      const { name, photo_url, countries } = req.body;
      if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

      const countriesJson = countries ? JSON.stringify(countries) : null;
      const [r] = await db.query(
        "INSERT INTO continents (name, photo_url, countries) VALUES (?, ?, ?)",
        [name, photo_url || null, countriesJson]
      );
      res.status(201).json({ id: r.insertId });
    } catch (err) {
      console.error("POST /continents failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Update continent
  app.put("/continents/:id", async (req, res) => {
    try {
      const { name, photo_url, countries } = req.body;
      const countriesJson = countries ? JSON.stringify(countries) : null;

      const [r] = await db.query(
        "UPDATE continents SET name = ?, photo_url = ?, countries = ? WHERE id = ?",
        [name || null, photo_url || null, countriesJson, req.params.id]
      );

      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.sendStatus(200);
    } catch (err) {
      console.error("PUT /continents/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Delete continent
  app.delete("/continents/:id", async (req, res) => {
    try {
      const [r] = await db.query("DELETE FROM continents WHERE id = ?", [req.params.id]);
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.sendStatus(200);
    } catch (err) {
      console.error("DELETE /continents/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });
};
