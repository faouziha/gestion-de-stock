const express = require('express');
const pg = require('pg');
require('dotenv').config();

const router = express.Router();

// Database connection
const pool = new pg.Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    max: 20
});

const db = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    }
};

// Route to create categories table if it doesn't exist
router.get("/setup/create-categories-table", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        // Check if user is admin
        const checkAdminQuery = "SELECT role FROM users WHERE id = $1";
        const adminCheck = await db.query(checkAdminQuery, [userId]);
        
        if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: "Unauthorized. Admin privileges required." 
            });
        }

        // Check if the categories table exists
        const checkTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'categories'
        `;
        const tableCheck = await db.query(checkTableQuery);
        
        // Create categories table if it doesn't exist
        if (tableCheck.rows.length === 0) {
            const createTableQuery = `
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    color VARCHAR(50),
                    icon VARCHAR(50),
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(createTableQuery);
            
            // Add category_id column to produit table if it doesn't exist
            const checkColumnQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'produit' AND column_name = 'category_id'
            `;
            const columnCheck = await db.query(checkColumnQuery);
            
            if (columnCheck.rows.length === 0) {
                const addColumnQuery = `
                    ALTER TABLE produit 
                    ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
                `;
                await db.query(addColumnQuery);
            }
            
            res.json({ 
                success: true, 
                message: "Categories table created and product table updated" 
            });
        } else {
            res.json({ 
                success: true, 
                message: "Categories table already exists" 
            });
        }
    } catch (error) {
        console.error("Error setting up categories:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
