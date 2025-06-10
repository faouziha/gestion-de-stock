const express = require("express");
const router = express.Router();
const db = require("./db"); // Assuming you have a db.js file for the database connection

// Endpoint to get newly added products within a date range
router.get("/new", async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
        console.log("Fetching new products with params:", { startDate, endDate, userId });
        
        if (!startDate || !endDate || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required parameters: startDate, endDate, or userId" 
            });
        }

        // Debug: Log original dates
        console.log("Original date strings:", { startDate, endDate });
        
        // Get all products for debugging
        const allProductsQuery = `
            SELECT id, nom, created_at, userid
            FROM produit
            WHERE userid = $1
            ORDER BY created_at DESC
            LIMIT 10
        `;
        
        const allProductsResult = await db.query(allProductsQuery, [userId]);
        console.log("All recent products:", JSON.stringify(allProductsResult.rows, null, 2));
        
        // Make sure we handle dates correctly
        // Handle various date formats and ensure endpoint date is inclusive
        let formattedStartDate;
        let formattedEndDate;
        
        try {
            // Parse the dates and set time to start of day and end of day
            const startDateObj = new Date(startDate);
            startDateObj.setUTCHours(0, 0, 0, 0);
            formattedStartDate = startDateObj.toISOString();
            
            const endDateObj = new Date(endDate);
            // Set to the end of the day (23:59:59.999)
            endDateObj.setUTCHours(23, 59, 59, 999);
            formattedEndDate = endDateObj.toISOString();
            
        } catch (error) {
            console.error("Error parsing dates:", error);
            // Fallback to original string handling if date parsing fails
            formattedStartDate = startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`;
            formattedEndDate = endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`;
        }
        
        // Log for debugging
        console.log("Formatted dates:", { formattedStartDate, formattedEndDate });
        console.log("Current time:", new Date().toISOString());
        
        // Get today's date and format it for comparison
        const today = new Date();
        today.setUTCHours(23, 59, 59, 999);
        const todayStr = today.toISOString();
        
        // If the end date is close to today (within 24 hours), include today's products
        const endDateObj = new Date(formattedEndDate);
        const diffTime = Math.abs(today - endDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        console.log("Date difference (days):", diffDays);
        console.log("Today's date for comparison:", todayStr);
        
        // Use the end date or today's date, whichever is later
        const effectiveEndDate = diffDays <= 1 ? todayStr : formattedEndDate;
        console.log("Using effective end date:", effectiveEndDate);
        
        // Update the query to be more lenient with date ranges
        const query = `
            SELECT p.*, 
                   c.name AS category_name, 
                   b.name AS brand_name,
                   p.created_at::text AS created_at_str
            FROM produit p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.userid = $1 
            AND (
                -- Match the requested date range
                (p.created_at >= $2 AND p.created_at <= $3)
                -- OR if the product was created today and end date is within 24 hours of today
                OR (DATE(p.created_at) = CURRENT_DATE AND $4 = true)
            )
            ORDER BY p.created_at DESC
        `;
        
        console.log("Executing query with params:", [userId, formattedStartDate, effectiveEndDate, diffDays <= 1]);
        const result = await db.query(query, [userId, formattedStartDate, effectiveEndDate, diffDays <= 1]);
        console.log(`Found ${result.rows.length} products`);
        
        res.json({
            success: true,
            products: result.rows
        });
    } catch (error) {
        console.error("Error fetching newly added products:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
});

module.exports = router;
