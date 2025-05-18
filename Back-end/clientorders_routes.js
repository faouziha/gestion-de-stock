// Client Orders Routes
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

// Get all client orders for a specific user
router.get('/clientorders', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get all orders for this user
    const query = `
      SELECT c.*, p.nom as product_name, p.prix as product_price, p.description as product_description,
             cl.nom as client_name, cl.email as client_email
      FROM commande c
      LEFT JOIN produit p ON c.produit_id = p.id
      LEFT JOIN clients cl ON c.customer_name = cl.nom
      WHERE c.userid = $1
      ORDER BY c.date_commande DESC
    `;
    
    const orders = await executeQuery(query, [userId]);
    
    // Format the orders to match the expected structure
    // Since we're dealing with a single-product order model based on the schema
    const formattedOrders = orders.rows.map(order => {
      return {
        id: order.id,
        client_name: order.client_name || order.customer_name,
        client_email: order.client_email,
        date: order.date_commande,
        status: order.status,
        total_amount: order.quantite * order.product_price,
        orderItems: [
          {
            id: order.id,
            product_id: order.produit_id,
            product_name: order.product_name || order.nom_produit,
            quantity: order.quantite,
            price: order.product_price || 0,
            total: (order.quantite * order.product_price) || 0
          }
        ]
      };
    });
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching client orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new client order - adapted for single-product model
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
      total_amount,
      userId,
      orderItems
    } = req.body;

    // Validate required fields
    if (!client_id || !date || !orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get product information to use in the order
    const createdOrders = [];
    
    // Process each item as a separate order
    for (const item of orderItems) {
      const productQuery = `
        SELECT nom FROM produit WHERE id = $1
      `;
      const productResult = await client.query(productQuery, [item.product_id]);
      const productName = productResult.rows[0]?.nom || 'Unknown Product';
      
      // Create the order
      const orderQuery = `
        INSERT INTO commande 
        (produit_id, nom_produit, quantite, date_commande, customer_name, userid, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const orderValues = [
        item.product_id,
        productName,
        item.quantity,
        date,
        client_id,
        userId,
        status || 'Pending'
      ];
      
      const orderResult = await client.query(orderQuery, orderValues);
      createdOrders.push(orderResult.rows[0].id);
      
      // Update product stock
      await client.query(
        'UPDATE produit SET total = total - $1 WHERE id = $2',
        [parseInt(item.quantity), parseInt(item.product_id)]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ ids: createdOrders, message: 'Order(s) created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating client order:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Get a single client order by ID
router.get('/clientorders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order with product and client information
    const orderQuery = `
      SELECT c.*, 
             p.nom as product_name, p.prix as product_price, p.description as product_description,
             cl.nom as client_name, cl.prenom as client_prenom, cl.email as client_email, cl.telephone as client_phone, cl.adresse as client_address
      FROM commande c
      LEFT JOIN produit p ON c.produit_id = p.id
      LEFT JOIN clients cl ON c.customer_name::integer = cl.id
      WHERE c.id = $1
    `;
    
    console.log('Executing query: ', orderQuery);
    
    const orderResult = await executeQuery(orderQuery, [orderId]);
    
    console.log('Raw query result:', JSON.stringify(orderResult.rows, null, 2));
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    console.log('Raw order object:', JSON.stringify(order, null, 2));
    console.log('Product price from query:', order.product_price);
    console.log('Prix from query:', order.prix);
    
    // Check if this is a related order (part of a multi-product order)
    let relatedOrders = [];
    
    console.log('Checking if order is parent, is_parent value:', order.is_parent);
    
    if (order.is_parent === true) {
      // If this is a parent order, get all related child orders with complete product details
      const relatedQuery = `
        SELECT c.*, 
               p.nom as product_name, p.prix as product_price, p.description as product_description
        FROM commande c
        LEFT JOIN produit p ON c.produit_id = p.id
        WHERE c.parent_id = $1
      `;
      console.log('Executing query for child orders:', relatedQuery, 'with parent ID:', orderId);
      const relatedResult = await executeQuery(relatedQuery, [orderId]);
      console.log('Found child orders:', relatedResult.rows.length);
      console.log('Child orders data:', JSON.stringify(relatedResult.rows, null, 2));
      relatedOrders = relatedResult.rows;
    }
    
    // Get the actual product price and quantity directly from the database
    let productPrice = 0;
    let orderQuantity = 0;
    
    // Get product price
    if (order.produit_id) {
      const productQuery = 'SELECT prix FROM produit WHERE id = $1';
      const productResult = await executeQuery(productQuery, [order.produit_id]);
      if (productResult.rows.length > 0) {
        productPrice = productResult.rows[0].prix;
        console.log('Direct product price from produit table:', productPrice);
      }
    }
    
    // Get order quantity - direct query to ensure we get the exact value
    const quantityQuery = 'SELECT quantite FROM commande WHERE id = $1';
    const quantityResult = await executeQuery(quantityQuery, [orderId]);
    if (quantityResult.rows.length > 0) {
      orderQuantity = quantityResult.rows[0].quantite;
      console.log('Direct quantity from commande table:', orderQuantity);
      console.log('Quantity type:', typeof orderQuantity);
    } else {
      console.log('Could not find quantity for order:', orderId);
    }
    
    // Get the client details directly if we have a valid client ID in customer_name
    let clientName = order.customer_name; // Default to ID
    let clientFirstName = '';
    let clientLastName = '';
    let clientEmail = order.client_email || null;
    let clientPhone = order.client_phone || null;
    let clientAddress = order.client_address || null;

    // Check if customer_name contains a numeric client ID
    if (order.customer_name && /^\d+$/.test(order.customer_name)) {
      try {
        // Get client details directly
        const clientQuery = 'SELECT * FROM clients WHERE id = $1';
        const clientResult = await client.query(clientQuery, [order.customer_name]);
        
        if (clientResult.rows.length > 0) {
          const clientData = clientResult.rows[0];
          clientFirstName = clientData.prenom || '';
          clientLastName = clientData.nom || '';
          clientEmail = clientData.email || null;
          clientPhone = clientData.telephone || null;
          clientAddress = clientData.adresse || null;
          
          // Format full name
          clientName = `${clientFirstName} ${clientLastName}`.trim();
          if (!clientName) {
            clientName = `Client #${order.customer_name}`;  // Fallback
          }
        }
      } catch (err) {
        console.error('Error getting client details:', err);
        // Keep default values if error
      }
    } else if (order.client_prenom || order.client_name) {
      // Use the joined data if available
      clientName = `${order.client_prenom || ''} ${order.client_name || ''}`.trim();
    }

    // Format the response to match the expected structure in the frontend
    const responseOrder = {
      id: order.id,
      date: order.date_commande,
      client_name: clientName,
      client_id: order.customer_name, // Keep the original ID for reference
      client_email: clientEmail,
      client_phone: clientPhone,
      client_address: clientAddress,
      status: order.status || 'Pending',
      payment_method: order.payment_method || 'Cash', // Default payment method
      reference: order.reference || `ORD-${order.id}`,
      notes: order.notes,
    };
    
    // Determine what to include in orderItems based on if it's a parent or single order
    if (order.is_parent === true && relatedOrders.length > 0) {
      // If this is a parent order with child orders, only include the child orders
      console.log('This is a parent order with', relatedOrders.length, 'children');
      responseOrder.orderItems = await Promise.all(relatedOrders.map(async (item) => {
        // Get the actual product price and quantity directly for each related order
        let itemPrice = 0;
        let itemQuantity = 0;
        
        // Get product price
        if (item.produit_id) {
          const productQuery = 'SELECT prix FROM produit WHERE id = $1';
          const productResult = await executeQuery(productQuery, [item.produit_id]);
          if (productResult.rows.length > 0) {
            itemPrice = productResult.rows[0].prix;
            console.log(`Related item ${item.id} price from produit table:`, itemPrice);
          }
        }
        
        // Get item quantity directly from database
        const itemQuantityQuery = 'SELECT quantite FROM commande WHERE id = $1';
        const itemQuantityResult = await executeQuery(itemQuantityQuery, [item.id]);
        if (itemQuantityResult.rows.length > 0) {
          itemQuantity = itemQuantityResult.rows[0].quantite;
          console.log(`Related item ${item.id} quantity from commande table:`, itemQuantity);
        }
        
        return {
          id: item.id,
          product_id: item.produit_id,
          product_name: item.product_name || item.nom_produit,
          quantity: itemQuantity || 0,
          price: parseFloat(itemPrice) || 0,
          total: (itemQuantity || 0) * (parseFloat(itemPrice) || 0)
        };
      }));
    } else {
      // This is a single order with just one product
      console.log('This is a single order');
      responseOrder.orderItems = [{
        id: order.id,
        product_id: order.produit_id,
        product_name: order.product_name || order.nom_produit,
        quantity: orderQuantity || 0,
        price: parseFloat(productPrice) || 0,
        total: (orderQuantity || 0) * (parseFloat(productPrice) || 0)
      }];
    }
    
    res.json(responseOrder);
  } catch (err) {
    console.error('Error fetching client order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// New direct endpoint for order editing - much simpler approach
router.put('/clientorders/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const orderId = req.params.id;
    const { customer_name, date, status, orderItems, userId, payment_method, reference, notes } = req.body;
    
    console.log('Payment method received:', payment_method);
    
    console.log('Updating order:', orderId);
    console.log('Received data:', req.body);

    // 1. First check if the order exists
    const orderCheck = await client.query('SELECT * FROM commande WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // 2. Get the existing order to restore stock
    const existingOrder = orderCheck.rows[0];
    
    // 3. Restore stock for this product
    if (existingOrder.produit_id && existingOrder.quantite) {
      await client.query(
        'UPDATE produit SET total = total + $1 WHERE id = $2',
        [parseInt(existingOrder.quantite), parseInt(existingOrder.produit_id)]
      );
      console.log(`Restored ${existingOrder.quantite} units to product ${existingOrder.produit_id}`);
    }
    
    // 4. Now update the order with the new information
    const updateOrderQuery = `
      UPDATE commande 
      SET 
        customer_name = $1,
        date_commande = $2,
        status = $3, 
        produit_id = $4,
        nom_produit = $5,
        quantite = $6,
        userid = $7,
        payment_method = $8,
        reference = $9,
        notes = $10
      WHERE id = $11
    `;
    
    // Get the first/main product from the order items
    const mainItem = orderItems[0] || {};
    
    // Get product details
    let productName = '';
    if (mainItem.product_id) {
      const productQuery = 'SELECT nom FROM produit WHERE id = $1';
      const productResult = await client.query(productQuery, [mainItem.product_id]);
      if (productResult.rows.length > 0) {
        productName = productResult.rows[0].nom;
      }
    }
    
    await client.query(updateOrderQuery, [
      customer_name,
      date,
      status,
      mainItem.product_id ? parseInt(mainItem.product_id) : null,
      productName,
      mainItem.quantity ? parseInt(mainItem.quantity) : 0,
      userId,
      payment_method,  // Add payment method parameter
      reference || existingOrder.reference || `ORD-${orderId}`,
      notes || existingOrder.notes || '',
      orderId
    ]);
    
    // 5. Update product stock for the new order
    if (mainItem.product_id && mainItem.quantity) {
      await client.query(
        'UPDATE produit SET total = total - $1 WHERE id = $2',
        [parseInt(mainItem.quantity), parseInt(mainItem.product_id)]
      );
      console.log(`Deducted ${mainItem.quantity} units from product ${mainItem.product_id}`);
    }
    
    await client.query('COMMIT');
    
    res.json({
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
    
    // Get child orders to restore stock
    const childOrdersQuery = `
      SELECT produit_id, quantite FROM commande WHERE parent_order_id = $1
    `;
    
    const childOrdersResult = await client.query(childOrdersQuery, [orderId]);
    
    // Restore stock for each product
    for (const item of childOrdersResult.rows) {
      await client.query(
        'UPDATE produit SET stock = stock + $1 WHERE id = $2',
        [parseInt(item.quantite), parseInt(item.produit_id)]
      );
    }
    
    // Delete child orders
    await client.query(
      'DELETE FROM commande WHERE parent_order_id = $1',
      [orderId]
    );
    
    // Delete parent order
    await client.query(
      'DELETE FROM commande WHERE id = $1',
      [orderId]
    );
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Order deleted successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting client order:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
