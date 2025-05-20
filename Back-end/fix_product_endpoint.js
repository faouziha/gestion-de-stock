// Fixed product POST endpoint
app.post("/produit", async (req, res) => {
    try {
        console.log("Received product creation request");
        
        // Log the request body structure (without full image data for brevity)
        const requestBodyLog = { ...req.body };
        if (requestBodyLog.image) {
            requestBodyLog.image = `${requestBodyLog.image.substring(0, 30)}... (truncated)`;
        }
        console.log("Request body structure:", requestBodyLog);
        
        // Added category_id to the destructuring
        const {nom, description, image, total, serial_num, fournisseur_id, prix, category_id, user_id} = req.body;
        
        // Validate required fields
        if (!nom) {
            return res.status(400).json({ error: "Product name is required" });
        }
        
        // Log the values being inserted (without full image)
        console.log("Inserting product with values:", {
            nom, 
            description: description || 'null',
            image: image ? 'Image data present' : 'No image data',
            total, 
            serial_num: serial_num || 'null',
            fournisseur_id, 
            prix,
            category_id: category_id || 'null',
            user_id
        });
        
        const newProduct = await db.query(
            "INSERT INTO produit (nom, description, image, total, serial_num, fournisseur_id, prix, category_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [nom, description, image, total, serial_num, fournisseur_id, prix, category_id || null, user_id]
        );
        
        console.log("Product created successfully with ID:", newProduct.rows[0].id);
        
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct.rows[0]
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
});
