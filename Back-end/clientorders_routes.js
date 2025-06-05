// Updated Client Orders Routes with order_details support
const express = require('express');
const router = express.Router();
const { createOrUpdateOrderDetails } = require('./order_details_routes');

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

// Get all client orders for a specific user
router.get('/clientorders', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get all orders for this user - no longer fetching individual product details here
    const query = `
      SELECT c.*, cl.nom as client_lastname, cl.prenom as client_firstname,
             cl.email as client_email, cl.telephone as client_phone
      FROM commande c
      LEFT JOIN clients cl ON (
        CASE WHEN c.customer_name ~ E'^\\d+$' THEN
          cl.id = c.customer_name::integer
        ELSE
          FALSE
        END
      )
      WHERE c.userid = $1 AND (c.is_parent IS NULL OR c.is_parent = false)
      ORDER BY c.date_commande DESC
    `;
    
    const orders = await executeQuery(query, [userId]);
    
    // For each order, get its order details from the order_details table
    const formattedOrders = await Promise.all(orders.rows.map(async (order) => {
      // Check if customer_name is a client ID
      let clientName = order.customer_name;
      if (order.client_firstname || order.client_lastname) {
        clientName = `${order.client_firstname || ''} ${order.client_lastname || ''}`.trim();
      }
      
      // Fetch order details
      const detailsQuery = `
        SELECT od.*, p.nom as product_name
        FROM order_details od
        LEFT JOIN produit p ON od.produit_id = p.id
        WHERE od.order_id = $1
      `;
      
      const detailsResult = await executeQuery(detailsQuery, [order.id]);
      const orderDetails = detailsResult.rows;
      
      return {
        id: order.id,
        client_name: clientName,
        client_email: order.client_email,
        date_commande: order.date_commande,
        status: order.status || 'Pending',
        total_amount: parseFloat(order.total_amount) || 0,
        payment_method: order.payment_method,
        reference: order.reference,
        notes: order.notes,
        orderItems: orderDetails.map(detail => ({
          id: detail.id,
          product_id: detail.produit_id,
          product_name: detail.product_name || detail.nom_produit,
          quantity: detail.quantity,
          price: parseFloat(detail.unit_price) || 0,
          total: parseFloat(detail.total_price) || 0
        }))
      };
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching client orders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new client order with multiple products
router.post('/clientorders', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      client_id,
      date,
      status,
      payment_method,
      reference,
      notes,
      userId,
      orderItems
    } = req.body;

    // Validate required fields
    if (!client_id || !date || !orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of orderItems) {
      totalAmount += parseFloat(item.total) || 0;
    }
    
    // Get client information for display
    let clientName = null;
    try {
      const clientQuery = 'SELECT id FROM clients WHERE id = $1';
      const clientResult = await client.query(clientQuery, [client_id]);
      
      if (clientResult.rows.length === 0) {
        return res.status(400).json({ message: 'Client not found' });
      }
      
      // Store client ID in customer_name field
      clientName = client_id.toString();
    } catch (err) {
      console.error('Error getting client info:', err);
      return res.status(500).json({ message: 'Error retrieving client information' });
    }
    
    // Get client balance (only needed if payment method is Balance)
    let clientBalance = 0;
    let balanceExists = false;
    
    // Only check balance if using Balance payment method
    if (payment_method === 'Balance') {
      const checkBalanceQuery = `
        SELECT total_solde 
        FROM client_solde 
        WHERE client_id = $1 AND userid = $2
      `;
      
      const balanceResult = await client.query(checkBalanceQuery, [client_id, userId]);
      
      if (balanceResult.rows.length > 0) {
        clientBalance = parseFloat(balanceResult.rows[0].total_solde) || 0;
        balanceExists = true;
      }
      
      // Note: We allow negative balances when the payment method is Balance
      // No need to check if balance is sufficient
    }
    
    // Create the main order record
    const orderQuery = `
      INSERT INTO commande 
      (customer_name, date_commande, userid, status, payment_method, reference, notes, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const orderValues = [
      clientName,
      date,
      userId,
      status || 'Pending',
      payment_method || 'Cash',
      reference || `ORD-${Date.now()}`,
      notes || '',
      totalAmount
    ];
    
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;
    
    // Create order details entries
    await createOrUpdateOrderDetails(client, orderId, orderItems);
    
    // Only update client balance if payment method is Balance
    let new_balance = null;
    
    if (payment_method === 'Balance') {
      // Update client balance
      const updateBalanceQuery = `
        UPDATE client_solde 
        SET total_solde = total_solde - $1, 
            last_updated = CURRENT_TIMESTAMP
        WHERE client_id = $2 AND userid = $3
        RETURNING *
      `;
      
      const balanceUpdateResult = await client.query(updateBalanceQuery, [totalAmount, client_id, userId]);
      
      // If no balance record exists yet, create one
      if (balanceUpdateResult.rowCount === 0) {
        const insertResult = await client.query(
          `INSERT INTO client_solde (client_id, total_solde, userid) VALUES ($1, $2, $3) RETURNING total_solde`,
          [client_id, -totalAmount, userId]
        );
        new_balance = parseFloat(insertResult.rows[0].total_solde);
      } else {
        new_balance = parseFloat(balanceUpdateResult.rows[0].total_solde);
      }
      
      // Add transaction record
      await client.query(
        `INSERT INTO client_solde_details 
         (client_id, amount, operation_type, reference, notes, userid) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          client_id, 
          totalAmount, 
          'payment', 
          `Order #${orderId}`, 
          `Payment for order #${orderId}: ${reference || ''}`, 
          userId
        ]
      );
    }
    
    await client.query('COMMIT');
    
    // Prepare response based on payment method
    const responseData = { 
      id: orderId, 
      message: 'Order created successfully'
    };
    
    // Add balance info only if Balance payment method was used
    if (payment_method === 'Balance') {
      responseData.balance_updated = true;
      responseData.new_balance = new_balance;
    }
    
    res.status(201).json(responseData);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating client order:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Get a single client order by ID with its details
router.get('/clientorders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get the main order information
    const orderQuery = `
      SELECT c.*
      FROM commande c
      WHERE c.id = $1
    `;
    
    const orderResult = await executeQuery(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order details
    const detailsQuery = `
      SELECT od.*, p.nom as product_name, p.description as product_description
      FROM order_details od
      LEFT JOIN produit p ON od.produit_id = p.id
      WHERE od.order_id = $1
    `;
    
    const detailsResult = await executeQuery(detailsQuery, [orderId]);
    const orderDetails = detailsResult.rows;
    
    // Get client information if customer_name is a client ID
    let clientData = null;
    
    if (order.customer_name && !isNaN(parseInt(order.customer_name))) {
      const clientId = parseInt(order.customer_name);
      const clientQuery = 'SELECT * FROM clients WHERE id = $1';
      const clientResult = await executeQuery(clientQuery, [clientId]);
      
      if (clientResult.rows.length > 0) {
        clientData = clientResult.rows[0];
      }
    }
    
    // Format the order data
    const formattedOrder = {
      id: order.id,
      client_id: clientData ? clientData.id : null,
      client_name: clientData ? `${clientData.prenom || ''} ${clientData.nom || ''}`.trim() : order.customer_name,
      client_email: clientData ? clientData.email : null,
      client_phone: clientData ? clientData.telephone : null,
      client_address: clientData ? clientData.adresse : null,
      date: order.date_commande,
      status: order.status || 'Pending',
      payment_method: order.payment_method || 'Cash',
      reference: order.reference || `ORD-${order.id}`,
      notes: order.notes || '',
      total_amount: parseFloat(order.total_amount) || 0,
      orderItems: orderDetails.map(detail => ({
        id: detail.id,
        product_id: detail.produit_id,
        product_name: detail.product_name || detail.nom_produit,
        quantity: detail.quantity,
        unit_price: parseFloat(detail.unit_price) || 0,
        total_price: parseFloat(detail.total_price) || 0,
        product_description: detail.product_description || ''
      }))
    };
    
    res.json(formattedOrder);
  } catch (err) {
    console.error('Error fetching client order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a client order
router.put('/clientorders/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const orderId = req.params.id;
    const {
      client_id,
      date,
      status,
      payment_method,
      reference,
      notes,
      orderItems
    } = req.body;
    
    // Verify the order exists
    const checkOrderQuery = 'SELECT * FROM commande WHERE id = $1';
    const checkOrderResult = await client.query(checkOrderQuery, [orderId]);
    
    if (checkOrderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get current order items to handle stock adjustments
    const currentItemsQuery = `
      SELECT od.*, p.total as available_stock
      FROM order_details od
      LEFT JOIN produit p ON od.produit_id = p.id
      WHERE od.order_id = $1
    `;
    
    const currentItemsResult = await client.query(currentItemsQuery, [orderId]);
    const currentItems = currentItemsResult.rows;
    
    // First, restore stock for all current items
    for (const item of currentItems) {
      await client.query(
        'UPDATE produit SET total = total + $1 WHERE id = $2',
        [parseInt(item.quantity), parseInt(item.produit_id)]
      );
    }
    
    // Calculate new total amount
    let totalAmount = 0;
    for (const item of orderItems) {
      totalAmount += parseFloat(item.total) || 0;
    }
    
    // Update main order
    const updateOrderQuery = `
      UPDATE commande
      SET 
        customer_name = COALESCE($1, customer_name),
        date_commande = COALESCE($2, date_commande),
        status = COALESCE($3, status),
        payment_method = COALESCE($4, payment_method),
        reference = COALESCE($5, reference),
        notes = COALESCE($6, notes),
        total_amount = $7
      WHERE id = $8
      RETURNING *
    `;
    
    const updateOrderValues = [
      client_id ? client_id.toString() : null,
      date,
      status,
      payment_method,
      reference,
      notes,
      totalAmount,
      orderId
    ];
    
    await client.query(updateOrderQuery, updateOrderValues);
    
    // Update order details - this will delete existing details and create new ones
    await createOrUpdateOrderDetails(client, orderId, orderItems);
    
    await client.query('COMMIT');
    
    res.json({ 
      id: orderId, 
      message: 'Order updated successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating client order:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Delete a client order
router.delete('/clientorders/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const orderId = req.params.id;
    
    // Get all order details to restore stock
    const detailsQuery = `
      SELECT * FROM order_details WHERE order_id = $1
    `;
    
    const detailsResult = await client.query(detailsQuery, [orderId]);
    const orderDetails = detailsResult.rows;
    
    // Restore stock for all items
    for (const item of orderDetails) {
      await client.query(
        'UPDATE produit SET total = total + $1 WHERE id = $2',
        [parseInt(item.quantity), parseInt(item.produit_id)]
      );
    }
    
    // Delete the order and its details (order_details will be deleted via cascade)
    await client.query('DELETE FROM commande WHERE id = $1', [orderId]);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting client order:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
