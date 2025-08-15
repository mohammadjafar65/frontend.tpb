// controllers/states.js
// Assumes:
//   - db is a mysql2/promise pool
//   - table `states` has: id, name, photo_url, package_ids (JSON/TEXT), country_id
//   - table `travel_packages` has: packageId (PK), state_ids (JSON/TEXT array of numbers)

module.exports = (app, db) => {
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

  // ---- helpers (promise/async) ---------------------------------------------

  async function getPackagesByIds(ids) {
    if (!ids?.length) return [];
    const [rows] = await db.query(
      "SELECT packageId, state_ids FROM travel_packages WHERE packageId IN (?)",
      [ids]
    );
    return rows;
  }

  async function getPackagesHavingState(stateId) {
    // COALESCE for NULL; JSON_ARRAY(?) so numeric search works
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
   * Ensure ONLY packages in `packageIds` have `stateId` present in their state_ids array.
   * - Add stateId to any package in `packageIds` that doesn't have it
   * - Remove stateId from any package that currently has it but is not in `packageIds`
   */
  async function syncStateOnPackages(stateId, packageIds) {
    const targetIds = new Set(packageIds || []);

    // 1) Remove from packages that currently have stateId but are NOT in target list
    const withState = await getPackagesHavingState(stateId);
    const toRemove = withState.filter((r) => !targetIds.has(r.packageId));
    for (const row of toRemove) {
      let arr = parseArr(row.state_ids);
      arr = arr.filter((id) => id !== Number(stateId));
      await setPackageStateIds(row.packageId, arr);
    }

    // 2) Add to packages that should have it
    if (targetIds.size) {
      const wanted = await getPackagesByIds([...targetIds]);
      const haveMap = new Map(wanted.map((r) => [r.packageId, parseArr(r.state_ids)]));

      for (const pkgId of targetIds) {
        const arr = haveMap.get(pkgId) ?? [];
        if (!arr.includes(Number(stateId))) {
          arr.push(Number(stateId));
          await setPackageStateIds(pkgId, arr);
        }
      }
    }
  }

  // ---- routes ---------------------------------------------------------------

  // Get all states
  app.get("/states", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM states");
      res.json(rows);
    } catch (err) {
      console.error("GET /states failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Create new state
  app.post("/states/create", async (req, res) => {
    try {
      const { name, photo_url, package_ids, country_id } = req.body;
      if (!name) return res.status(400).json({ error: "NAME_REQUIRED" });

      const pkgIds = Array.isArray(package_ids) ? package_ids.map(Number) : [];
      const [r] = await db.query(
        "INSERT INTO states (name, photo_url, package_ids, country_id) VALUES (?, ?, ?, ?)",
        [name, photo_url || null, toJson(pkgIds), country_id || null]
      );

      await syncStateOnPackages(r.insertId, pkgIds);
      res.status(201).json({ message: "State created", id: r.insertId });
    } catch (err) {
      console.error("POST /states/create failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Update state
  app.put("/states/update/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, photo_url, package_ids, country_id } = req.body;
      const pkgIds = Array.isArray(package_ids) ? package_ids.map(Number) : [];

      const [r] = await db.query(
        "UPDATE states SET name = ?, photo_url = ?, package_ids = ?, country_id = ? WHERE id = ?",
        [name || null, photo_url || null, toJson(pkgIds), country_id || null, id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });

      await syncStateOnPackages(id, pkgIds);
      res.json({ message: "State updated" });
    } catch (err) {
      console.error("PUT /states/update/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Delete state
  app.delete("/states/delete/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);

      // remove this state from any packages that still reference it
      const withState = await getPackagesHavingState(id);
      for (const row of withState) {
        let arr = parseArr(row.state_ids).filter((v) => v !== id);
        await setPackageStateIds(row.packageId, arr);
      }

      const [r] = await db.query("DELETE FROM states WHERE id = ?", [id]);
      if (r.affectedRows === 0) return res.status(404).json({ error: "NOT_FOUND" });
      res.json({ message: "State deleted" });
    } catch (err) {
      console.error("DELETE /states/delete/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
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
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });

  // Get state id+name only
  app.get("/states/id/:id", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT id, name FROM states WHERE id = ?", [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: "State not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("GET /states/id/:id failed:", err);
      res.status(500).json({ error: "DB_ERROR", code: err.code, message: err.message });
    }
  });
};
