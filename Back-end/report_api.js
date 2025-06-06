const express = require("express");
const router = express.Router();
const db = require("./db"); // Import database connection

// Generate a new report
router.post("/", async (req, res) => {
    try {
        // Log database connection parameters (without sensitive info)
        console.log("Database connection check:");
        console.log("- Database host:", process.env.DATABASE_HOST);
        console.log("- Database name:", process.env.DATABASE_NAME);
        console.log("- Database user:", process.env.USER_NAME);
        console.log("- Database port:", process.env.DATABASE_PORT);
        console.log("- Password provided:", process.env.USER_PASSWORD ? "Yes" : "No");
        
        // Get request data
        const { title, description, date_range_start, date_range_end, userId } = req.body;
        console.log("Report request data:", { title, description, date_range_start, date_range_end, userId });
        
        if (!userId || !date_range_start || !date_range_end) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters: userId, date_range_start, date_range_end"
            });
        }
        
                // Begin transaction for consistent data
        await db.query("BEGIN");
        
        try {
            // First create the report record
            const reportTitle = title || `Report ${new Date().toISOString().split('T')[0]}`;
            const reportDescription = description || `Generated report from ${date_range_start} to ${date_range_end}`;
            
            console.log("Inserting initial report record...");
            const reportResult = await db.query(
                `INSERT INTO report (
                    title, 
                    description, 
                    date_range_start, 
                    date_range_end, 
                    user_id
                ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [
                    reportTitle,
                    reportDescription,
                    date_range_start,
                    date_range_end,
                    userId
                ]
            );
            
            const reportId = reportResult.rows[0].id;
            console.log("Created report with ID:", reportId);
            
            // Get sales data for the given date range
            console.log("Fetching sales data for date range...");
            
            // Check if the correct tables exist
            const checkDetailsTable = await db.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'order_details'
                )`
            );
            console.log("order_details table exists:", checkDetailsTable.rows[0].exists);
            
            // Use the correct table names from the DBV2.sql schema (order_details instead of commande_details)
            const salesData = await db.query(
                `SELECT 
                    p.id AS product_id,
                    p.nom AS product_name,
                    c.id AS category_id,
                    COALESCE(c.name, 'Uncategorized') AS category_name,
                    b.id AS brand_id,
                    COALESCE(b.name, 'Unbranded') AS brand_name,
                    SUM(od.quantity) AS quantity_sold,
                    SUM(od.total_price) AS revenue,
                    COUNT(DISTINCT od.order_id) AS order_count,
                    CASE 
                        WHEN SUM(od.quantity) > 0 THEN SUM(od.total_price)/SUM(od.quantity)
                        ELSE 0
                    END AS average_price
                FROM order_details od
                JOIN produit p ON od.produit_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                JOIN commande cm ON od.order_id = cm.id
                WHERE cm.date_commande BETWEEN $1 AND $2
                AND cm.userid = $3
                GROUP BY p.id, p.nom, c.id, c.name, b.id, b.name`,
                [date_range_start, date_range_end, userId]
            );
            
            console.log(`Found ${salesData.rows.length} products sold in date range`);
            
            // Calculate actual totals from sales data
            let totalRevenue = 0;
            let totalProductsSold = 0;
            let totalOrders = new Set(); // Use a Set to count unique orders
            
            // Insert report details and calculate totals
            for (const item of salesData.rows) {
                // Add report details for each product
                await db.query(
                    `INSERT INTO report_details (
                        report_id,
                        product_id,
                        product_name,
                        category_id,
                        category_name,
                        brand_id,
                        brand_name,
                        quantity_sold,
                        revenue,
                        order_count,
                        average_price
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        reportId,
                        item.product_id,
                        item.product_name,
                        item.category_id,
                        item.category_name,
                        item.brand_id,
                        item.brand_name,
                        item.quantity_sold,
                        item.revenue,
                        item.order_count,
                        item.average_price
                    ]
                );
                
                // Sum up totals
                totalRevenue += parseFloat(item.revenue || 0);
                totalProductsSold += parseInt(item.quantity_sold || 0);
                
                // If we have order IDs add them to the set, otherwise use the count
                if (item.order_ids) {
                    item.order_ids.forEach(id => totalOrders.add(id));
                } else if (item.order_count) {
                    // This is an approximation since we don't have actual order IDs
                    for (let i = 0; i < parseInt(item.order_count); i++) {
                        totalOrders.add(`${item.product_id}-${i}`);
                    }
                }
            }
            
            // If no sales data was found, use zeroes
            if (salesData.rows.length === 0) {
                console.log("No sales data found for this period, using zero values");
                totalRevenue = 0;
                totalProductsSold = 0;
                totalOrders = new Set();
            }
            
            // Update the report with calculated totals
            console.log("Updating report with totals:", { 
                totalRevenue, 
                totalProductsSold, 
                totalOrdersCount: totalOrders.size 
            });
            
            await db.query(
                `UPDATE report
                SET 
                    total_revenue = $1,
                    total_products_sold = $2,
                    total_orders = $3
                WHERE id = $4`,
                [
                    totalRevenue,
                    totalProductsSold,
                    totalOrders.size, // Size of the Set gives us unique order count
                    reportId
                ]
            );
            
            // Commit the transaction
            await db.query("COMMIT");
            console.log("Report generation completed successfully");
            
            // Success response after all operations are complete
            return res.status(201).json({
                success: true,
                message: "Report generated successfully with real data",
                report: reportResult.rows[0]
            });
        } catch (innerError) {
            // If there's an error in the inner try block, rollback and re-throw
            await db.query("ROLLBACK");
            throw innerError;
        }
    } catch (error) {
        console.error("Error generating report:", error);
        console.error("Error details:", error.stack);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // More detailed error response
        res.status(500).json({
            success: false,
            error: "Failed to generate report: " + error.message,
            details: error.stack,
            errorCode: error.code || "unknown",
            connectionIssue: error.message.includes("password") || 
                            error.message.includes("connect") || 
                            error.message.includes("authentication")
        });
    }
});

// Get all report for a user
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required parameter: userId" 
            });
        }

        const reportResult = await db.query(
            `SELECT * FROM report
            WHERE user_id = $1
            ORDER BY date_created DESC`,
            [userId]
        );

        res.json({
            success: true,
            report: reportResult.rows
        });
    } catch (error) {
        console.error("Error getting report:", error);
        console.error("Error details:", error.stack);
        res.status(500).json({
            success: false,
            error: "Failed to get report: " + error.message,
            details: error.stack
        });
    }
});

// Get a specific report with its details
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required parameter: userId" 
            });
        }

        // Get report
        const reportResult = await db.query(
            `SELECT * FROM report
            WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Report not found"
            });
        }

        // Get report details
        const detailsResult = await db.query(
            `SELECT * FROM report_details
            WHERE report_id = $1
            ORDER BY revenue DESC`,
            [id]
        );

        res.json({
            success: true,
            report: reportResult.rows[0],
            details: detailsResult.rows
        });
    } catch (error) {
        console.error("Error getting report:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get report: " + error.message
        });
    }
});

// Delete a report
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing required parameter: userId" 
            });
        }

        // Begin transaction
        await db.query("BEGIN");

        // Delete the report (cascade will delete the details)
        const reportResult = await db.query(
            `DELETE FROM report
            WHERE id = $1 AND user_id = $2
            RETURNING id`,
            [id, userId]
        );

        if (reportResult.rows.length === 0) {
            await db.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                error: "Report not found or you don't have permission to delete it"
            });
        }

        // Commit transaction
        await db.query("COMMIT");

        res.json({
            success: true,
            message: "Report deleted successfully",
            reportId: reportResult.rows[0].id
        });
    } catch (error) {
        // Rollback transaction on error
        await db.query("ROLLBACK");
        console.error("Error deleting report:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete report: " + error.message
        });
    }
});

module.exports = router;
