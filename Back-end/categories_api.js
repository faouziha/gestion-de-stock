const express = require('express');
const router = express.Router();
const pg = require('pg');
require('dotenv').config();

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

// Get all categories
router.get("/", async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM categories";
        let params = [];
        
        // Filter by user ID if provided
        if (userId) {
            query += " WHERE user_id = $1";
            params.push(userId);
        }
        
        query += " ORDER BY name ASC";
        
        const categoriesResult = await db.query(query, params);
        
        // For each category, get the product count
        const categoriesWithCounts = await Promise.all(categoriesResult.rows.map(async (category) => {
            // Using the same query as in the /:id endpoint with type conversion
            const productCountQuery = "SELECT COUNT(*) FROM produit WHERE category_id::varchar = $1::varchar";
            const productCount = await db.query(productCountQuery, [category.id]);
            
            return {
                ...category,
                product_count: parseInt(productCount.rows[0].count)
            };
        }));
        
        console.log('Categories with counts:', categoriesWithCounts.map(c => ({ id: c.id, name: c.name, count: c.product_count })));
        res.json(categoriesWithCounts);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a specific category
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        const query = "SELECT * FROM categories WHERE id = $1";
        const category = await db.query(query, [id]);
        
        if (category.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        
        // Check if the user has access to this category
        if (userId && category.rows[0].user_id !== parseInt(userId)) {
            const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
            if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
                return res.status(403).json({ error: "You don't have permission to access this category" });
            }
        }
        
        // Return category with count of products in this category
        const productCountQuery = "SELECT COUNT(*) FROM produit WHERE category_id = $1";
        const productCount = await db.query(productCountQuery, [id]);
        
        const result = {
            ...category.rows[0],
            product_count: parseInt(productCount.rows[0].count)
        };
        
        res.json(result);
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new category
router.post("/", async (req, res) => {
    try {
        const { name, description, color, icon, userId } = req.body;
        
        if (!name || !userId) {
            return res.status(400).json({ error: "Name and userId are required" });
        }
        
        const query = `
            INSERT INTO categories (name, description, color, icon, user_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        
        const values = [name, description || '', color || '#3B82F6', icon || 'tag', userId];
        const newCategory = await db.query(query, values);
        
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: newCategory.rows[0]
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update a category
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon, userId } = req.body;
        
        if (!name || !userId) {
            return res.status(400).json({ error: "Name and userId are required" });
        }
        
        // Check if category exists and user has permission
        const categoryCheck = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
        
        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        
        // Check if the user has permission to update this category
        if (categoryCheck.rows[0].user_id !== parseInt(userId)) {
            const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
            if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
                return res.status(403).json({ error: "You don't have permission to update this category" });
            }
        }
        
        const query = `
            UPDATE categories 
            SET name = $1, description = $2, color = $3, icon = $4 
            WHERE id = $5 
            RETURNING *
        `;
        
        const values = [name, description || '', color || '#3B82F6', icon || 'tag', id];
        const updatedCategory = await db.query(query, values);
        
        res.json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory.rows[0]
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a category
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // Check if category exists and user has permission
        const categoryCheck = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
        
        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        
        // Check if the user has permission to delete this category
        if (categoryCheck.rows[0].user_id !== parseInt(userId)) {
            const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [userId]);
            if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
                return res.status(403).json({ error: "You don't have permission to delete this category" });
            }
        }
        
        // Check if there are products assigned to this category
        const productCheck = await db.query("SELECT COUNT(*) FROM produit WHERE category_id = $1", [id]);
        const productCount = parseInt(productCheck.rows[0].count);
        
        if (productCount > 0) {
            // Update products to remove the category reference instead of preventing deletion
            await db.query("UPDATE produit SET category_id = NULL WHERE category_id = $1", [id]);
        }
        
        // Delete the category
        await db.query("DELETE FROM categories WHERE id = $1", [id]);
        
        res.json({
            success: true,
            message: `Category deleted successfully. ${productCount} products were updated.`
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
