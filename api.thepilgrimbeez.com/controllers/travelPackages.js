// controllers/packages.js
const { v4: uuidv4 } = require("uuid");

// PUT NEAR THE TOP (helpers)
function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function addPkgToStates(db, pkgId, stateIds) {
  if (!Array.isArray(stateIds) || !stateIds.length) return;

  const ids = stateIds
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x) && x > 0);

  if (!ids.length) return;

  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT id, package_ids FROM states WHERE id IN (${placeholders})`,
    ids
  );

  for (const row of rows) {
    let arr = [];
    try { arr = JSON.parse(row.package_ids || "[]"); } catch { arr = []; }
    if (!Array.isArray(arr)) arr = [];
    if (!arr.includes(pkgId)) {
      arr.push(pkgId);
      await db.query(
        "UPDATE states SET package_ids = ? WHERE id = ?",
        [JSON.stringify(arr), row.id]
      );
    }
  }
}

// ---- GEO helpers ----
async function getValidStateIdSet(db) {
  // states that belong to a country that belongs to a continent
  const [rows] = await db.query(`
    SELECT s.id AS state_id
    FROM states s
    JOIN countries c   ON c.id = s.country_id
    JOIN continents co ON co.id = c.continent_id
  `);
  return new Set(rows.map(r => Number(r.state_id)));
}

function pkgHasAtLeastOneValidState(pkg, validStateIds) {
  let ids = [];
  try { ids = JSON.parse(pkg.state_ids || "[]"); } catch { ids = []; }
  ids = (Array.isArray(ids) ? ids : []).map(Number).filter(Boolean);
  if (!ids.length) return false;
  return ids.some(id => validStateIds.has(id));
}

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
            thingsToMaintain, policies, terms, basePrice, state_ids, isVisible
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        num(pickField(fields, "isVisible"), 1),
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
          thingsToMaintain=?, policies=?, terms=?, basePrice=?, state_ids=?, isVisible=?
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
        num(pickField(fields, "isVisible"), 1),
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
  // REPLACE your DUPLICATE route with this version
  app.post("/packages/duplicate/:packageId", async (req, res) => {
    const conn = await db.getConnection(); // mysql2/promise pool
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        "SELECT * FROM travel_packages WHERE packageId = ?",
        [req.params.packageId]
      );
      if (!rows?.length) {
        await conn.rollback();
        return res.status(404).json({ error: "Original package not found" });
      }

      const original = rows[0];
      const newId = uuidv4();

      // ---- safe slug (avoid null/long)
      const base = original.slug || original.packageName || "package";
      const safeBase = slugify(base);

      // keep room for suffix; adjust 191/255 depending on your column
      const MAX = 191;

      // Use timestamp + random short id to avoid collisions on rapid duplicates
      const suffix = `-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let newSlug = (safeBase + suffix).slice(0, MAX);

      // If you have a UNIQUE index on slug and want to be extra safe:
      // try reinserting with a random suffix on duplicate-key error below.

      // Parse state_ids (string JSON in DB)
      let stateIds = [];
      try { stateIds = JSON.parse(original.state_ids || "[]"); } catch { stateIds = []; }
      if (!Array.isArray(stateIds)) stateIds = [];

      const sql = `
      INSERT INTO travel_packages (
        packageId, avatarImage, bannerImage, featuredImage, packageName, packageCategory,
        packageDuration, packageDescription, slug, rating, reviewCount,
        gallery, itinerary, included, specialInstructions, conditionsOfTravel,
        thingsToMaintain, policies, terms, basePrice, state_ids, isVisible
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        newId,
        original.avatarImage,
        original.bannerImage,
        original.featuredImage || "",
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
        original.state_ids || "[]",
        original.isVisible,
      ];

      await conn.query(sql, values);

      await addPkgToStates(conn, newId, stateIds);

      await conn.commit();
      res.json({ message: "Package duplicated", newPackageId: newId, slug: newSlug });
    } catch (e) {
      try { await (conn && conn.rollback()); } catch { }
      if (e && e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "SLUG_CONFLICT", details: "Duplicate slug. Retry." });
      }
      res.status(500).json({ error: "Failed to duplicate package", details: e.message });
    } finally {
      if (conn) conn.release();
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
        "WHERE isVisible = 1 AND JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
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
        "WHERE isVisible = 1 AND JSON_CONTAINS(COALESCE(state_ids, JSON_ARRAY()), JSON_ARRAY(?))",
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
        "WHERE isVisible = 1 AND JSON_LENGTH(COALESCE(state_ids, JSON_ARRAY())) > 0"
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
  app.get("/packages/categories", async (req, res) => {
    try {
      const withState = String(req.query.with_state ?? "1") === "1";
      let rows;

      if (withState) {
        [rows] = await db.query(
          "SELECT packageCategory FROM travel_packages " +
          "WHERE JSON_LENGTH(COALESCE(state_ids, JSON_ARRAY())) > 0"
        );
      } else {
        [rows] = await db.query("SELECT packageCategory FROM travel_packages");
      }

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
      res.status(500).json({ error: "Failed to fetch categories", details: e.message });
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
      const withState = String(req.query.with_state ?? "1") === "1";

      let rows;
      if (withState) {
        [rows] = await db.query(
          "SELECT * FROM travel_packages " +
          "WHERE isVisible = 1 AND JSON_LENGTH(COALESCE(state_ids, JSON_ARRAY())) > 0"
        );
      } else {
        [rows] = await db.query("SELECT * FROM travel_packages WHERE isVisible = 1");
      }

      const filtered = rows.filter((pkg) => {
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          return cats.some((c) => String(c).trim().toLowerCase() === category);
        } catch {
          return false;
        }
      });

      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/packages/toggle-visibility/:packageId", async (req, res) => {
    try {
      const { isVisible } = req.body; // expects { isVisible: 0 or 1 }
      const [r] = await db.query(
        "UPDATE travel_packages SET isVisible=? WHERE packageId=?",
        [Number(isVisible) ? 1 : 0, req.params.packageId]
      );
      if (r.affectedRows === 0)
        return res.status(404).json({ message: "Package not found" });
      res.json({ message: "Visibility updated successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update visibility", details: e.message });
    }
  });

  // GET /packages/with-geo : only return packages with at least one valid geo chain
  app.get("/packages/with-geo", async (_req, res) => {
    try {
      const validStateIds = await getValidStateIdSet(db);

      // first, only rows that even have some state_ids
      const [rows] = await db.query(
        "SELECT * FROM travel_packages WHERE isVisible = 1 AND JSON_LENGTH(COALESCE(state_ids, JSON_ARRAY())) > 0"
      );

      const filtered = rows.filter(pkg => pkgHasAtLeastOneValidState(pkg, validStateIds));
      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch packages", details: e.message });
    }
  });
};
