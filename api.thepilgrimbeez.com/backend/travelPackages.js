module.exports = (app, db, upload, uuidv4) => {
  // Route to get all travel packages
  app.get("/packages", (req, res) => {
    // Logic to fetch all travel packages from the database
    const sql = "SELECT * FROM travel_packages";
    db.query(sql, (err, data) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error fetching travel packages" });
      }
      return res.json(data);
    });
  });

  // POST route to create a new travel package
  app.post(
    "/packages/create",
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "gallery", maxCount: 10 },
      { name: "bannerImage", maxCount: 1 },
      { name: "featuredImage", maxCount: 1 },
    ]),
    (req, res) => {
      console.log(req.files); // Log the files received
      console.log(req.body); // Log the body content

      if (!req.files["avatar"] || req.files["avatar"].length === 0) {
        return res.status(400).json({ error: "Avatar image is required" });
      }

      const avatarImage = req.files["avatar"][0].filename;
      const bannerImage = req.files["bannerImage"]
        ? req.files["bannerImage"][0].filename
        : null;
      const featuredImage = req.files["featuredImage"]
        ? req.files["featuredImage"][0].filename
        : null;

      const packageId = uuidv4();
      const sql =
        "INSERT INTO travel_packages (`id`, `imageUrl`, `bannerImage`, `featuredImage`, `packageName`, `category`, `packageLocation`, `packagePrice`, `packageDate`, `packageDurationDate`, `packageDescription`, `amenitiesInHotel`, `agentName`, `agentNumber`, `slug`, `groupSize`, `rating`, `reviewCount`, `nearPublicTransport`, `freeCancellation`, `instantConfirmation`, `languages`, `highlights`, `inclusions`, `exclusions`, `departureTime`, `boardingTime`, `departureAddress`, `cancellationNoticeHours`, `recommendationPercent`, `tourDescription`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      const values = [
        packageId,
        avatarImage,
        bannerImage,
        featuredImage,
        req.body.packageName,
        req.body.packageCategory,
        req.body.packageLocation,
        req.body.packagePrice,
        req.body.packageDate,
        req.body.packageDurationDate,
        req.body.packageDescription,
        req.body.amenitiesInHotel,
        req.body.agentName,
        req.body.agentNumber,
        req.body.slug,
        req.body.groupSize,
        req.body.rating,
        req.body.reviewCount,
        req.body.nearPublicTransport,
        req.body.freeCancellation,
        req.body.instantConfirmation,
        JSON.stringify(req.body.languages || []),
        JSON.stringify(req.body.highlights || []),
        JSON.stringify(req.body.inclusions || []),
        JSON.stringify(req.body.exclusions || []),
        req.body.departureTime,
        req.body.boardingTime,
        req.body.departureAddress,
        req.body.cancellationNoticeHours,
        req.body.recommendationPercent,
        req.body.tourDescription,
      ];

      db.query(sql, values, (err, packageInsertData) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }

        // If gallery images are uploaded, insert them into the package_images table
        if (req.files["gallery"]) {
          const galleryImages = req.files["gallery"].map(
            (file) => file.filename
          );
          const imageInsertSql =
            "INSERT INTO package_images (`package_id`, `image_url`) VALUES ?";
          const imageValues = galleryImages.map((image) => [packageId, image]);

          db.query(imageInsertSql, [imageValues], (err, imagesInsertData) => {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ error: "Error adding gallery images" });
            }
            return res.json({
              message: "Package and gallery images added successfully",
              packageData: packageInsertData,
              galleryData: imagesInsertData,
            });
          });
        } else {
          return res.json({
            message:
              "Package added successfully, but no gallery images were provided",
            packageData: packageInsertData,
          });
        }
      });
    }
  );

  // Update a package
  app.put(
    "/packages/update/:id",
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "bannerImage", maxCount: 1 },
      { name: "featuredImage", maxCount: 1 },
    ]),
    (req, res) => {
      const id = req.params.id;
      const {
        packageName,
        packageCategory,
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        amenitiesInHotel,
        agentName,
        agentNumber,
      } = req.body;

      const avatarImage = req.files["avatar"]
        ? req.files["avatar"][0].filename
        : null;
      const bannerImage = req.files["bannerImage"]
        ? req.files["bannerImage"][0].filename
        : null;
      const featuredImage = req.files["featuredImage"]
        ? req.files["featuredImage"][0].filename
        : null;

      let sql =
        "UPDATE travel_packages SET `packageName` = ?, `category` = ?, `packageLocation` = ?, `packagePrice` = ?, `packageDate` = ?, `packageDurationDate` = ?, `packageDescription` = ?, `amenitiesInHotel` = ?, `agentName` = ?, `agentNumber` = ?, `slug` = ?, `groupSize` = ?, `rating` = ?, `reviewCount` = ?, `nearPublicTransport` = ?, `freeCancellation` = ?, `instantConfirmation` = ?, `languages` = ?, `highlights` = ?, `inclusions` = ?, `exclusions` = ?, `departureTime` = ?, `boardingTime` = ?, `departureAddress` = ?, `cancellationNoticeHours` = ?, `recommendationPercent` = ?, `tourDescription` = ?";
      const values = [
        packageName,
        packageCategory,
        packageLocation,
        packagePrice,
        packageDate,
        packageDurationDate,
        packageDescription,
        amenitiesInHotel,
        agentName,
        agentNumber,
        req.body.slug,
        req.body.groupSize,
        req.body.rating,
        req.body.reviewCount,
        req.body.nearPublicTransport,
        req.body.freeCancellation,
        req.body.instantConfirmation,
        JSON.stringify(req.body.languages || []),
        JSON.stringify(req.body.highlights || []),
        JSON.stringify(req.body.inclusions || []),
        JSON.stringify(req.body.exclusions || []),
        req.body.departureTime,
        req.body.boardingTime,
        req.body.departureAddress,
        req.body.cancellationNoticeHours,
        req.body.recommendationPercent,
        req.body.tourDescription,
      ];

      if (avatarImage) {
        sql += ", `imageUrl` = ?";
        values.push(avatarImage);
      }
      if (bannerImage) {
        sql += ", `bannerImage` = ?";
        values.push(bannerImage);
      }
      if (featuredImage) {
        sql += ", `featuredImage` = ?";
        values.push(featuredImage);
      }
      sql += " WHERE `id` = ?";
      values.push(id);

      db.query(sql, values, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(data);
      });
    }
  );

  // Delete a package
  app.delete("/packages/delete/:id", (req, res) => {
    const sql = "DELETE FROM travel_packages WHERE `id` = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      // It might be good to check if the delete was actually performed (affected rows)
      if (data.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Package not found or already deleted" });
      }
      return res.json({ message: "Package deleted successfully", data });
    });
  });

  // Route to get packages by category
  app.get("/packages/category/:category", async (req, res) => {
    try {
      const allPackages = await getAllPackages();
      const filteredPackages = allPackages.filter(
        (pkg) => pkg.category === req.params.category
      );
      res.json(filteredPackages);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // Function to get all packages
  const getAllPackages = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM travel_packages";
      db.query(sql, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

  // Route to get a package by id
  app.get("/packages/id/:id", async (req, res) => {
    try {
      const packageDetailsSql = `
      SELECT p.*, GROUP_CONCAT(i.image_url) as imageUrls
      FROM travel_packages p
      LEFT JOIN package_images i ON p.id = i.package_id
      WHERE p.id = ?
      GROUP BY p.id
    `;

      db.query(packageDetailsSql, [req.params.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: "Package not found" });
        }

        const packageData = results[0];
        packageData.imageUrls = packageData.imageUrls
          ? packageData.imageUrls.split(",")
          : [];
        res.json(packageData);
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  // Other routes and logic...
};
