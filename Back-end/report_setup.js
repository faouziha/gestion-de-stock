const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("./db"); // Import database connection

// Route to create report tables if they don't exist
router.get("/setup/create-report-tables", async (req, res) => {
    try {
        // Check if the report table exists
        const reportTableCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'report'
            )`
        );

        // Check if the report_details table exists
        const reportDetailsTableCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'report_details'
            )`
        );

        // If either table doesn't exist, create both tables
        if (!reportTableCheck.rows[0].exists || !reportDetailsTableCheck.rows[0].exists) {
            // Read the SQL file
            const sqlFilePath = path.join(__dirname, 'report_setup.sql');
            const sql = fs.readFileSync(sqlFilePath, 'utf8');
            
            // Execute the SQL commands
            await db.query(sql);
            
            res.json({
                success: true,
                message: "Report tables created successfully"
            });
        } else {
            res.json({
                success: true,
                message: "Report tables already exist"
            });
        }
    } catch (error) {
        console.error("Error setting up report tables:", error);
        res.status(500).json({
            success: false,
            error: "Failed to set up report tables: " + error.message
        });
    }
});

module.exports = router;
