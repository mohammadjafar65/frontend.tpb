module.exports = (app, db) => {
    // Get all continents
    app.get("/continents", (req, res) => {
        db.query("SELECT * FROM continents", (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    // Add new continent
    app.post("/continents", (req, res) => {
        const { name, photo_url, countries } = req.body;
        db.query(
            "INSERT INTO continents (name, photo_url, countries) VALUES (?, ?, ?)",
            [name, photo_url, JSON.stringify(countries)],
            (err, result) => {
                if (err) return res.status(500).send(err);
                res.json({ id: result.insertId });
            }
        );
    });

    // Update continent
    app.put("/continents/:id", (req, res) => {
        const { name, photo_url, countries } = req.body;
        db.query(
            "UPDATE continents SET name=?, photo_url=?, countries=? WHERE id=?",
            [name, photo_url, JSON.stringify(countries), req.params.id],
            (err) => {
                if (err) return res.status(500).send(err);
                res.sendStatus(200);
            }
        );
    });

    // Delete continent
    app.delete("/continents/:id", (req, res) => {
        db.query("DELETE FROM continents WHERE id=?", [req.params.id], (err) => {
            if (err) return res.status(500).send(err);
            res.sendStatus(200);
        });
    });
};