const express = require("express");
const router = express.Router();
const db = require("./db"); // Import database connection

// Get all brands
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        
        let query = "SELECT * FROM brands";
        let params = [];
        
        // Filter by user ID if provided
        if (userId) {
            query += " WHERE user_id = $1";
            params.push(userId);
        }
        
        query += " ORDER BY name ASC";
        
        const brandsResult = await db.query(query, params);
        
        // Add product counts to each brand
        const brandsWithCounts = await Promise.all(brandsResult.rows.map(async (brand) => {
            const productCount = await db.query(
                "SELECT COUNT(*) FROM produit WHERE brand_id = $1",
                [brand.id]
            );
            
            return {
                ...brand,
                product_count: parseInt(productCount.rows[0].count)
            };
        }));
        
        console.log('Brands with counts:', brandsWithCounts.map(b => ({ id: b.id, name: b.name, count: b.product_count })));
        res.json(brandsWithCounts);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ success: false, error: "Failed to fetch brands" });
    }
});

// Get a specific brand by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { basic, userId } = req.query;
        
        console.log(`Fetching brand ID ${id}, basic mode: ${basic}, userId: ${userId}`);
        
        // Log the exact SQL query we're about to execute
        const query = "SELECT * FROM brands WHERE id = $1";
        console.log('Executing query:', query, 'with params:', [id]);
        
        // Execute the query
        const result = await db.query(query, [id]);
        
        // Log the result for debugging
        console.log('Query result rows count:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('First row columns:', Object.keys(result.rows[0]));
        }
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Brand not found" });
        }
        
        // Basic mode only returns brand info without products
        if (basic === 'true') {
            // Get just the product count for basic mode
            const productCount = await db.query(
                "SELECT COUNT(*) FROM produit WHERE brand_id = $1",
                [id]
            );
            
            return res.json({
                ...result.rows[0],
                product_count: parseInt(productCount.rows[0].count || '0'),
            });
        }
        
        // Full mode includes product count and sample products
        // Get the count of produit with this brand
        const productCount = await db.query(
            "SELECT COUNT(*) FROM produit WHERE brand_id = $1",
            [id]
        );
        
        // Check if there are any products before trying to fetch them
        const count = parseInt(productCount.rows[0].count || '0');
        let sampleProducts = [];
        
        if (count > 0) {
            // Get sample of produit with this brand
            // Make sure we're using the correct column names for the produit table
            const produitQuery = `
                SELECT id, nom, prix, image as image_url 
                FROM produit 
                WHERE brand_id = $1 
                LIMIT 10
            `;
            const produitResult = await db.query(produitQuery, [id]);
            sampleProducts = produitResult.rows;
        }
        
        res.json({
            ...result.rows[0],
            product_count: count,
            sample_produit: sampleProducts
        });
    } catch (error) {
        console.error("Error fetching brand:", error.message);
        console.error("Error stack:", error.stack);
        
        // More detailed error information
        if (error.code === '42703') { // PostgreSQL error code for undefined_column
            console.error("Column does not exist error. Check your table schema.");
        }
        
        res.status(500).json({ 
            success: false, 
            error: error.message || "Failed to fetch brand details", 
            message: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Create a new brand
router.post("/", async (req, res) => {
    try {
        const { name, description, logo_url, website, color, founded_year, userId } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, error: "Brand name is required" });
        }
        
        const query = `
            INSERT INTO brands (name, description, logo_url, website, color, founded_year, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [name, description, logo_url, website, color, founded_year, userId];
        const result = await db.query(query, values);
        
        res.status(201).json({
            success: true,
            message: "Brand created successfully",
            brand: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating brand:", error);
        res.status(500).json({ success: false, error: "Failed to create brand" });
    }
});

// Update an existing brand
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Get userId from query parameters or request body
        const userId = req.query.userId || req.body.userId;
        const { name, description, logo_url, website, color, founded_year } = req.body;
        
        console.log(`Updating brand ID ${id}, userId: ${userId}`);
        console.log('Request body:', req.body);
        console.log('Request query:', req.query);
        
        // Check if brand exists and belongs to the user
        const brandCheck = await db.query("SELECT * FROM brands WHERE id = $1", [id]);
        
        if (brandCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Brand not found" });
        }
        
        // If userId provided, check ownership
        if (userId && brandCheck.rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ success: false, error: "You don't have permission to update this brand" });
        }
        
        // Update brand
        const query = `
            UPDATE brands 
            SET name = $1, 
                description = $2, 
                logo_url = $3, 
                website = $4, 
                color = $5, 
                founded_year = $6, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `;
        
        const values = [
            name || brandCheck.rows[0].name,
            description !== undefined ? description : brandCheck.rows[0].description,
            logo_url !== undefined ? logo_url : brandCheck.rows[0].logo_url,
            website !== undefined ? website : brandCheck.rows[0].website,
            color || brandCheck.rows[0].color,
            founded_year !== undefined ? founded_year : brandCheck.rows[0].founded_year,
            id
        ];
        
        const result = await db.query(query, values);
        
        res.json({
            success: true,
            message: "Brand updated successfully",
            brand: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating brand:", error);
        res.status(500).json({ success: false, error: "Failed to update brand" });
    }
});

// Delete a brand
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        
        // Check if brand exists and belongs to the user
        const brandCheck = await db.query("SELECT * FROM brands WHERE id = $1", [id]);
        
        if (brandCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: "Brand not found" });
        }
        
        // If userId provided, check ownership
        if (userId && brandCheck.rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ success: false, error: "You don't have permission to delete this brand" });
        }
        
        // Update any produit that use this brand to have null brand_id
        await db.query("UPDATE produit SET brand_id = NULL WHERE brand_id = $1", [id]);
        
        // Delete the brand
        await db.query("DELETE FROM brands WHERE id = $1", [id]);
        
        res.json({
            success: true,
            message: "Brand deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting brand:", error);
        res.status(500).json({ success: false, error: "Failed to delete brand" });
    }
});

module.exports = router;
