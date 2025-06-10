// Order Details Routes
const express = require('express');
const router = express.Router();

// Get database connection from PostgreSQL pool
const pg = require('pg');
const pool = new pg.Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } finally {
        client.release();
    }
};

// Get order details for a specific order
router.get('/order-details/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.query.userId;
        
        // Verify user has access to this order
        const orderAccessCheck = await executeQuery(
            'SELECT id FROM commande WHERE id = $1 AND userid = $2',
            [orderId, userId]
        );
        
        if (orderAccessCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized access to order' });
        }
        
        // Get order details
        const query = `
            SELECT od.*, p.nom as product_name, p.prix as product_price, p.description as product_description
            FROM order_details od
            LEFT JOIN produit p ON od.produit_id = p.id
            WHERE od.order_id = $1
            ORDER BY od.id
        `;
        
        const result = await executeQuery(query, [orderId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create or update order details - this is used internally by the orders endpoint
const createOrUpdateOrderDetails = async (client, orderId, orderItems) => {
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        throw new Error('Order items are required');
    }
    
    // First delete any existing order details for this order (for updates)
    await client.query('DELETE FROM order_details WHERE order_id = $1', [orderId]);
    
    // Insert new order details
    for (const item of orderItems) {
        const productQuery = 'SELECT nom, prix, total as available_stock FROM produit WHERE id = $1';
        const productResult = await client.query(productQuery, [item.product_id]);
        const product = productResult.rows[0];
        
        if (!product) {
            throw new Error(`Product with ID ${item.product_id} not found`);
        }
        
        const unitPrice = parseFloat(item.price) || parseFloat(product.prix) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const totalPrice = unitPrice * quantity;
        
        // Calculate delivered and remaining quantities
        let deliveredQuantity = 0;
        let remainingQuantity = 0;
        
        if (item.delivered_quantity !== undefined) {
            // Use the provided delivered quantity
            deliveredQuantity = parseInt(item.delivered_quantity) || 0;
            remainingQuantity = parseInt(item.remaining_quantity) || 0;
        } else {
            // Calculate them based on available stock
            const availableStock = parseInt(product.available_stock) || 0;
            deliveredQuantity = Math.min(quantity, availableStock);
            remainingQuantity = Math.max(0, quantity - deliveredQuantity);
        }
        
        await client.query(`
            INSERT INTO order_details 
            (order_id, produit_id, nom_produit, quantity, unit_price, total_price, 
             delivered_quantity, remaining_quantity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            orderId,
            item.product_id,
            product.nom,
            quantity,
            unitPrice,
            totalPrice,
            deliveredQuantity,
            remainingQuantity
        ]);
        
        // Update product stock - only reduce by delivered quantity
        await client.query(
            'UPDATE produit SET total = total - $1 WHERE id = $2',
            [deliveredQuantity, parseInt(item.product_id)]
        );
    }
};

module.exports = {
    router,
    createOrUpdateOrderDetails
};
