// controllers/states.js
// Works with mysql2/promise pool.
// Tables assumed:
//   states(id INT PK, name VARCHAR, photo_url TEXT NULL, package_ids JSON/TEXT NULL, country_id INT NULL)
//   travel_packages(packageId VARCHAR(64) PK (UUID), state_ids JSON/TEXT NULL, ...)

module.exports = (app, db) => {
  // ---------- helpers ----------
  const toJson = (v) => (v == null ? null : JSON.stringify(v));
  const parseArr = (v) => {
    try {
      if (Array.isArray(v)) return v;
      if (v == null || v === "") return [];
      const a = JSON.parse(v);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  };

  // accept only UUID-ish strings (very loose check), drop falsy/0/null
  const sanitizePkgIds = (ids) => {
    if (!Array.isArray(ids)) return [];
    const uuidish = /^[0-9a-fA-F-]{16,}$/; // loose; good enough to reject 0/null
    return ids
      .map((x) => (x == null ? "" : String(x).trim()))
      .filter((x) => x && uuidish.test(x));
  };

  // packages read/writes (packageId is STRING)
  async function getPackagesByIds(ids) {
    if (!ids.length) return [];
    const [rows] = await db.query(
      "SELECT packageId, state_ids FROM travel_packages WHERE packageId IN (?)",
      [ids]
    );
    return rows;
  }

  async function getPackagesHavingState(stateId) {
    const [rows] = await db.query(
      "SELECT packageId, state_ids FROM travel_packages " +
        "WHERE JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
      [stateId]
    );
    return rows;
  }

  async function setPackageStateIds(pkgId, arr) {
    await db.query(
      "UPDATE travel_packages SET state_ids = ? WHERE packageId = ?",
      [toJson(arr), pkgId]
    );
  }

  /**
   * Ensure ONLY packages in `pkgIds` (UUID strings) have the numeric `stateId` in their state_ids array.
   * - remove stateId from packages that currently have it but are not in pkgIds
   * - add stateId to packages in pkgIds that don't have it yet
   */
  async function syncStateOnPackages(stateId, pkgIds) {
    const target = new Set(pkgIds || []);

    // Remove from packages that currently have stateId but are NOT in target
    const withState = await getPackagesHavingState(stateId);
    for (const row of withState) {
      if (!target.has(row.packageId)) {
        let arr = parseArr(row.state_ids).map(Number).filter((id) => id !== Number(stateId));
        await setPackageStateIds(row.packageId, arr);
      }
    }

    // Add to packages that should have it
    if (target.size) {
      const wanted = await getPackagesByIds([...target]);
      const haveMap = new Map(wanted.map((r) => [r.packageId, parseArr(r.state_ids).map(Number)]));

      for (const pkgId of target) {
        const arr = haveMap.get(pkgId) ?? [];
        if (!arr.includes(Number(stateId))) {
          arr.push(Number(stateId));
          await setPackageStateIds(pkgId, arr);
        }
      }
    }
  }

  // ---------- routes ----------

  // Get all states
  app.get("/states", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM states");
      res.json(rows);
    } catch (err) {
      console.error("GET /states failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Create new state
  app.post("/states/create", async (req, res) => {
    try {
      const { name, photo_url, package_ids, country_id } = req.body;
      if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

      const pkgIds = sanitizePkgIds(package_ids);

      const [r] = await db.query(
        "INSERT INTO states (name, photo_url, package_ids, country_id) VALUES (?, ?, ?, ?)",
        [name, photo_url || null, toJson(pkgIds), country_id || null]
      );

      await syncStateOnPackages(r.insertId, pkgIds);
      res.status(201).json({ message: "State created", id: r.insertId });
    } catch (err) {
      console.error("POST /states/create failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Update state
  app.put("/states/update/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, photo_url, package_ids, country_id } = req.body;

      const pkgIds = sanitizePkgIds(package_ids);

      const [r] = await db.query(
        "UPDATE states SET name = ?, photo_url = ?, package_ids = ?, country_id = ? WHERE id = ?",
        [name || null, photo_url || null, toJson(pkgIds), country_id || null, id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });

      await syncStateOnPackages(id, pkgIds);
      res.json({ message: "State updated" });
    } catch (err) {
      console.error("PUT /states/update/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Delete state (also remove its id from any packages that still reference it)
  app.delete("/states/delete/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      const withState = await getPackagesHavingState(id);
      for (const row of withState) {
        let arr = parseArr(row.state_ids).map(Number).filter((v) => v !== id);
        await setPackageStateIds(row.packageId, arr);
      }

      const [r] = await db.query("DELETE FROM states WHERE id = ?", [id]);
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.json({ message: "State deleted" });
    } catch (err) {
      console.error("DELETE /states/delete/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Get state by ID (full row)
  app.get("/states/:id", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM states WHERE id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("GET /states/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Minimal: id + name
  app.get("/states/id/:id", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT id, name FROM states WHERE id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "State not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("GET /states/id/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });

  // Optional convenience: by name (often used by UI)
  app.get("/states/name/:name", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT id, name FROM states WHERE name = ?", [req.params.name]);
      res.json(rows?.[0] || {});
    } catch (err) {
      console.error("GET /states/name/:name failed:", err);
      res.status(500).json({ error: "DB_ERROR", details: err.message });
    }
  });
};
