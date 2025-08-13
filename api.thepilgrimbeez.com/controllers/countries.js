module.exports = (app, db) => {
    // Get all countries
    app.get("/countries", (req, res) => {
        db.query("SELECT * FROM countries", (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    // Add a country
    app.post("/countries", (req, res) => {
        const { name, photo_url, states, continent_id } = req.body;
        db.query(
            "INSERT INTO countries (name, photo_url, states, continent_id) VALUES (?, ?, ?, ?)",
            [name, photo_url, JSON.stringify(states), continent_id],
            (err, result) => {
                if (err) return res.status(500).send(err);
                res.json({ id: result.insertId });
            }
        );
    });

    // Update a country
    app.put("/countries/:id", (req, res) => {
        const { name, photo_url, states, continent_id } = req.body;
        db.query(
            "UPDATE countries SET name=?, photo_url=?, states=?, continent_id=? WHERE id=?",
            [name, photo_url, JSON.stringify(states), continent_id, req.params.id],
            (err) => {
                if (err) return res.status(500).send(err);
                res.sendStatus(200);
            }
        );
    });

    // Delete a country
    app.delete("/countries/:id", (req, res) => {
        db.query("DELETE FROM countries WHERE id=?", [req.params.id], (err) => {
            if (err) return res.status(500).send(err);
            res.sendStatus(200);
        });
    });
};