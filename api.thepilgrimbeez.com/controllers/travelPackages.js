// controllers/packages.js
const { v4: uuidv4 } = require("uuid");

// ---- formidable v2/v3 compatible import + promisified parse ----
let _formidable = require("formidable");
const formidable = _formidable.formidable || _formidable; // v3 exports { formidable }
const parseForm = (req, opts = { multiples: true }) =>
  new Promise((resolve, reject) => {
    const form = formidable(opts);
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });

// ----- small helpers -----
const pickField = (fields, key) => (Array.isArray(fields?.[key]) ? fields[key][0] : fields?.[key]);
const parseField = (fields, field, fallback = "[]") => {
  let raw = pickField(fields, field);
  if (raw == null || raw === "" || raw === "undefined") return fallback;
  try {
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { /* keep string */ }
    }
    return JSON.stringify(parsed);
  } catch {
    return fallback;
  }
};
const num = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);

module.exports = (app, db) => {
  // ---------------- STATES (light helpers some UIs call from here) ----------------
  app.get("/states", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT id, name, photo_url, package_ids FROM states");
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch states", details: e.message });
    }
  });

  app.get("/states/name/:name", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT id, name FROM states WHERE name = ?", [req.params.name]);
      res.json(rows?.[0] || {});
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch state", details: e.message });
    }
  });

  // ---------------- PACKAGES ----------------
  app.get("/packages", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM travel_packages");
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch packages", details: e.message });
    }
  });

  // CREATE
  app.post("/packages/create", async (req, res) => {
    try {
      const { fields } = await parseForm(req);

      const sql = `
        INSERT INTO travel_packages (
          packageId, avatarImage, bannerImage, featuredImage, packageName, packageCategory,
          packageDuration, packageDescription, slug, rating, reviewCount,
          gallery, itinerary, included, specialInstructions, conditionsOfTravel,
          thingsToMaintain, policies, terms, basePrice, state_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        uuidv4(),
        parseField(fields, "avatar"),
        parseField(fields, "bannerImage"),
        pickField(fields, "featuredImage") || "",
        pickField(fields, "packageName"),
        parseField(fields, "packageCategory"),
        pickField(fields, "packageDuration"),
        pickField(fields, "packageDescription"),
        pickField(fields, "slug"),
        num(pickField(fields, "rating"), 0),
        num(pickField(fields, "reviewCount"), 0),
        parseField(fields, "gallery"),
        parseField(fields, "itinerary"),
        parseField(fields, "included"),
        pickField(fields, "specialInstructions") || "",
        pickField(fields, "conditionsOfTravel") || "",
        pickField(fields, "thingsToMaintain") || "",
        pickField(fields, "policies") || "",
        pickField(fields, "terms") || "",
        num(pickField(fields, "basePrice"), 0),
        parseField(fields, "state_ids"), // JSON string like "[1,2]"
      ];

      await db.query(sql, values);
      res.status(201).json({ message: "Package created successfully" });
    } catch (e) {
      res.status(500).json({ error: "Database insert error", details: e.message });
    }
  });

  // UPDATE
  app.post("/packages/update/:packageId", async (req, res) => {
    try {
      const { fields } = await parseForm(req);

      const sql = `
        UPDATE travel_packages SET
          avatarImage=?, bannerImage=?, featuredImage=?, packageName=?, packageCategory=?,
          packageDuration=?, packageDescription=?, slug=?, rating=?, reviewCount=?,
          gallery=?, itinerary=?, included=?, specialInstructions=?, conditionsOfTravel=?,
          thingsToMaintain=?, policies=?, terms=?, basePrice=?, state_ids=?
        WHERE packageId=?
      `;

      const values = [
        parseField(fields, "avatar"),
        parseField(fields, "bannerImage"),
        pickField(fields, "featuredImage") || "",
        pickField(fields, "packageName"),
        parseField(fields, "packageCategory"),
        pickField(fields, "packageDuration"),
        pickField(fields, "packageDescription"),
        pickField(fields, "slug"),
        num(pickField(fields, "rating"), 0),
        num(pickField(fields, "reviewCount"), 0),
        parseField(fields, "gallery"),
        parseField(fields, "itinerary"),
        parseField(fields, "included"),
        pickField(fields, "specialInstructions") || "",
        pickField(fields, "conditionsOfTravel") || "",
        pickField(fields, "thingsToMaintain") || "",
        pickField(fields, "policies") || "",
        pickField(fields, "terms") || "",
        num(pickField(fields, "basePrice"), 0),
        parseField(fields, "state_ids"),
        req.params.packageId,
      ];

      const [r] = await db.query(sql, values);
      if (r.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
      res.json({ message: "Package updated successfully" });
    } catch (e) {
      res.status(500).json({ error: "Database update error", details: e.message });
    }
  });

  // DUPLICATE
  app.post("/packages/duplicate/:packageId", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM travel_packages WHERE packageId = ?",
        [req.params.packageId]
      );
      if (!rows?.length) return res.status(404).json({ error: "Original package not found" });

      const original = rows[0];
      const newId = uuidv4();
      const newSlug = `${original.slug}-${Date.now()}`;

      const sql = `
        INSERT INTO travel_packages (
          packageId, avatarImage, bannerImage, featuredImage, packageName, packageCategory,
          packageDuration, packageDescription, slug, rating, reviewCount,
          gallery, itinerary, included, specialInstructions, conditionsOfTravel,
          thingsToMaintain, policies, terms, basePrice, state_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        newId,
        original.avatarImage,
        original.bannerImage,
        original.featuredImage,
        `${original.packageName} (Copy)`,
        original.packageCategory,
        original.packageDuration,
        original.packageDescription,
        newSlug,
        original.rating,
        original.reviewCount,
        original.gallery,
        original.itinerary,
        original.included,
        original.specialInstructions,
        original.conditionsOfTravel,
        original.thingsToMaintain,
        original.policies,
        original.terms,
        original.basePrice,
        original.state_ids,
      ];
      await db.query(sql, values);
      res.json({ message: "Package duplicated", newPackageId: newId });
    } catch (e) {
      res.status(500).json({ error: "Failed to duplicate package", details: e.message });
    }
  });

  // DELETE
  app.delete("/packages/delete/:packageId", async (req, res) => {
    try {
      const [r] = await db.query(
        "DELETE FROM travel_packages WHERE packageId = ?",
        [req.params.packageId]
      );
      if (r.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
      res.json({ message: "Package deleted successfully" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // BY STATE (id or name)
  app.get("/packages/by-state/:stateId", async (req, res) => {
    try {
      let stateId = req.params.stateId;
      if (isNaN(stateId)) {
        const [s] = await db.query("SELECT id FROM states WHERE name = ?", [stateId]);
        if (!s?.length) return res.json([]);
        stateId = s[0].id;
      } else {
        stateId = Number(stateId);
      }

      const [rows] = await db.query(
        "SELECT * FROM travel_packages " +
        "WHERE JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
        [stateId]
      );
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // BY STATE NAME (direct)
  app.get("/packages/by-state-name/:stateName", async (req, res) => {
    try {
      const [s] = await db.query("SELECT id FROM states WHERE name = ?", [req.params.stateName]);
      if (!s?.length) return res.json([]);
      const [rows] = await db.query(
        "SELECT * FROM travel_packages " +
        "WHERE JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
        [s[0].id]
      );
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // WITH STATE
  app.get("/packages/with-state", async (_req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM travel_packages " +
        "WHERE JSON_LENGTH(COALESCE(state_ids, JSON_ARRAY())) > 0"
      );
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch packages", details: e.message });
    }
  });

  // BY STATE + CATEGORY (state id or name)
  app.get("/packages/by-state-category/:stateOrName/:category", async (req, res) => {
    try {
      const category = String(req.params.category).trim().toLowerCase();

      let stateId = req.params.stateOrName;
      if (isNaN(stateId)) {
        const [s] = await db.query("SELECT id FROM states WHERE name = ?", [stateId]);
        if (!s?.length) return res.json([]);
        stateId = s[0].id;
      } else {
        stateId = Number(stateId);
      }

      const [rows] = await db.query(
        "SELECT * FROM travel_packages " +
        "WHERE JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
        [stateId]
      );

      // filter by category in JS (packageCategory is JSON)
      const filtered = rows.filter((pkg) => {
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          return cats.some((c) => String(c).trim().toLowerCase() === category);
        } catch { return false; }
      });

      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // CATEGORIES
  app.get("/packages/categories", async (_req, res) => {
    try {
      const [rows] = await db.query("SELECT packageCategory FROM travel_packages");
      const all = [];
      for (const r of rows) {
        try {
          const cats = JSON.parse(r.packageCategory || "[]");
          all.push(...cats);
        } catch { /* ignore */ }
      }
      const unique = Array.from(new Set(all.map((c) => String(c).trim()).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
      res.json(unique);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // BY PACKAGE ID (add state names)
  app.get("/packages/id/:packageId", async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM travel_packages WHERE packageId = ?",
        [req.params.packageId]
      );
      if (!rows?.length) return res.status(404).json({ message: "Package not found" });
      const pkg = rows[0];

      let stateIds = [];
      try { stateIds = JSON.parse(pkg.state_ids || "[]"); } catch { stateIds = []; }
      if (!Array.isArray(stateIds) || !stateIds.length) return res.json(pkg);

      const placeholders = stateIds.map(() => "?").join(",");
      const [states] = await db.query(
        `SELECT id, name FROM states WHERE id IN (${placeholders})`,
        stateIds
      );
      res.json({ ...pkg, stateNames: states });
    } catch (e) {
      res.status(500).json({ error: "Internal server error", details: e.message });
    }
  });

  // BY CATEGORY
  app.get("/packages/by-category/:category", async (req, res) => {
    try {
      const category = String(req.params.category).trim().toLowerCase();
      const [rows] = await db.query("SELECT * FROM travel_packages");
      const filtered = rows.filter((pkg) => {
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          return cats.some((c) => String(c).trim().toLowerCase() === category);
        } catch { return false; }
      });
      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
};
