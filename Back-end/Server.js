const express = require("express");
const cors = require("cors");
const pg = require("pg");
require('dotenv').config();

// Create a database connection pool instead of a single client
const pool = new pg.Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000, // timeout after 5 seconds
    max: 20 // set pool max size to 20
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to database successfully');
        release(); // release client back to pool
    }
});

// Use pool.query instead of db.query throughout the application
const db = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    }
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' })); // Increase payload limit for Base64 images
app.use(cors());

// Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.json("Hello World!");
});

// Route to add status column to commande table if it doesn't exist
app.get("/setup/add-status-column", async (req, res) => {
    try {
        // Check if the status column already exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'commande' AND column_name = 'status'
        `;
        const columnCheck = await db.query(checkColumnQuery);
        
        if (columnCheck.rows.length === 0) {
            // Column doesn't exist, add it
            const addColumnQuery = `
                ALTER TABLE commande 
                ADD COLUMN status VARCHAR(20) DEFAULT 'Pending'
            `;
            await db.query(addColumnQuery);
            res.json({ success: true, message: "Status column added to commande table" });
        } else {
            res.json({ success: true, message: "Status column already exists" });
        }
    } catch (error) {
        console.error("Error adding status column:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route to create facture and facture_items tables if they don't exist
app.get("/setup/create-facture-tables", async (req, res) => {
    try {
        // Check if the facture table exists
        const checkFactureTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'facture'
        `;
        const factureTableCheck = await db.query(checkFactureTableQuery);
        
        // Create facture table if it doesn't exist
        if (factureTableCheck.rows.length === 0) {
            const createFactureTableQuery = `
                CREATE TABLE facture (
                    id SERIAL PRIMARY KEY,
                    invoice_number VARCHAR(50) NOT NULL,
                    customer_name VARCHAR(100) NOT NULL,
                    client_id INTEGER REFERENCES clients(id),
                    date DATE NOT NULL,
                    due_date DATE,
                    status VARCHAR(20) DEFAULT 'Draft',
                    notes TEXT,
                    total_amount DECIMAL(10, 2) NOT NULL,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(createFactureTableQuery);
        }
        
        // Check if the facture_items table exists
        const checkItemsTableQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'facture_items'
        `;
        const itemsTableCheck = await db.query(checkItemsTableQuery);
        
        // Create facture_items table if it doesn't exist
        if (itemsTableCheck.rows.length === 0) {
            const createItemsTableQuery = `
                CREATE TABLE facture_items (
                    id SERIAL PRIMARY KEY,
                    facture_id INTEGER REFERENCES facture(id) ON DELETE CASCADE,
                    description VARCHAR(255) NOT NULL,
                    quantity INTEGER NOT NULL,
                    unit_price DECIMAL(10, 2) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(createItemsTableQuery);
        }
        
        res.json({ 
            success: true, 
            message: "Facture tables setup completed",
            factureTableCreated: factureTableCheck.rows.length === 0,
            itemsTableCreated: itemsTableCheck.rows.length === 0
        });
    } catch (error) {
        console.error("Error setting up facture tables:", error);
        res.status(500).json({ error: "Failed to setup facture tables" });
    }
});

app.get("/users", (req, res) => {
    const dbQuery = "SELECT * FROM users";
    db.query(dbQuery, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(result.rows);
        }
    });
})

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const checkUserQuery = "SELECT * FROM users WHERE email = $1";
    db.query(checkUserQuery, [email], (err, result) => {
        if (err) {
            console.error("Error checking existing user:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user
        });
    });
}) 

// Simple user registration endpoint without encryption
app.post("/register", (req, res) => {
    try {
        const { name, lastName, email, password } = req.body;
        
        // Validate input
        if (!name || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Check if user already exists
        const checkUserQuery = "SELECT * FROM users WHERE email = $1";
        db.query(checkUserQuery, [email], (err, result) => {
            if (err) {
                console.error("Error checking existing user:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            if (result.rows.length > 0) {
                return res.status(409).json({ error: "User with this email already exists" });
            }
            
            // Insert new user into database with plain password
            const insertUserQuery = 
                "INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *";
            const values = [name, lastName, email, password];
            
            db.query(insertUserQuery, values, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                
                // Return the newly created user
                const newUser = result.rows[0];
                
                res.status(201).json({
                    message: "User registered successfully",
                    user: newUser
                });
            });
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update user profile
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, lastName, email, phone, address, password, currentPassword } = req.body;
        
        // Validate input
        if (!name || !lastName || !email) {
            return res.status(400).json({ error: "Name, last name, and email are required" });
        }
        
        // Check if user exists
        const checkUserQuery = "SELECT * FROM users WHERE id = $1";
        const userCheck = await db.query(checkUserQuery, [id]);
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userCheck.rows[0];
        
        // Check if email is already taken by another user
        const emailCheckQuery = "SELECT * FROM users WHERE email = $1 AND id != $2";
        const emailCheck = await db.query(emailCheckQuery, [email, id]);
        
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ error: "Email is already in use by another account" });
        }
        
        // If password change is requested, verify current password
        if (password && password.trim() !== '') {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set a new password" });
            }
            
            // Verify current password
            if (currentPassword !== user.password) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }
        }
        
        // Update user in database
        let updateUserQuery;
        let values;
        
        if (password && password.trim() !== '') {
            updateUserQuery = `
                UPDATE users 
                SET name = $1, last_name = $2, email = $3, phone = $4, address = $5, password = $6
                WHERE id = $7 
                RETURNING *
            `;
            values = [name, lastName, email, phone || null, address || null, password, id];
        } else {
            updateUserQuery = `
                UPDATE users 
                SET name = $1, last_name = $2, email = $3, phone = $4, address = $5
                WHERE id = $6 
                RETURNING *
            `;
            values = [name, lastName, email, phone || null, address || null, id];
        }
        
        const result = await db.query(updateUserQuery, values);
        
        // Return the updated user
        const updatedUser = result.rows[0];
        
        res.status(200).json({
            message: "User profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get all users (admin only)
app.get("/users", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        // First check if the requesting user is an admin
        const checkAdminQuery = "SELECT role FROM users WHERE id = $1";
        const adminCheck = await db.query(checkAdminQuery, [userId]);
        
        if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        
        // If admin, return all users
        const query = "SELECT id, name, last_name, email, phone, address, role, created_at FROM users";
        const result = await db.query(query);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete a user (admin only)
app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // Check if the requesting user is an admin
        const checkAdminQuery = "SELECT role FROM users WHERE id = $1";
        const adminCheck = await db.query(checkAdminQuery, [userId]);
        
        if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        
        // Prevent deleting your own account
        if (parseInt(id) === parseInt(userId)) {
            return res.status(400).json({ error: "You cannot delete your own account" });
        }
        
        // Delete the user
        const deleteQuery = "DELETE FROM users WHERE id = $1 RETURNING *";
        const result = await db.query(deleteQuery, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({ message: "User deleted successfully", user: result.rows[0] });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//produit
//geting all products 

app.get("/produit", async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM produit";
        let params = [];
        
        if (userId) {
            query = "SELECT * FROM produit WHERE user_id = $1";
            params = [userId];
        }
        
        const allProducts = await db.query(query, params);
        res.json(allProducts.rows);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//get a product by id
app.get("/produit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db.query("SELECT * FROM produit WHERE id = $1", [id]);
        
        if (product.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json(product.rows[0]);
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//post product

app.post("/produit", async (req, res) => {
    try {
        console.log("Received product creation request");
        
        // Log the request body structure (without full image data for brevity)
        const requestBodyLog = { ...req.body };
        if (requestBodyLog.image) {
            requestBodyLog.image = `${requestBodyLog.image.substring(0, 30)}... (truncated)`;
        }
        console.log("Request body structure:", requestBodyLog);
        
        const {nom, description, image, total, serial_num, fournisseur_id, prix, user_id} = req.body;
        
        // Validate required fields
        if (!nom) {
            return res.status(400).json({ error: "Product name is required" });
        }
        
        // Log the values being inserted (without full image)
        console.log("Inserting product with values:", {
            nom, 
            description: description || 'null',
            image: image ? 'Image data present' : 'No image data',
            total, 
            serial_num: serial_num || 'null',
            fournisseur_id, 
            prix,
            user_id
        });
        
        const newProduct = await db.query(
            "INSERT INTO produit (nom, description, image, total, serial_num, fournisseur_id, prix, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [nom, description, image, total, serial_num, fournisseur_id, prix, user_id]
        );
        
        console.log("Product created successfully with ID:", newProduct.rows[0].id);
        
        res.status(201).json({
            message: "Product created successfully",
            produit: newProduct.rows[0]
        });
    } catch (error) {
        console.error("Error creating product:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
})

//update a product

app.put("/produit/:id", async (req, res) => {
    try {
        console.log("Received product update request for ID:", req.params.id);
        
        // Log the request body structure (without full image data for brevity)
        const requestBodyLog = { ...req.body };
        if (requestBodyLog.image) {
            requestBodyLog.image = `${requestBodyLog.image.substring(0, 30)}... (truncated)`;
        }
        console.log("Request body structure:", requestBodyLog);
        
        const {id} = req.params;
        const {nom, description, image, total, serial_num, fournisseur_id, prix, user_id} = req.body;
        
        // Validate required fields
        if (!nom) {
            return res.status(400).json({ error: "Product name is required" });
        }
        
        // First check if the product exists
        const productCheck = await db.query("SELECT * FROM produit WHERE id = $1", [id]);
        if (productCheck.rows.length === 0) {
            console.log("Product not found with ID:", id);
            return res.status(404).json({ error: "Product not found" });
        }
        
        // Check if the user has permission to update this product
        if (user_id && productCheck.rows[0].user_id !== user_id) {
            console.log("Permission denied. Product user_id:", productCheck.rows[0].user_id, "Request user_id:", user_id);
            return res.status(403).json({ error: "You don't have permission to update this product" });
        }
        
        // Log the values being updated (without full image)
        console.log("Updating product with values:", {
            id,
            nom, 
            description: description || 'null',
            image: image ? 'Image data present' : 'No image data',
            total, 
            serial_num: serial_num || 'null',
            fournisseur_id, 
            prix,
            user_id: user_id || productCheck.rows[0].user_id
        });
        
        const updatedProduct = await db.query(
            "UPDATE produit SET nom = $2, description = $3, image = $4, total = $5, serial_num = $6, fournisseur_id = $7, prix = $8, user_id = $9 WHERE id = $1 RETURNING *",
            [id, nom, description, image, total, serial_num, fournisseur_id, prix, user_id || productCheck.rows[0].user_id]
        );
        
        console.log("Product updated successfully with ID:", updatedProduct.rows[0].id);
        
        res.json(updatedProduct.rows[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
})

//delete a product

app.delete("/produit/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.query.userId;
        
        // Check if the product belongs to the user before deleting
        if (userId) {
            const productCheck = await db.query("SELECT * FROM produit WHERE id = $1", [id]);
            
            if (productCheck.rows.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            
            if (productCheck.rows[0].user_id !== parseInt(userId)) {
                return res.status(403).json({ error: "You don't have permission to delete this product" });
            }
        }
        
        await db.query("DELETE FROM produit WHERE id = $1", [id]);
        res.json("Product was deleted");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// Helper function to check available stock for a product
async function getAvailableStock(productId) {
    try {
        // Get the total stock from the product
        const productResult = await db.query("SELECT total FROM produit WHERE id = $1", [productId]);
        
        if (productResult.rows.length === 0) {
            throw new Error("Product not found");
        }
        
        const totalStock = parseInt(productResult.rows[0].total);
        
        // Get the sum of quantities from existing orders for this product
        const ordersResult = await db.query(
            "SELECT COALESCE(SUM(quantite), 0) as ordered_quantity FROM commande WHERE produit_id = $1",
            [productId]
        );
        
        const orderedQuantity = parseInt(ordersResult.rows[0].ordered_quantity || 0);
        
        // Calculate available stock
        const availableStock = Math.max(0, totalStock - orderedQuantity);
        
        return {
            totalStock,
            orderedQuantity,
            availableStock
        };
    } catch (error) {
        console.error("Error checking available stock:", error);
        throw error;
    }
}

//get all commandes

app.get("/commande", (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM commande";
        let params = [];
        
        // Filter by userId if provided
        if (userId) {
            query = "SELECT * FROM commande WHERE userId = $1";
            params = [userId];
        }
        
        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Error getting commandes:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json(result.rows);
        });
    } catch (error) {
        console.error("Error getting commandes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//get a commande

app.get("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the order without userId filtering
        const query = "SELECT * FROM commande WHERE id = $1";
        const aCommande = await db.query(query, [id]);
        
        if (aCommande.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json(aCommande.rows[0]);
    } catch (error) {
        console.error("Error getting commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//post commande

app.post("/commande", async (req, res) => {
    try {
        const { produit_id, nom_produit, quantite, date_commande, userId, customer_name, status } = req.body;
        
        // Check available stock before creating the order
        const stockInfo = await getAvailableStock(produit_id);
        
        // Verify if there's enough stock available
        if (quantite > stockInfo.availableStock) {
            return res.status(400).json({ 
                error: "Insufficient stock", 
                message: `Only ${stockInfo.availableStock} units available for this product.`,
                availableStock: stockInfo.availableStock,
                requestedQuantity: quantite
            });
        }
        
        // Create a basic query with required fields
        let query = "INSERT INTO commande (produit_id, nom_produit, quantite";
        let values = [produit_id, nom_produit, quantite];
        let placeholders = "$1, $2, $3";
        let valueIndex = 4;
        
        // Add optional fields if they exist
        if (date_commande) {
            query += ", date_commande";
            placeholders += ", $" + valueIndex++;
            values.push(date_commande);
        }
        
        if (userId) {
            query += ", userId";
            placeholders += ", $" + valueIndex++;
            values.push(userId);
        }
        
        if (customer_name) {
            query += ", customer_name";
            placeholders += ", $" + valueIndex++;
            values.push(customer_name);
        }
        
        // Add status field with default "Pending" if not provided
        query += ", status";
        placeholders += ", $" + valueIndex++;
        values.push(status || "Pending");
        
        // Complete the query
        query += ") VALUES (" + placeholders + ") RETURNING *";
        
        const newCommande = await db.query(query, values);
        
        res.status(201).json({
            message: "Commande created successfully",
            commande: newCommande.rows[0],
            stockInfo: {
                previouslyAvailable: stockInfo.availableStock,
                remainingAfterOrder: stockInfo.availableStock - quantite
            }
        });
    } catch (err) {
        console.error("error : ", err)
        res.status(500).json({ err: "Internal Server Error", details: err.message });
    }
});

//update a commande

app.put("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { produit_id, nom_produit, quantite, date_commande, customer_name, userId, status } = req.body;
        
        console.log("Update order request received:", { id, userId, status });
        
        // First check if the order exists
        const checkOrder = await db.query("SELECT * FROM commande WHERE id = $1", [id]);
        
        if (checkOrder.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        console.log("Order found:", checkOrder.rows[0]);
        console.log("Comparing userIds:", { 
            requestUserId: userId, 
            dbUserId: checkOrder.rows[0].userid,
            requestType: typeof userId,
            dbType: typeof checkOrder.rows[0].userid
        });
        
        // If userId is provided, ensure the order belongs to that user
        // For now, skip this check to allow any user to update any order
        // We'll implement proper user validation later
        /*
        if (userId && String(checkOrder.rows[0].userid) !== String(userId)) {
            return res.status(403).json({ error: "You don't have permission to update this order" });
        }
        */
        
        // Check if this is a status-only update
        const isStatusOnlyUpdate = status && 
            produit_id === checkOrder.rows[0].produit_id && 
            quantite === checkOrder.rows[0].quantite;
        
        // Get the original order quantity
        const originalQuantity = parseInt(checkOrder.rows[0].quantite);
        const originalProductId = checkOrder.rows[0].produit_id;
        
        // Only perform stock validation if this is not a status-only update
        if (!isStatusOnlyUpdate && (produit_id !== originalProductId || quantite > originalQuantity)) {
            // If product is changing, we need to check the new product's stock
            const productToCheck = produit_id !== originalProductId ? produit_id : originalProductId;
            
            // Check available stock
            const stockInfo = await getAvailableStock(productToCheck);
            
            // For the same product, we need to exclude the current order's quantity from the calculation
            let adjustedAvailableStock = stockInfo.availableStock;
            if (produit_id === originalProductId) {
                adjustedAvailableStock += originalQuantity;
            }
            
            // Verify if there's enough stock available
            if (quantite > adjustedAvailableStock) {
                return res.status(400).json({ 
                    error: "Insufficient stock", 
                    message: `Only ${adjustedAvailableStock} units available for this product.`,
                    availableStock: adjustedAvailableStock,
                    requestedQuantity: quantite
                });
            }
        }
        
        // Build the query dynamically based on provided fields
        let query = "UPDATE commande SET";
        let values = [];
        let paramIndex = 1;
        let updateFields = [];
        
        // Only include fields that are provided in the request
        if (produit_id !== undefined) {
            updateFields.push(` produit_id = $${paramIndex++}`);
            values.push(produit_id);
        }
        
        if (nom_produit !== undefined) {
            updateFields.push(` nom_produit = $${paramIndex++}`);
            values.push(nom_produit);
        }
        
        if (quantite !== undefined) {
            updateFields.push(` quantite = $${paramIndex++}`);
            values.push(quantite);
        }
        
        if (date_commande) {
            updateFields.push(` date_commande = $${paramIndex++}`);
            values.push(date_commande);
        }
        
        if (customer_name) {
            updateFields.push(` customer_name = $${paramIndex++}`);
            values.push(customer_name);
        }
        
        // Add status field if provided
        if (status) {
            updateFields.push(` status = $${paramIndex++}`);
            values.push(status);
        }
        
        // Ensure userId is preserved
        if (userId) {
            updateFields.push(` userId = $${paramIndex++}`);
            values.push(userId);
        }
        
        // If no fields to update, return the original order
        if (updateFields.length === 0) {
            return res.json(checkOrder.rows[0]);
        }
        
        query += updateFields.join(',');
        query += ` WHERE id = $${paramIndex} RETURNING *`;
        values.push(id);
        
        const updatedCommande = await db.query(query, values);
        
        if (updatedCommande.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json(updatedCommande.rows[0]);
    } catch (error) {
        console.error("Error updating commande:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

//delete a commande

app.delete("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // If userId is provided, ensure the order belongs to that user
        if (userId) {
            const checkOrder = await db.query("SELECT * FROM commande WHERE id = $1", [id]);
            
            if (checkOrder.rows.length === 0) {
                return res.status(404).json({ error: "Order not found" });
            }
            
            if (checkOrder.rows[0].userId !== userId) {
                return res.status(403).json({ error: "You don't have permission to delete this order" });
            }
        }
        
        const deletedCommande = await db.query("DELETE FROM commande WHERE id = $1 RETURNING *", [id]);
        
        if (deletedCommande.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        res.json(deletedCommande.rows[0]);
    } catch (error) {
        console.error("Error deleting commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//fournisseur
// get fournisseur

app.get("/fournisseur", (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM fournisseur";
        let params = [];
        
        // Filter by userId if provided
        if (userId) {
            query = "SELECT * FROM fournisseur WHERE userId = $1";
            params = [userId];
        }
        
        db.query(query, params, (err, result) => {
            if (err) {
                console.error("Error getting fournisseurs:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json(result.rows);
        });
    } catch (error) {
        console.error("Error getting fournisseurs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//get a fournisseur

app.get("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.query.userId;
        
        let query = "SELECT * FROM fournisseur WHERE id = $1";
        let params = [id];
        
        // If userId is provided, ensure the supplier belongs to that user
        if (userId) {
            query = "SELECT * FROM fournisseur WHERE id = $1 AND userId = $2";
            params = [id, userId];
        }
        
        const aFournisseur = await db.query(query, params);
        
        if (aFournisseur.rows.length === 0) {
            return res.status(404).json({ error: "Supplier not found or you don't have permission to view it" });
        }
        
        res.json(aFournisseur.rows[0]);
    } catch (error) {
        console.error("Error getting fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//post fournisseur

app.post("/fournisseur", async (req, res) => {
    try {
        let {nom_entreprise, num_registre, email, tel, userId} = req.body;
        
        // Log the received data for debugging
        console.log("Creating new fournisseur");
        console.log("Received data:", { nom_entreprise, num_registre, email, tel, userId });
        
        // Ensure proper type conversion and data cleaning
        nom_entreprise = nom_entreprise ? nom_entreprise.trim() : '';
        email = email ? email.trim() : '';
        
        // Create a basic query with required fields
        let query = "INSERT INTO fournisseur (nom_entreprise, num_registre, email, tel";
        let values = [nom_entreprise, num_registre, email, tel];
        let placeholders = "$1, $2, $3, $4";
        let valueIndex = 5;
        
        // Add userId if it exists
        if (userId) {
            query += ", userId";
            placeholders += ", $" + valueIndex;
            values.push(userId);
        }
        
        // Complete the query
        query += ") VALUES (" + placeholders + ") RETURNING *";
        
        const newFournisseur = await db.query(query, values);
        
        res.status(201).json({
            message: "Fournisseur created successfully",
            fournisseur: newFournisseur.rows[0]
        });
    } catch (error) {
        console.error("Error creating fournisseur:", error);
        res.status(500).json({ 
            error: "Internal Server Error", 
            message: error.message,
            detail: error.detail || "No additional details"
        });
    }
})

//update a fournisseur

app.put("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        let {nom_entreprise, num_registre, email, tel, userId} = req.body;
        
        // Log the received data for debugging
        console.log("Updating fournisseur with ID:", id);
        console.log("Received data:", { nom_entreprise, num_registre, email, tel, userId });
        
        // First check if the supplier exists and belongs to the user
        const checkSupplier = await db.query("SELECT * FROM fournisseur WHERE id = $1", [id]);
        
        if (checkSupplier.rows.length === 0) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        
        // If userId is provided, ensure the supplier belongs to that user
        if (userId && checkSupplier.rows[0].userId !== userId) {
            return res.status(403).json({ error: "You don't have permission to update this supplier" });
        }
        
        // Ensure proper type conversion and data cleaning
        nom_entreprise = nom_entreprise ? nom_entreprise.trim() : '';
        email = email ? email.trim() : '';
        
        // Build the query dynamically based on provided fields
        let query = "UPDATE fournisseur SET nom_entreprise = $1, num_registre = $2, email = $3, tel = $4";
        let values = [nom_entreprise, num_registre, email, tel];
        let paramIndex = 5;
        
        // Ensure userId is preserved
        if (userId) {
            query += `, userId = $${paramIndex}`;
            values.push(userId);
            paramIndex++;
        }
        
        query += ` WHERE id = $${paramIndex} RETURNING *`;
        values.push(id);
        
        // Use parameterized query to prevent SQL injection
        const updatedFournisseur = await db.query(query, values);
        
        if (updatedFournisseur.rows.length === 0) {
            return res.status(404).json({ error: "Fournisseur not found" });
        }
        
        // Log the result
        console.log("Update result:", updatedFournisseur.rows[0]);
        
        res.json(updatedFournisseur.rows[0]);
    } catch (error) {
        console.error("Error updating fournisseur:", error);
        // Send more detailed error information
        res.status(500).json({ 
            error: "Internal Server Error", 
            message: error.message,
            detail: error.detail || "No additional details",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
})

//delete a fournisseur

app.delete("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.query.userId;
        
        // If userId is provided, ensure the supplier belongs to that user
        if (userId) {
            const checkSupplier = await db.query("SELECT * FROM fournisseur WHERE id = $1", [id]);
            
            if (checkSupplier.rows.length === 0) {
                return res.status(404).json({ error: "Supplier not found" });
            }
            
            if (checkSupplier.rows[0].userId !== userId) {
                return res.status(403).json({ error: "You don't have permission to delete this supplier" });
            }
        }
        
        const deletedFournisseur = await db.query("DELETE FROM fournisseur WHERE id = $1 RETURNING *", [id]);
        
        if (deletedFournisseur.rows.length === 0) {
            return res.status(404).json({ error: "Supplier not found" });
        }
        
        res.json(deletedFournisseur.rows[0]);
    } catch (error) {
        console.error("Error deleting fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// CLIENTS API ENDPOINTS

// Get all clients
app.get("/clients", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        const allClients = await db.query("SELECT * FROM clients WHERE userid = $1 ORDER BY date_creation DESC", [userId]);
        res.json(allClients.rows);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get a specific client
app.get("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        const client = await db.query("SELECT * FROM clients WHERE id = $1 AND userid = $2", [id, userId]);
        
        if (client.rows.length === 0) {
            return res.status(404).json({ error: "Client not found" });
        }
        
        res.json(client.rows[0]);
    } catch (error) {
        console.error("Error fetching client:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Create a new client
app.post("/clients", async (req, res) => {
    try {
        const { nom, prenom, email, telephone, adresse, ville, code_postal, pays, notes, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        if (!nom) {
            return res.status(400).json({ error: "Client name is required" });
        }
        
        const newClient = await db.query(
            "INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal, pays, notes, userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [nom, prenom, email, telephone, adresse, ville, code_postal, pays, notes, userId]
        );
        
        res.status(201).json(newClient.rows[0]);
    } catch (error) {
        console.error("Error creating client:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Update a client
app.put("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email, telephone, adresse, ville, code_postal, pays, notes, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        // Check if client exists and belongs to user
        const checkClient = await db.query("SELECT * FROM clients WHERE id = $1 AND userid = $2", [id, userId]);
        
        if (checkClient.rows.length === 0) {
            return res.status(404).json({ error: "Client not found or you don't have permission to edit this client" });
        }
        
        if (!nom) {
            return res.status(400).json({ error: "Client name is required" });
        }
        
        const updatedClient = await db.query(
            "UPDATE clients SET nom = $1, prenom = $2, email = $3, telephone = $4, adresse = $5, ville = $6, code_postal = $7, pays = $8, notes = $9 WHERE id = $10 AND userid = $11 RETURNING *",
            [nom, prenom, email, telephone, adresse, ville, code_postal, pays, notes, id, userId]
        );
        
        res.json(updatedClient.rows[0]);
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Delete a client
app.delete("/clients/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        // Check if client exists and belongs to user
        const checkClient = await db.query("SELECT * FROM clients WHERE id = $1 AND userid = $2", [id, userId]);
        
        if (checkClient.rows.length === 0) {
            return res.status(404).json({ error: "Client not found or you don't have permission to delete this client" });
        }
        
        // Check if client has associated orders
        const checkOrders = await db.query("SELECT * FROM commande WHERE customer_name LIKE $1 AND userid = $2", [`%${checkClient.rows[0].nom}%`, userId]);
        
        if (checkOrders.rows.length > 0) {
            return res.status(400).json({ error: "Cannot delete client with associated orders. Please delete the orders first or update them to use a different client." });
        }
        
        await db.query("DELETE FROM clients WHERE id = $1 AND userid = $2", [id, userId]);
        
        res.json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

//Factures
//get all Factures

app.get("/facture", async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM facture";
        let params = [];
        
        if (userId) {
            query = "SELECT * FROM facture WHERE user_id = $1";
            params = [userId];
        }
        
        const allFactures = await db.query(query, params);
        res.json(allFactures.rows);
    } catch (error) {
        console.error("Error getting factures:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// Get a single invoice by ID
app.get("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // First get the invoice details
        const factureQuery = `
            SELECT * FROM facture 
            WHERE id = $1 ${userId ? 'AND user_id = $2' : ''}
        `;
        
        const factureParams = userId ? [id, userId] : [id];
        const factureResult = await db.query(factureQuery, factureParams);
        
        if (factureResult.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        const invoice = factureResult.rows[0];
        
        // Then get the invoice items
        const itemsQuery = `
            SELECT * FROM facture_items 
            WHERE facture_id = $1
        `;
        
        const itemsResult = await db.query(itemsQuery, [id]);
        
        // Combine the invoice with its items
        invoice.items = itemsResult.rows;
        
        res.json(invoice);
    } catch (error) {
        console.error("Error getting invoice:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Update an existing invoice
app.put("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // Extract invoice data from request body
        const { 
            customer_name, 
            client_id, 
            date, 
            due_date, 
            status, 
            notes, 
            total_amount, 
            items,
            user_id 
        } = req.body;
        
        // Verify the invoice exists and belongs to the user
        const checkQuery = `
            SELECT * FROM facture 
            WHERE id = $1 ${userId ? 'AND user_id = $2' : ''}
        `;
        
        const checkParams = userId ? [id, userId] : [id];
        const checkResult = await db.query(checkQuery, checkParams);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found or you don't have permission to edit it" });
        }
        
        // Start a transaction
        await db.query('BEGIN');
        
        // Update the invoice in the facture table
        const updateFactureQuery = `
            UPDATE facture 
            SET 
                customer_name = $1, 
                client_id = $2, 
                date = $3, 
                due_date = $4, 
                status = $5, 
                notes = $6, 
                total_amount = $7
            WHERE id = $8
            RETURNING *
        `;
        
        const factureValues = [
            customer_name,
            client_id,
            date,
            due_date || null,
            status || 'Draft',
            notes || '',
            total_amount,
            id
        ];
        
        const updatedFacture = await db.query(updateFactureQuery, factureValues);
        
        // Delete existing invoice items
        await db.query('DELETE FROM facture_items WHERE facture_id = $1', [id]);
        
        // Insert new invoice items
        if (items && items.length > 0) {
            const insertItemsQuery = `
                INSERT INTO facture_items (
                    facture_id, 
                    description, 
                    quantity, 
                    unit_price, 
                    amount
                ) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            
            for (const item of items) {
                await db.query(insertItemsQuery, [
                    id,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.amount
                ]);
            }
        }
        
        // Commit the transaction
        await db.query('COMMIT');
        
        res.json({
            message: "Invoice updated successfully",
            invoice: updatedFacture.rows[0]
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        console.error("Error updating invoice:", error);
        console.error("Error details:", error.stack);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Create a new invoice (facture)
app.post("/facture", async (req, res) => {
    try {
        // Extract invoice data from request body
        const { 
            invoice_number, 
            customer_name, 
            client_id, 
            date, 
            due_date, 
            status, 
            notes, 
            total_amount, 
            items, 
            user_id 
        } = req.body;

        // Start a transaction
        await db.query('BEGIN');

        // Insert the invoice into the facture table
        const insertFactureQuery = `
            INSERT INTO facture (
                invoice_number, 
                customer_name, 
                client_id, 
                date, 
                due_date, 
                status, 
                notes, 
                total_amount, 
                user_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;
        
        const factureValues = [
            invoice_number,
            customer_name,
            client_id,
            date,
            due_date || null,
            status || 'Draft',
            notes || '',
            total_amount,
            user_id
        ];

        const factureResult = await db.query(insertFactureQuery, factureValues);
        const factureId = factureResult.rows[0].id;

        // If there are invoice items, insert them into a facture_items table
        // Note: You may need to create this table if it doesn't exist
        if (items && items.length > 0) {
            for (const item of items) {
                const insertItemQuery = `
                    INSERT INTO facture_items (
                        facture_id,
                        description,
                        quantity,
                        unit_price,
                        amount
                    )
                    VALUES ($1, $2, $3, $4, $5)
                `;
                
                const itemValues = [
                    factureId,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.amount
                ];
                
                await db.query(insertItemQuery, itemValues);
            }
        }

        // Commit the transaction
        await db.query('COMMIT');

        res.status(201).json({ 
            success: true, 
            message: "Invoice created successfully", 
            id: factureId 
        });
    } catch (error) {
        // Rollback in case of error
        await db.query('ROLLBACK');
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// Delete an invoice
app.delete("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;

        // First delete related items from facture_items table
        await db.query("DELETE FROM facture_items WHERE facture_id = $1", [id]);

        // Then delete the invoice itself, ensuring it belongs to the user
        const deleteQuery = "DELETE FROM facture WHERE id = $1 AND user_id = $2";
        const result = await db.query(deleteQuery, [id, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Invoice not found or you don't have permission to delete it" });
        }

        res.json({ success: true, message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ error: "Failed to delete invoice" });
    }
});

// Add a fallback route handler for any undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found", path: req.path });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// For Vercel serverless functions
module.exports = app;
