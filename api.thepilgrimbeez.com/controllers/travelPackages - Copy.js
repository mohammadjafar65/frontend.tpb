const { v4: uuidv4 } = require("uuid");

module.exports = (app, db) => {
  // Fetch all packages
  app.get("/packages", (req, res) => {
    db.query("SELECT * FROM travel_packages", (err, data) => {
      if (err)
        return res.status(500).json({ error: "Failed to fetch packages" });
      return res.json(data);
    });
  });

  // Create new package (image URLs only)
  app.post("/packages/create", (req, res) => {
    try {
      const {
        packageName,
        packageCategory,
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        slug,
        groupSize,
        rating,
        reviewCount,
        country,
        avatar,
        bannerImage,
        featuredImage,
        gallery,
      } = req.body;

      const parseField = (field) => {
        try {
          return JSON.stringify(JSON.parse(req.body[field] || "[]"));
        } catch (e) {
          return "[]";
        }
      };

      const sql = `INSERT INTO travel_packages (
        packageId,
        avatarImage,
        bannerImage,
        featuredImage,
        packageName,
        packageCategory,
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        country,
        slug,
        groupSize,
        rating,
        reviewCount,
        highlights,
        included,
        inclusions,
        exclusions,
        additionalInformation,
        gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        uuidv4(),
        avatar || "",
        bannerImage || "",
        featuredImage || "",
        packageName,
        JSON.stringify(JSON.parse(packageCategory || "[]")),
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        country,
        slug,
        groupSize,
        rating,
        reviewCount,
        parseField("highlights"),
        parseField("included"),
        parseField("inclusions"),
        parseField("exclusions"),
        parseField("additionalInformation"),
        JSON.stringify(JSON.parse(gallery || "[]")),
      ];

      db.query(sql, values, (err) => {
        if (err)
          return res.status(500).json({ error: "Database insert error" });
        res.status(201).json({ message: "Package created successfully" });
      });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }
  });

  // Update existing package (image URLs only)
  app.put("/packages/update/:packageId", (req, res) => {
    try {
      const id = req.params.packageId;

      const {
        packageName,
        packageCategory,
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        country,
        slug,
        groupSize,
        rating,
        reviewCount,
        avatar,
        bannerImage,
        featuredImage,
        gallery,
      } = req.body;

      const parseField = (field) =>
        JSON.stringify(JSON.parse(req.body[field] || "[]"));

      let sql = `
        UPDATE travel_packages SET
          packageName = ?, packageCategory = ?, packageLocation = ?, packagePrice = ?,
          packageDate = ?, packageDurationDate = ?, packageDescription = ?, country = ?, slug = ?,
          groupSize = ?, rating = ?, reviewCount = ?,
          highlights = ?, included = ?, inclusions = ?, exclusions = ?, additionalInformation = ?`;

      const values = [
        packageName,
        JSON.stringify(JSON.parse(packageCategory || "[]")),
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        country,
        slug,
        groupSize,
        rating,
        reviewCount,
        parseField("highlights"),
        parseField("included"),
        parseField("inclusions"),
        parseField("exclusions"),
        parseField("additionalInformation"),
      ];

      if (avatar) {
        sql += ", avatarImage = ?";
        values.push(avatar);
      }
      if (bannerImage) {
        sql += ", bannerImage = ?";
        values.push(bannerImage);
      }
      if (featuredImage) {
        sql += ", featuredImage = ?";
        values.push(featuredImage);
      }
      if (gallery) {
        sql += ", gallery = ?";
        values.push(JSON.stringify(JSON.parse(gallery)));
      }

      sql += " WHERE packageId = ?";
      values.push(id);

      db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Package updated successfully" });
      });
    } catch (err) {
      res.status(500).json({ error: "Internal error", details: err.message });
    }
  });

  // Delete package
  app.delete("/packages/delete/:packageId", (req, res) => {
    db.query(
      "DELETE FROM travel_packages WHERE packageId = ?",
      [req.params.packageId],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Package not found" });
        }
        res.json({ message: "Package deleted successfully" });
      }
    );
  });

  // Get single package
  app.get("/packages/id/:packageId", (req, res) => {
    db.query(
      "SELECT * FROM travel_packages WHERE packageId = ?",
      [req.params.packageId],
      (err, result) => {
        if (err)
          return res.status(500).json({ error: "Internal server error" });
        if (!result.length)
          return res.status(404).json({ message: "Package not found" });
        res.json(result[0]);
      }
    );
  });

  // Get all unique categories from travel_packages
  app.get("/packages/categories", (req, res) => {
    db.query("SELECT packageCategory FROM travel_packages", (err, results) => {
      if (err)
        return res.status(500).json({ error: "Failed to fetch categories" });

      const uniqueCategories = new Set();

      results.forEach((row) => {
        try {
          const categories = JSON.parse(row.packageCategory || "[]");
          categories.forEach((cat) => uniqueCategories.add(cat));
        } catch (e) {
          // Ignore parse errors
        }
      });

      res.json([...uniqueCategories]);
    });
  });

  // Get all unique locations with number of packages and one image
  app.get("/country", (req, res) => {
    const sql = `
      SELECT 
        country AS country,
        COUNT(*) AS packages,
        MAX(avatarImage) AS img
      FROM travel_packages
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching country:", err);
        return res.status(500).json({ error: "Failed to fetch country" });
      }

      // Add animation delay dynamically
      const withDelay = results.map((item, index) => ({
        ...item,
        delayAnim: `${(index + 1) * 100}`,
      }));

      res.json(withDelay);
    });
  });
};