const { v4: uuidv4 } = require("uuid");
const formidable = require("formidable");

// --- helpers ---------------------------------------------------
const log = (msg, data) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`, data || "");
};

// Formidable often gives arrays; normalize to a single string
const pickField = (fields, key) => {
  const v = fields?.[key];
  if (Array.isArray(v)) return v[0];
  return v;
};

// Safely parse a field that should contain JSON. Always return a JSON string.
const parseField = (fields, field, fallback = "[]") => {
  let raw = pickField(fields, field);
  if (raw == null || raw === "" || raw === "undefined") return fallback;
  try {
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed); } catch { /* keep as string */ }
    }
    return JSON.stringify(parsed);
  } catch {
    return fallback;
  }
};

// Coerce numbers coming from multipart forms
const num = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

module.exports = (app, db) => {
  // ---------- STATES ENDPOINTS (needed by your frontend) ----------
  // GET all states
  app.get("/states", (req, res) => {
    db.query("SELECT id, name, photo_url, package_ids FROM states", (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch states" });
      res.json(rows || []);
    });
  });

  // GET state by name (for /tour-list-v2?state=Gujarat lookups)
  app.get("/states/name/:name", (req, res) => {
    db.query("SELECT id, name FROM states WHERE name = ?", [req.params.name], (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch state" });
      if (!rows?.length) return res.json({}); // keep client logic simple
      res.json(rows[0]);
    });
  });

  // ---------- PACKAGES ----------
  app.get("/packages", (req, res) => {
    db.query("SELECT * FROM travel_packages", (err, data) => {
      if (err) return res.status(500).json({ error: "Failed to fetch packages" });
      res.json(data);
    });
  });

  // CREATE
  app.post("/packages/create", (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields /* , files */) => {
      if (err) return res.status(500).json({ error: "Form parse error", details: err });

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

      const sql = `
        INSERT INTO travel_packages (
          packageId, avatarImage, bannerImage, featuredImage, packageName, packageCategory,
          packageDuration, packageDescription, slug, rating, reviewCount,
          gallery, itinerary, included, specialInstructions, conditionsOfTravel,
          thingsToMaintain, policies, terms, basePrice, state_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, values, (e) => {
        if (e) return res.status(500).json({ error: "Database insert error", details: e });
        res.status(201).json({ message: "Package created successfully" });
      });
    });
  });

  // UPDATE
  app.post("/packages/update/:packageId", (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields /* , files */) => {
      if (err) return res.status(500).json({ error: "Form parse error", details: err });

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
        req.params.packageId
      ];

      const sql = `
        UPDATE travel_packages SET
          avatarImage=?, bannerImage=?, featuredImage=?, packageName=?, packageCategory=?,
          packageDuration=?, packageDescription=?, slug=?, rating=?, reviewCount=?,
          gallery=?, itinerary=?, included=?, specialInstructions=?, conditionsOfTravel=?,
          thingsToMaintain=?, policies=?, terms=?, basePrice=?, state_ids=?
        WHERE packageId=?
      `;

      db.query(sql, values, (e, result) => {
        if (e) return res.status(500).json({ error: "Database update error", details: e });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
        res.json({ message: "Package updated successfully" });
      });
    });
  });

  // DUPLICATE
  app.post("/packages/duplicate/:packageId", (req, res) => {
    const { packageId } = req.params;
    db.query("SELECT * FROM travel_packages WHERE packageId = ?", [packageId], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error", details: err });
      if (!result?.length) return res.status(404).json({ error: "Original package not found" });

      const original = result[0];
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
      db.query(sql, values, (e) => {
        if (e) return res.status(500).json({ error: "Failed to duplicate package" });
        res.json({ message: "Package duplicated", newPackageId: newId });
      });
    });
  });

  // DELETE
  app.delete("/packages/delete/:packageId", (req, res) => {
    db.query("DELETE FROM travel_packages WHERE packageId = ?", [req.params.packageId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
      res.json({ message: "Package deleted successfully" });
    });
  });

  // BY STATE (id or name)
  app.get("/packages/by-state/:stateId", (req, res) => {
    let stateId = req.params.stateId;

    if (isNaN(stateId)) {
      db.query("SELECT id FROM states WHERE name = ?", [stateId], (err, stateRows) => {
        if (err) return res.status(500).json({ error: err });
        if (!stateRows?.length) return res.json([]);
        const id = stateRows[0].id;
        db.query(
          "SELECT * FROM travel_packages WHERE JSON_CONTAINS(state_ids, ?, '$')",
          [JSON.stringify(Number(id))],
          (err2, pkgRows) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json(pkgRows);
          }
        );
      });
    } else {
      db.query(
        "SELECT * FROM travel_packages WHERE JSON_CONTAINS(state_ids, ?, '$')",
        [JSON.stringify(Number(stateId))],
        (err, pkgRows) => {
          if (err) return res.status(500).json({ error: err });
          res.json(pkgRows);
        }
      );
    }
  });

  // BY STATE NAME (direct)
  app.get("/packages/by-state-name/:stateName", (req, res) => {
    db.query("SELECT id FROM states WHERE name=?", [req.params.stateName], (err, stateRows) => {
      if (err) return res.status(500).json({ error: err });
      if (!stateRows?.length) return res.json([]);
      const stateId = stateRows[0].id;
      db.query(
        "SELECT * FROM travel_packages WHERE JSON_CONTAINS(state_ids, ?, '$')",
        [JSON.stringify(Number(stateId))],
        (err2, pkgRows) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json(pkgRows);
        }
      );
    });
  });

  // WITH STATE
  app.get("/packages/with-state", (req, res) => {
    db.query("SELECT * FROM travel_packages", (err, data) => {
      if (err) return res.status(500).json({ error: "Failed to fetch packages" });
      const filtered = data.filter(pkg => {
        try {
          const arr = JSON.parse(pkg.state_ids || "[]");
          return Array.isArray(arr) && arr.length > 0;
        } catch { return false; }
      });
      res.json(filtered);
    });
  });

  // BY STATE + CATEGORY (single route that accepts id or name)  ← CONSOLIDATED
  app.get("/packages/by-state-category/:stateOrName/:category", (req, res) => {
    const raw = req.params.stateOrName;
    const category = req.params.category.trim().toLowerCase();

    const runFilter = (rows, resolvedStateId) => {
      return rows.filter(pkg => {
        let hasState = false, hasCategory = false;
        try {
          const ids = JSON.parse(pkg.state_ids || "[]");
          hasState = Array.isArray(ids) ? ids.includes(Number(resolvedStateId)) : false;
        } catch {}
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          hasCategory = cats.some(c => String(c).trim().toLowerCase() === category);
        } catch {}
        return hasState && hasCategory;
      });
    };

    const finish = (stateId) => {
      db.query("SELECT * FROM travel_packages", (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(runFilter(rows, stateId));
      });
    };

    if (isNaN(raw)) {
      db.query("SELECT id FROM states WHERE name = ?", [raw], (err, stateRows) => {
        if (err) return res.status(500).json({ error: err });
        if (!stateRows?.length) return res.json([]);
        finish(stateRows[0].id);
      });
    } else {
      finish(Number(raw));
    }
  });

  // CATEGORIES
  app.get("/packages/categories", (req, res) => {
    db.query("SELECT packageCategory FROM travel_packages", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const all = [];
      rows.forEach(pkg => {
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          all.push(...cats);
        } catch { /* ignore */ }
      });
      const unique = Array.from(new Set(all.map(c => String(c).trim()).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
      res.json(unique);
    });
  });

  // BY PACKAGE ID (with state names)
  app.get("/packages/id/:packageId", (req, res) => {
    db.query(`SELECT * FROM travel_packages WHERE packageId = ?`, [req.params.packageId], (err, result) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!result?.length) return res.status(404).json({ message: "Package not found" });
      const pkg = result[0];
      let stateIds = [];
      try { stateIds = JSON.parse(pkg.state_ids || "[]"); } catch { /* ignore */ }
      if (!Array.isArray(stateIds) || !stateIds.length) return res.json(pkg);
      const placeholders = stateIds.map(() => "?").join(",");
      db.query(`SELECT id, name FROM states WHERE id IN (${placeholders})`, stateIds, (e, states) => {
        if (e) return res.json(pkg);
        res.json({ ...pkg, stateNames: states });
      });
    });
  });

  // BY CATEGORY
  app.get("/packages/by-category/:category", (req, res) => {
    const category = req.params.category.trim().toLowerCase();
    db.query("SELECT * FROM travel_packages", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const filtered = rows.filter(pkg => {
        try {
          const cats = JSON.parse(pkg.packageCategory || "[]");
          return cats.some(c => String(c).trim().toLowerCase() === category);
        } catch { return false; }
      });
      res.json(filtered);
    });
  });
};
