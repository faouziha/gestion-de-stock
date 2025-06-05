const express = require("express");
const router = express.Router();
const db = require("./db"); // Import database connection

// Route to create brands table if it doesn't exist
router.get("/setup/create-brands-table", async (req, res) => {
    try {
        // Check if the brands table exists
        const tableCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'brands'
            )`
        );

        // Create brands table if it doesn't exist
        if (!tableCheck.rows[0].exists) {
            await db.query(`
                CREATE TABLE brands (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    logo_url TEXT,
                    website TEXT,
                    color VARCHAR(20) DEFAULT '#1976D2',
                    founded_year INTEGER,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Check if produit table exists before trying to add brand_id column
            const produitTableCheck = await db.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'produit'
                )`
            );
            
            if (produitTableCheck.rows[0].exists) {
                // Check if brand_id column exists in produit table
                const columnCheck = await db.query(
                    `SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'produit'
                        AND column_name = 'brand_id'
                    )`
                );
                
                if (!columnCheck.rows[0].exists) {
                    // Add brand_id column to produit table
                    await db.query(`
                        ALTER TABLE produit
                        ADD COLUMN brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL
                    `);
                }
            }

            res.json({
                success: true,
                message: "Brands table created and product table updated"
            });
        } else {
            res.json({
                success: true,
                message: "Brands table already exists"
            });
        }
    } catch (error) {
        console.error("Error setting up brands:", error);
        res.status(500).json({
            success: false,
            error: "Failed to set up brands table"
        });
    }
});

module.exports = router;
