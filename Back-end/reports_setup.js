const express = require("express");
const router = express.Router();
const db = require("./db"); // Import database connection

// Route to create reports tables if they don't exist
router.get("/setup/create-reports-table", async (req, res) => {
    try {
        // Check if the reports table exists
        const reportsTableCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'reports'
            )`
        );

        // Create reports table if it doesn't exist
        if (!reportsTableCheck.rows[0].exists) {
            await db.query(`
                CREATE TABLE reports (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    date_range_start DATE NOT NULL,
                    date_range_end DATE NOT NULL,
                    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_revenue DECIMAL(12,2) DEFAULT 0,
                    total_products_sold INTEGER DEFAULT 0,
                    total_orders INTEGER DEFAULT 0
                )
            `);

            res.json({
                success: true,
                message: "Reports table created successfully"
            });
        } else {
            // Check for required columns and add them if missing
            const columnCheck = await db.query(
                `SELECT 
                    column_name
                FROM 
                    information_schema.columns
                WHERE 
                    table_name = 'reports'
                `
            );
            
            const existingColumns = columnCheck.rows.map(row => row.column_name);
            
            // Add missing columns if needed
            if (!existingColumns.includes('total_revenue')) {
                await db.query(`ALTER TABLE reports ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0`);
            }
            
            if (!existingColumns.includes('total_products_sold')) {
                await db.query(`ALTER TABLE reports ADD COLUMN total_products_sold INTEGER DEFAULT 0`);
            }
            
            if (!existingColumns.includes('total_orders')) {
                await db.query(`ALTER TABLE reports ADD COLUMN total_orders INTEGER DEFAULT 0`);
            }

            res.json({
                success: true,
                message: "Reports table already exists and was updated if needed"
            });
        }

        // Check if report_details table exists
        const detailsTableCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'report_details'
            )`
        );

        // Create report_details table if it doesn't exist
        if (!detailsTableCheck.rows[0].exists) {
            await db.query(`
                CREATE TABLE report_details (
                    id SERIAL PRIMARY KEY,
                    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
                    product_id INTEGER REFERENCES produit(id) ON DELETE SET NULL,
                    product_name VARCHAR(255),
                    category_id INTEGER,
                    category_name VARCHAR(255),
                    brand_id INTEGER,
                    brand_name VARCHAR(255),
                    quantity_sold INTEGER DEFAULT 0,
                    revenue DECIMAL(12,2) DEFAULT 0,
                    average_price DECIMAL(12,2) DEFAULT 0
                )
            `);

            res.json({
                success: true,
                message: "Reports and report details tables created successfully"
            });
        } else {
            res.json({
                success: true,
                message: "Reports and report details tables already exist"
            });
        }
    } catch (error) {
        console.error("Error setting up reports tables:", error);
        res.status(500).json({
            success: false,
            error: "Failed to set up reports tables: " + error.message
        });
    }
});

module.exports = router;
