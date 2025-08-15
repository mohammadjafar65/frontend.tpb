// controllers/countries.js
module.exports = (app, db) => {
  // GET /countries[?continent_id=1]
  app.get("/countries", async (req, res) => {
    try {
      const { continent_id } = req.query;
      let rows;
      if (continent_id) {
        [rows] = await db.query(
          "SELECT id, name, photo_url, states, continent_id FROM countries WHERE continent_id = ? ORDER BY name",
          [continent_id]
        );
      } else {
        [rows] = await db.query(
          "SELECT id, name, photo_url, states, continent_id FROM countries ORDER BY name"
        );
      }
      res.json(rows);
    } catch (err) {
      console.error("GET /countries failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // POST /countries
  app.post("/countries", async (req, res) => {
    try {
      const { name, photo_url, states, continent_id } = req.body;
      if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

      const statesJson = states ? JSON.stringify(states) : null;
      const [r] = await db.query(
        "INSERT INTO countries (name, photo_url, states, continent_id) VALUES (?, ?, ?, ?)",
        [name, photo_url || null, statesJson, continent_id || null]
      );
      res.status(201).json({ id: r.insertId });
    } catch (err) {
      console.error("POST /countries failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // PUT /countries/:id
  app.put("/countries/:id", async (req, res) => {
    try {
      const { name, photo_url, states, continent_id } = req.body;
      const statesJson = states ? JSON.stringify(states) : null;

      const [r] = await db.query(
        "UPDATE countries SET name = ?, photo_url = ?, states = ?, continent_id = ? WHERE id = ?",
        [name || null, photo_url || null, statesJson, continent_id || null, req.params.id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.sendStatus(200);
    } catch (err) {
      console.error("PUT /countries/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // DELETE /countries/:id
  app.delete("/countries/:id", async (req, res) => {
    try {
      const [r] = await db.query("DELETE FROM countries WHERE id = ?", [req.params.id]);
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.sendStatus(200);
    } catch (err) {
      console.error("DELETE /countries/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });
};
