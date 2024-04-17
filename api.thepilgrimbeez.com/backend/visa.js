module.exports = (app, db, upload, uuidv4) => {
    // Route to get all travel visas
    app.get("/api.thepilgrimbeez.com/visa", (req, res) => {
        // Logic to fetch all travel visas from the database
        const sql = "SELECT * FROM travel_visa";
        db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error fetching travel visa" });
        }
        return res.json(data);
        });
    });
    
    // POST route to create a new travel visa
    app.post(
        "/api.thepilgrimbeez.com/visa/create",
        upload.fields([
            { name: "avatar", maxCount: 1 },
            { name: "gallery", maxCount: 10 },
        ]),
        (req, res) => {
            console.log(req.files); // Log the files received
            console.log(req.body); // Log the body content
            if (!req.files["avatar"] || req.files["avatar"].length === 0) {
                return res.status(400).json({ error: "Avatar image is required" });
            }
    
            const avatarImage = req.files["avatar"][0].filename;
            const visaId = uuidv4();
            const sql =
                "INSERT INTO travel_visa (`id`, `imageUrl`, `visaName`, `visaLocation`, `visaPrice`, `visaDate`, `visaDurationDate`, `visaDescription`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const values = [
                visaId,
                avatarImage,
                req.body.visaName,
                req.body.visaLocation,
                req.body.visaPrice,
                req.body.visaDate,
                req.body.visaDurationDate,
                req.body.visaDescription,
            ];
    
            db.query(sql, values, (err, visaInsertData) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: err.message });
                }
                // If gallery images are uploaded, insert them into the visa_images table
                // Use the inserted visa's ID for the gallery images
                if (req.files["gallery"]) {
                    const galleryImages = req.files["gallery"].map((file) => file.filename);
                    const imageInsertSql = "INSERT INTO visa_images (`visa_id`, `image_url`) VALUES ?";
                    const imageValues = galleryImages.map((image) => [visaId, image]); // Ensure visaId is correct
    
                    db.query(imageInsertSql, [imageValues], (err, imagesInsertData) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: "Error adding gallery images" });
                        }
                        return res.json({
                            message: "visa and gallery images added successfully",
                            visaData: visaInsertData,
                            galleryData: imagesInsertData,
                        });
                    });
                } else {
                    return res.json({
                        message: "visa added successfully, but no gallery images were provided",
                        visaData: visaInsertData,
                    });
                }
            });
        }
    );
    
    // Update a visa
    app.put("/api.thepilgrimbeez.com/visa/update/:id", (req, res) => {
        // Ensure field names match those in the visa table
        const sql = "UPDATE travel_visa SET `imageUrl` = ?, `visaName` = ?, `visaLocation` = ?, `visaPrice` = ?  WHERE `id` = ?";
        const values = [req.body.imageUrl, req.body.visaName, req.body.visaLocation, req.body.visaPrice]; // Add other fields as necessary
        const id = req.params.id;
    
        db.query(sql, [...values, id], (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(data);
        });
    });
    
    // Delete a visa
    app.delete("/api.thepilgrimbeez.com/visa/delete/:id", (req, res) => {
        const sql = "DELETE FROM travel_visa WHERE `id` = ?";
        const id = req.params.id;
    
        db.query(sql, [id], (err, data) => {
            if (err) return res.status(500).json({ error: err.message });
            // It might be good to check if the delete was actually performed (affected rows)
            if (data.affectedRows === 0) {
                return res.status(404).json({ message: "visa not found or already deleted" });
            }
            return res.json({ message: "visa deleted successfully", data });
        });
    });
    
    // Route to get visas by category
    app.get("/api.thepilgrimbeez.com/visa/category/:category", async (req, res) => {
        try {
            const allvisas = await getAllvisas();
            const filteredvisas = allvisas.filter((pkg) => pkg.category === req.params.category);
            res.json(filteredvisas);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });
    
    // Function to get all visas
    const getAllvisas = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM travel_visa";
            db.query(sql, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    };
    
    // Route to get a visa by id
    app.get("/api.thepilgrimbeez.com/visa/id/:id", async (req, res) => {
        try {
            // Query to fetch visa details and associated images
            const visaDetailsSql = `
        SELECT p.*, GROUP_CONCAT(i.image_url) as imageUrls
        FROM travel_visa p
        LEFT JOIN visa_images i ON p.id = i.visa_id
        WHERE p.id = ?
        GROUP BY p.id
        `;
    
            db.query(visaDetailsSql, [req.params.id], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: "visa not found" });
                }
                // Format the response
                const visaData = results[0];
                visaData.imageUrls = visaData.imageUrls ? visaData.imageUrls.split(",") : [];
                res.json(visaData);
            });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });
    // Other routes and logic...
};
