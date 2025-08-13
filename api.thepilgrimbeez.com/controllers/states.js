const { v4: uuidv4 } = require("uuid");

// Place helper here, before module.exports:
function syncPackagesToState(db, stateId, packageIds, cb) {
  // 1. Set state_ids to NULL for any package that was linked to this state, but is no longer in the new packageIds list
  db.query(
    "UPDATE travel_packages SET state_ids = NULL WHERE state_ids = ? AND packageId NOT IN (?)",
    [stateId, packageIds.length ? packageIds : [0]], // If packageIds empty, avoid SQL error
    (err) => {
      if (err) return cb(err);

      // 2. Set state_id for all packages in packageIds
      if (!packageIds.length) return cb();

      db.query(
        "UPDATE travel_packages SET state_ids = ? WHERE packageId IN (?)",
        [stateId, packageIds],
        cb
      );
    }
  );
}

/**
 * Sync all packages' state_ids field based on current state assignments.
 * This will ensure ONLY the packages in `packageIds` have the stateId in their state_ids array.
 */
function syncStateToPackages(db, stateId, packageIds, cb) {
  // 1. Remove stateId from packages that no longer have it
  db.query(
    `SELECT packageId, state_ids FROM travel_packages WHERE JSON_CONTAINS(state_ids, ?, '$')`,
    [JSON.stringify(stateId)],
    (err, rows) => {
      if (err) return cb(err);

      const packageIdsWithState = rows.map(row => row.packageId);
      // Those that need to have stateId REMOVED
      const toRemove = packageIdsWithState.filter(pkgId => !packageIds.includes(pkgId));

      // Remove stateId from packages that are no longer assigned
      if (toRemove.length) {
        toRemove.forEach(pkgId => {
          db.query(
            `SELECT state_ids FROM travel_packages WHERE packageId = ?`,
            [pkgId],
            (err2, results) => {
              if (!err2 && results.length) {
                let stateIds = [];
                try {
                  stateIds = JSON.parse(results[0].state_ids || "[]");
                  if (!Array.isArray(stateIds)) stateIds = [];
                } catch {
                  stateIds = [];
                }
                stateIds = stateIds.filter(id => id !== stateId);
                db.query(
                  `UPDATE travel_packages SET state_ids = ? WHERE packageId = ?`,
                  [JSON.stringify(stateIds), pkgId]
                );
              }
            }
          );
        });
      }

      // 2. Add stateId to new packages that are assigned
      if (packageIds.length) {
        packageIds.forEach(pkgId => {
          db.query(
            `SELECT state_ids FROM travel_packages WHERE packageId = ?`,
            [pkgId],
            (err3, results) => {
              if (!err3 && results.length) {
                let stateIds = [];
                try {
                  stateIds = JSON.parse(results[0].state_ids || "[]");
                  if (!Array.isArray(stateIds)) stateIds = [];
                } catch {
                  stateIds = [];
                }
                if (!stateIds.includes(stateId)) {
                  stateIds.push(stateId);
                  db.query(
                    `UPDATE travel_packages SET state_ids = ? WHERE packageId = ?`,
                    [JSON.stringify(stateIds), pkgId]
                  );
                }
              }
            }
          );
        });
      }

      cb();
    }
  );
}


module.exports = (app, db) => {
  // ✅ Get all states
  app.get("/states", (req, res) => {
    db.query("SELECT * FROM states", (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

  // ✅ Create new state
  app.post("/states/create", (req, res) => {
    const { name, photo_url, package_ids, country_id } = req.body;
    db.query(
      "INSERT INTO states (name, photo_url, package_ids, country_id) VALUES (?, ?, ?, ?)",
      [name, photo_url, JSON.stringify(package_ids), country_id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        // Now sync package state_ids
        syncPackagesToState(db, result.insertId, package_ids || [], (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ message: "State created", id: result.insertId });
        });
      }
    );
  });

  app.put("/states/update/:id", (req, res) => {
    const { name, photo_url, package_ids, country_id } = req.body;
    db.query(
      "UPDATE states SET name=?, photo_url=?, package_ids=?, country_id=? WHERE id=?",
      [name, photo_url, JSON.stringify(package_ids), country_id, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err });
        // SYNC packages state_ids
        syncStateToPackages(db, parseInt(req.params.id, 10), package_ids || [], (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ message: "State updated" });
        });
      }
    );
  });

  // ✅ Delete state
  app.delete("/states/delete/:id", (req, res) => {
    db.query("DELETE FROM states WHERE id=?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "State deleted" });
    });
  });

  // ✅ Get state by ID
  app.get("/states/:id", (req, res) => {
    db.query("SELECT * FROM states WHERE id=?", [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (!result.length) return res.status(404).json({ message: "Not found" });
      res.json(result[0]);
    });
  });

  app.get("/states/id/:id", (req, res) => {
    db.query("SELECT id, name FROM states WHERE id = ?", [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch state" });
      if (!rows.length) return res.status(404).json({ message: "State not found" });
      res.json(rows[0]);
    });
  });

};