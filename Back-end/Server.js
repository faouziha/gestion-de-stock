const express = require("express");
const cors = require("cors");
const pg = require("pg");
const bcrypt = require("bcrypt");
const multiClientOrdersRouter = require("./MultiClientOrders");
const clientOrdersRouter = require("./clientorders_routes");
const { router: orderDetailsRouter } = require("./order_details_routes");
const categoriesSetupRouter = require("./categories_setup");
const categoriesRouter = require("./categories_api");
const brandsSetupRouter = require("./brands_setup");
const brandsRouter = require("./brands_api");
const clientSoldeRouter = require("./client_solde_routes");
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

// Register the multi-client-order router
app.use('/multi-client-order', multiClientOrdersRouter);

// Register the client orders router
app.use(clientOrdersRouter);

// Register the order details router
app.use(orderDetailsRouter);

// Register the categories setup router
app.use(categoriesSetupRouter);

// Register the categories API router
app.use('/categories', categoriesRouter);

// Register the brands setup router
app.use(brandsSetupRouter);

// Register the brands API router
app.use('/brands', brandsRouter);

// Register the client solde router
app.use(clientSoldeRouter);

// Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.json("Hello World!");
});

// Authentication middleware to verify admin role
const authenticateAdmin = async (req, res, next) => {
    try {
        const userId = req.query.userId || req.body.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Authentication required. Please provide userId." });
        }
        
        // Check if the user exists and is an admin
        const checkAdminQuery = "SELECT role FROM users WHERE id = $1";
        const adminCheck = await db.query(checkAdminQuery, [userId]);
        
        if (adminCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (adminCheck.rows[0].role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized. Admin privileges required." });
        }
        
        // User is authenticated as admin, proceed
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Endpoint to update a user's role to admin (protected, admin only)
app.get("/setup/make-admin", authenticateAdmin, async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ error: "Email parameter is required" });
        }
        
        // Update the user's role to admin
        const updateRoleQuery = `
            UPDATE users
            SET role = 'admin'
            WHERE email = $1
            RETURNING id, name, last_name, email, role
        `;
        
        const result = await db.query(updateRoleQuery, [email]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json({
            message: "User role updated to admin successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to add status column to commande table if it doesn't exist (protected, admin only)
app.get("/setup/add-status-column", authenticateAdmin, async (req, res) => {
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

// Route to create facture and facture_items tables if they don't exist (protected, admin only)
// Endpoint to alter bon_achat (Bon de Livraison) table
app.get("/setup/alter-bon-achat-table", authenticateAdmin, async (req, res) => {
    try {
        // List of columns we need to add
        const columnsToAdd = [
            { name: "order_id", type: "INTEGER" },
            { name: "user_id", type: "INTEGER" },
            { name: "date", type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
            { name: "client_id", type: "INTEGER" },
            { name: "reference", type: "VARCHAR(255)" },
            { name: "total", type: "NUMERIC(12,2)" },
            { name: "status", type: "VARCHAR(50)" },
            { name: "notes", type: "TEXT" }
        ];
        
        // For each column, check if it exists and add it if it doesn't
        for (const column of columnsToAdd) {
            const checkColumnQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'bon_achat' AND column_name = '${column.name}';
            `;
            const columnCheck = await db.query(checkColumnQuery);
            
            if (columnCheck.rows.length === 0) {
                // Column doesn't exist, add it
                const alterQuery = `
                    ALTER TABLE bon_achat 
                    ADD COLUMN ${column.name} ${column.type};
                `;
                await db.query(alterQuery);
                console.log(`Added column ${column.name} to bon_achat table`);
            }
        }
        
        res.json({ success: true, message: "bon_achat table structure updated successfully." });
    } catch (error) {
        console.error("Error altering bon_achat table:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to create a separate bon_livraison table for BL
app.get("/setup/create-bl-livraison-table", authenticateAdmin, async (req, res) => {
    try {
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS bl_livraison (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            client_name TEXT,
            reference TEXT,
            bl_number TEXT NOT NULL,
            total NUMERIC(10, 2),
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        );
        `;
        await db.query(createTableQuery);
        res.json({ success: true, message: "bl_livraison table created successfully" });
    } catch (error) {
        console.error("Error creating bl_livraison table:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to save a delivered order to bl_livraison (Bon de Livraison)
app.post("/api/bl/save", async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        if (!orderId || !userId) return res.json({ success: false, error: "Missing orderId or userId" });
        
        // First check if the bl_livraison table exists, if not create it
        try {
            await db.query("SELECT * FROM bl_livraison LIMIT 1");
        } catch (err) {
            // Table doesn't exist, create it
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS bl_livraison (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                client_name TEXT,
                reference TEXT,
                bl_number TEXT NOT NULL,
                total NUMERIC(10, 2),
                date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            );
            `;
            await db.query(createTableQuery);
        }
        
        // Get the order details
        const orderResult = await db.query("SELECT * FROM commande WHERE id = $1 AND userId = $2", [orderId, userId]);
        if (orderResult.rows.length === 0) return res.json({ success: false, error: "Order not found" });
        const order = orderResult.rows[0];
        
        // Log order details for debugging
        console.log("Order found:", { id: order.id, status: order.status, fields: Object.keys(order) });
        
        if (order.status !== 'Delivered') return res.json({ success: false, error: "Order is not delivered." });
        
        // Get the total directly from the order object
        let totalAmount = 0;
        if (order.total) {
            totalAmount = parseFloat(order.total);
            console.log("Using order.total:", totalAmount);
        } else if (order.montant) {
            totalAmount = parseFloat(order.montant);
            console.log("Using order.montant:", totalAmount);
        } else if (order.amount) {
            totalAmount = parseFloat(order.amount);
            console.log("Using order.amount:", totalAmount);
        } else {
            console.log("No recognizable total field found in order", order);
            // Default to 0 if no total found
            totalAmount = 0;
        }
        
        // Generate a unique BL number based on the order reference
        const blNumber = `BL-${order.reference || orderId}`;
        
        // Check if already saved to our new table
        const exists = await db.query("SELECT * FROM bl_livraison WHERE order_id = $1", [orderId]);
        if (exists.rows.length > 0) return res.json({ success: false, error: "Order already saved as BL." });
        
        // Let's get the total directly from the order record
        console.log("Order data for BL:", order);
        
        if (order.total_amount && !isNaN(parseFloat(order.total_amount))) {
            totalAmount = parseFloat(order.total_amount);
            console.log("Using order.total_amount:", totalAmount);
        }
        else if (order.montant && !isNaN(parseFloat(order.montant))) {
            totalAmount = parseFloat(order.montant);
            console.log("Using order.montant:", totalAmount);
        }
        else if (order.total && !isNaN(parseFloat(order.total))) {
            totalAmount = parseFloat(order.total);
            console.log("Using order.total:", totalAmount);
        }
        else {
            // If no total found, let's create a more realistic estimate
            // Look at the order reference which might contain the total
            const potentialAmount = parseFloat(order.reference?.match(/(\d+\.?\d*)/)?.[0]);
            if (!isNaN(potentialAmount)) {
                totalAmount = potentialAmount;
                console.log("Using amount extracted from reference:", totalAmount);
            } else {
                // Set a fixed amount if all else fails
                totalAmount = 1000;
                console.log("Using fallback amount:", totalAmount);
            }
        }
        
        console.log("Final total amount for BL:", totalAmount);
        
        // Insert into our new bl_livraison table with the calculated total
        await db.query(
            "INSERT INTO bl_livraison (order_id, user_id, client_name, reference, bl_number, total, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [order.id, userId, order.customer_name, order.reference, blNumber, totalAmount, order.notes]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error saving BL:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to list BL for the logged-in user
app.get("/api/bl/list", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.json({ success: false, error: "Missing userId" });
        
        // First check if the bl_livraison table exists, if not create it
        try {
            await db.query("SELECT * FROM bl_livraison LIMIT 1");
        } catch (err) {
            // Table doesn't exist, create it
            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS bl_livraison (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                client_name TEXT,
                reference TEXT,
                bl_number TEXT NOT NULL,
                total NUMERIC(10, 2),
                date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            );
            `;
            await db.query(createTableQuery);
        }
        
        // Query from the new bl_livraison table
        const query = `
            SELECT * FROM bl_livraison 
            WHERE user_id = $1 
            ORDER BY id DESC
        `;
        const result = await db.query(query, [userId]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error listing BL:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to delete a BL record
app.delete("/api/bl/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        
        if (!id || !userId) {
            return res.status(400).json({ success: false, error: "Missing id or userId" });
        }
        
        // Make sure user owns this BL record before deleting
        const checkOwnership = await db.query("SELECT * FROM bl_livraison WHERE id = $1 AND user_id = $2", [id, userId]);
        
        if (checkOwnership.rows.length === 0) {
            return res.status(403).json({ success: false, error: "Not authorized to delete this record" });
        }
        
        // Delete the BL record
        await db.query("DELETE FROM bl_livraison WHERE id = $1", [id]);
        
        res.json({ success: true, message: "Bon de Livraison deleted successfully" });
    } catch (error) {
        console.error("Error deleting BL:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/setup/create-facture-tables", authenticateAdmin, async (req, res) => {
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
        // Compare password with hashed password in database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            
            res.status(200).json({
                message: "Login successful",
                user
            });
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
            
            // Hash the password with bcrypt before storing
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                
                // Insert new user into database with hashed password
                const insertUserQuery = 
                    "INSERT INTO users (name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *";
                const values = [name, lastName, email, hashedPassword];
                
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
            
            // Verify current password against hashed password in database
            try {
                const passwordMatch = await bcrypt.compare(currentPassword, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Current password is incorrect" });
                }
            } catch (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
        }
        
        // Update user in database
        let updateUserQuery;
        let values;
        
        if (password && password.trim() !== '') {
            // Hash the new password
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                
                updateUserQuery = `
                    UPDATE users 
                    SET name = $1, last_name = $2, email = $3, phone = $4, address = $5, password = $6
                    WHERE id = $7 
                    RETURNING *
                `;
                values = [name, lastName, email, phone || null, address || null, hashedPassword, id];
            } catch (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
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
// Endpoint to update a user's role
app.put("/users/:id/role", async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.body;
        
        // Verify the requester is an admin
        const adminCheckQuery = `
            SELECT role FROM users WHERE id = $1
        `;
        const adminResult = await db.query(adminCheckQuery, [userId]);
        
        if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized. Only admins can update user roles." });
        }
        
        // Update the user's role
        const updateRoleQuery = `
            UPDATE users
            SET role = $1
            WHERE id = $2
            RETURNING id, name, last_name, email, role
        `;
        
        const result = await db.query(updateRoleQuery, [role, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.status(200).json({
            message: "User role updated successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
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
        console.log("Fetching products with userId:", req.query.userId);
        const userId = req.query.userId;
        
        // Use JOIN query to include category information
        const query = `
            SELECT p.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM produit p
            LEFT JOIN categories c ON p.category_id = c.id
            ${userId ? 'WHERE p.userid = $1' : ''}
        `;
        
        const params = userId ? [userId] : [];
        
        console.log("Executing query:", query);
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
        
        // Use JOIN query to include category information
        const query = `
            SELECT p.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM produit p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const product = await db.query(query, [id]);
        
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
        if (requestBodyLog.image_url) {
            requestBodyLog.image_url = `${requestBodyLog.image_url.substring(0, 30)}... (truncated)`;
        }
        console.log("Request body structure:", requestBodyLog);
        
        // Extract data from request body
        const {nom, description, image, total, serial_num, fournisseur_id, prix, category_id, user_id} = req.body;
        // In the new schema, column names match the frontend names directly
        const userid = user_id; // Map user_id to userid for database consistency
        
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
            category_id: category_id || 'null',
            userid
        });
        
        // Parse numeric values to ensure correct data types
        const parsedPrice = prix ? parseFloat(prix) : null;
        const parsedTotal = total ? parseInt(total) : null;
        
        const newProduct = await db.query(
            "INSERT INTO produit (nom, description, image, total, serial_num, fournisseur_id, prix, category_id, userid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [nom, description, image, parsedTotal, serial_num, fournisseur_id, parsedPrice, category_id || null, userid]
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
        if (requestBodyLog.image_url) {
            requestBodyLog.image_url = `${requestBodyLog.image_url.substring(0, 30)}... (truncated)`;
        }
        console.log("Request body structure:", requestBodyLog);
        
        const {id} = req.params;
        const {nom, description, image, total, serial_num, fournisseur_id, prix, user_id, brand_id} = req.body;
        // In the new schema, column names match the frontend names directly
        const userid = user_id; // Map user_id to userid for database consistency
        
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
        if (userid && productCheck.rows[0].userid !== userid) {
            console.log("Permission denied. Product userid:", productCheck.rows[0].userid, "Request userid:", userid);
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
            category_id: req.body.category_id || 'null',
            brand_id: brand_id || 'null',
            userid: userid || productCheck.rows[0].userid
        });
        
        // Parse numeric values to ensure correct data types
        const parsedPrice = prix ? parseFloat(prix) : null;
        const parsedTotal = total ? parseInt(total) : null;
        
        const updatedProduct = await db.query(
            "UPDATE produit SET nom = $2, description = $3, image = $4, total = $5, serial_num = $6, fournisseur_id = $7, prix = $8, category_id = $9, userid = $10, brand_id = $11 WHERE id = $1 RETURNING *",
            [id, nom, description, image, parsedTotal, serial_num, fournisseur_id, parsedPrice, req.body.category_id || null, userid || productCheck.rows[0].userid, brand_id || null]
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
        const { produit_id, nom_produit, quantite, date_commande, userId, customer_name, status, unit_price, total_amount } = req.body;
        
        console.log("Order creation request body:", req.body);
        
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
        
        // Add unit_price field if provided
        if (unit_price !== undefined) {
            query += ", unit_price";
            placeholders += ", $" + valueIndex++;
            values.push(parseFloat(unit_price) || 0);
            console.log("Adding unit_price to query:", parseFloat(unit_price) || 0);
        }
        
        // Add total_amount field if provided
        if (total_amount !== undefined) {
            query += ", total_amount";
            placeholders += ", $" + valueIndex++;
            values.push(parseFloat(total_amount) || 0);
            console.log("Adding total_amount to query:", parseFloat(total_amount) || 0);
        }
        
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
        const { produit_id, nom_produit, quantite, date_commande, customer_name, userId, status, unit_price, total_amount } = req.body;
        
        console.log("Order update request with price details:", { unit_price, total_amount });
        
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
        
        // Add unit_price field if provided
        if (unit_price !== undefined) {
            updateFields.push(` unit_price = $${paramIndex++}`);
            values.push(parseFloat(unit_price) || 0);
            console.log("Adding unit_price to update query:", parseFloat(unit_price) || 0);
        }
        
        // Add total_amount field if provided
        if (total_amount !== undefined) {
            updateFields.push(` total_amount = $${paramIndex++}`);
            values.push(parseFloat(total_amount) || 0);
            console.log("Adding total_amount to update query:", parseFloat(total_amount) || 0);
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

// Update an order
app.put("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { produit_id, nom_produit, quantite, date_commande, customer_name, status, is_parent } = req.body;
        const userId = req.query.userId;

        // Validate required fields
        if (!id || !userId) {
            return res.status(400).json({ error: "Order ID and userId are required" });
        }

        // Check if order exists and belongs to the user
        const orderResult = await db.query("SELECT * FROM commande WHERE id = $1 AND userId = $2", [id, userId]);
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Order not found or not authorized" });
        }

        const existingOrder = orderResult.rows[0];
        
        // Start building the update query
        let updateFields = [];
        let values = [];
        let paramIndex = 1;

        // Only update fields that are provided and handle type conversions
        if (produit_id !== undefined) {
            updateFields.push(`produit_id = $${paramIndex}`);
            values.push(parseInt(produit_id));
            paramIndex++;
        }

        if (nom_produit !== undefined) {
            updateFields.push(`nom_produit = $${paramIndex}`);
            values.push(nom_produit);
            paramIndex++;
        }

        if (quantite !== undefined) {
            updateFields.push(`quantite = $${paramIndex}`);
            values.push(parseInt(quantite));
            paramIndex++;
        }

        if (date_commande !== undefined) {
            updateFields.push(`date_commande = $${paramIndex}`);
            values.push(date_commande);
            paramIndex++;
        }

        if (customer_name !== undefined) {
            updateFields.push(`customer_name = $${paramIndex}`);
            values.push(customer_name);
            paramIndex++;
        }

        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }

        // Add the userId and id to the values array for the WHERE clause
        values.push(userId);
        values.push(id);

        // If there are no fields to update, return success without making a query
        if (updateFields.length === 0) {
            return res.json({ message: "No fields to update" });
        }

        // Build and execute the UPDATE query
        const updateQuery = `
            UPDATE commande 
            SET ${updateFields.join(", ")} 
            WHERE userId = $${paramIndex} AND id = $${paramIndex + 1} 
            RETURNING *
        `;

        const result = await db.query(updateQuery, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update a multi-product order (parent order and its child orders)
app.put("/multi-client-order/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { orderData, items } = req.body;
        const userId = req.query.userId;

        if (!id || !userId) {
            return res.status(400).json({ error: "Order ID and userId are required" });
        }

        // Verify this is a parent order
        const orderResult = await db.query(
            "SELECT * FROM commande WHERE id = $1 AND userId = $2 AND is_parent = true", 
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: "Parent order not found or not authorized" });
        }

        const parentOrder = orderResult.rows[0];
        
        // Begin transaction
        await db.query('BEGIN');
        
        try {
            // 1. Update the parent order
            let updateFields = [];
            let values = [];
            let paramIndex = 1;
            
            // Fields that can be updated for the parent order
            const updateableFields = ['customer_name', 'date_commande', 'status'];
            
            for (const field of updateableFields) {
                if (orderData[field] !== undefined) {
                    updateFields.push(`${field} = $${paramIndex}`);
                    values.push(orderData[field]);
                    paramIndex++;
                }
            }
            
            if (updateFields.length > 0) {
                // Add conditions to WHERE clause
                values.push(userId);
                values.push(id);
                
                const updateQuery = `
                    UPDATE commande 
                    SET ${updateFields.join(", ")} 
                    WHERE userId = $${paramIndex} AND id = $${paramIndex + 1} 
                    RETURNING *
                `;
                
                const updatedParentResult = await db.query(updateQuery, values);
                console.log('Parent order updated:', updatedParentResult.rows[0]);
            }
            
            // 2. Get existing child orders
            const existingChildOrdersResult = await db.query(
                "SELECT * FROM commande WHERE parent_order_id = $1 ORDER BY id", 
                [id]
            );
            const existingChildOrders = existingChildOrdersResult.rows;
            console.log(`Found ${existingChildOrders.length} existing child orders`);
            
            // 3. For each item in the request:
            //    - If it has an id that matches an existing child order, update it
            //    - If it's new (no id), create a new child order
            for (const item of items) {
                if (item.id) {
                    // This is an existing child order - update it
                    let childUpdateFields = [];
                    let childValues = [];
                    let childParamIndex = 1;
                    
                    // Fields that can be updated for child orders
                    const childUpdateableFields = [
                        { name: 'produit_id', convert: val => parseInt(val) },
                        { name: 'nom_produit', convert: val => val },
                        { name: 'quantite', convert: val => parseInt(val) },
                        { name: 'unit_price', convert: val => parseFloat(val) },
                        { name: 'total_amount', convert: val => parseFloat(val) }
                    ];
                    
                    for (const field of childUpdateableFields) {
                        if (item[field.name] !== undefined) {
                            childUpdateFields.push(`${field.name} = $${childParamIndex}`);
                            childValues.push(field.convert(item[field.name]));
                            childParamIndex++;
                        }
                    }
                    
                    // Update status and date if parent order changed
                    if (orderData.status) {
                        childUpdateFields.push(`status = $${childParamIndex}`);
                        childValues.push(orderData.status);
                        childParamIndex++;
                    }
                    
                    if (orderData.date_commande) {
                        childUpdateFields.push(`date_commande = $${childParamIndex}`);
                        childValues.push(orderData.date_commande);
                        childParamIndex++;
                    }
                    
                    if (childUpdateFields.length > 0) {
                        // Add conditions to WHERE clause
                        childValues.push(item.id);
                        childValues.push(id); // parent_order_id
                        
                        const childUpdateQuery = `
                            UPDATE commande 
                            SET ${childUpdateFields.join(", ")} 
                            WHERE id = $${childParamIndex} AND parent_order_id = $${childParamIndex + 1} 
                            RETURNING *
                        `;
                        
                        const updatedChildResult = await db.query(childUpdateQuery, childValues);
                        console.log(`Updated child order #${item.id}:`, updatedChildResult.rows[0]);
                    }
                } else {
                    // This is a new child order - create it
                    console.log('Creating new child order for product:', item.nom_produit);
                    
                    // Format the child order data
                    const productId = parseInt(item.produit_id);
                    const productName = item.nom_produit?.trim() || 'Unknown Product';
                    const quantity = parseInt(item.quantite) || 1;
                    const unitPrice = parseFloat(item.unit_price) || 0;
                    const totalAmount = parseFloat(item.total_amount) || (unitPrice * quantity);
                    
                    const newChildQuery = `
                        INSERT INTO commande (
                            produit_id, nom_produit, quantite, date_commande, 
                            customer_name, userId, status, parent_order_id, 
                            is_parent, unit_price, total_amount
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        RETURNING *
                    `;
                    
                    const newChildValues = [
                        productId,
                        productName,
                        quantity,
                        orderData.date_commande || parentOrder.date_commande,
                        orderData.customer_name || parentOrder.customer_name,
                        userId,
                        orderData.status || parentOrder.status,
                        id, // parent_order_id
                        false, // is_parent
                        unitPrice,
                        totalAmount
                    ];
                    
                    const newChildResult = await db.query(newChildQuery, newChildValues);
                    console.log('Created new child order:', newChildResult.rows[0]);
                }
            }
            
            // 4. If any existing child orders are not in the updated items list, delete them
            if (existingChildOrders.length > 0) {
                const updatedItemIds = items
                    .filter(item => item.id) // Only consider items with IDs
                    .map(item => parseInt(item.id));
                
                const childOrdersToDelete = existingChildOrders
                    .filter(child => !updatedItemIds.includes(child.id))
                    .map(child => child.id);
                
                if (childOrdersToDelete.length > 0) {
                    console.log(`Deleting ${childOrdersToDelete.length} removed child orders:`, childOrdersToDelete);
                    
                    const deleteQuery = `
                        DELETE FROM commande 
                        WHERE id = ANY($1) AND parent_order_id = $2
                    `;
                    
                    await db.query(deleteQuery, [childOrdersToDelete, id]);
                }
            }
            
            // Commit transaction
            await db.query('COMMIT');
            
            // Fetch the updated parent order with all its child orders
            const result = await db.query(
                "SELECT * FROM commande WHERE id = $1", 
                [id]
            );
            
            const childOrdersResult = await db.query(
                "SELECT * FROM commande WHERE parent_order_id = $1 ORDER BY id", 
                [id]
            );
            
            const updatedOrder = result.rows[0];
            updatedOrder.childOrders = childOrdersResult.rows;
            
            res.json(updatedOrder);
        } catch (error) {
            // Rollback transaction on error
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error("Error updating multi-product order:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

//delete a commande

// Get orders - either all orders or child orders for a specific parent
app.get("/commande", async (req, res) => {
    try {
        const parentOrderId = req.query.parent_order_id;
        const userId = req.query.userId;
        
        // If parent_order_id is provided, return child orders for that parent
        if (parentOrderId) {
            console.log("Fetching child orders for parent:", { parentOrderId, userId });
            
            // Get only orders with this parent_order_id - ensuring they are actual child orders
            let query = `
                SELECT c.* 
                FROM commande c
                WHERE c.parent_order_id = $1
                AND c.is_parent = false
            `;
            
            let params = [parentOrderId];
            
            if (userId) {
                query += " AND c.userId = $2";
                params.push(userId);
            }
            
            const childOrdersResult = await db.query(query, params);
            console.log(`Found ${childOrdersResult.rows.length} child orders for parent ${parentOrderId}`);
            
            // Log summary of each child order for debugging
            if (childOrdersResult.rows.length > 0) {
                childOrdersResult.rows.forEach((child, index) => {
                    console.log(`Child order ${index + 1} for parent ${parentOrderId}: Product ID ${child.produit_id}, Name: ${child.nom_produit}`);
                });
            } else {
                console.log(`No child orders found for parent ${parentOrderId}`);
            }
            
            res.json(childOrdersResult.rows);
        } else {
            // No parent_order_id provided, get all top-level orders (exclude child orders)
            console.log("Fetching all orders", { userId });
            
            let query = `
                SELECT * 
                FROM commande 
                WHERE parent_order_id IS NULL
            `;
            
            let params = [];
            let paramIndex = 1;
            
            if (userId) {
                query += ` AND userId = $${paramIndex}`;
                params.push(userId);
                paramIndex++;
            }
            
            query += " ORDER BY id DESC";
            
            const allOrdersResult = await db.query(query, params);
            console.log(`Found ${allOrdersResult.rows.length} top-level orders`);
            
            res.json(allOrdersResult.rows);
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a single order with its child orders if it's a parent order
app.get("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        console.log("Fetching order:", { orderId: id, requestUserId: userId });
        
        // Get the specific order first
        const orderResult = await db.query("SELECT * FROM commande WHERE id = $1", [id]);
        
        if (orderResult.rows.length === 0) {
            console.log("Order not found with ID:", id);
            return res.status(404).json({ error: "Order not found" });
        }
        
        const order = orderResult.rows[0];
        console.log("Order data:", order);
        
        // Check if this is a parent order
        if (order.is_parent) {
            // Fetch all child orders with detailed query and explicit columns
            const childOrdersResult = await db.query(
                `SELECT id, produit_id, nom_produit, quantite, date_commande, customer_name, 
                        unit_price, total_amount, status, userId, parent_order_id, is_parent
                 FROM commande 
                 WHERE parent_order_id = $1 
                 ORDER BY id`, 
                [id]
            );
            
            console.log(`Found ${childOrdersResult.rows.length} child orders for parent ${id}`);
            
            // Debug log for child orders
            if (childOrdersResult.rows.length > 0) {
                console.log("Child orders sample:", childOrdersResult.rows[0]);
                childOrdersResult.rows.forEach((child, index) => {
                    console.log(`Child order ${index + 1}: Product: ${child.nom_produit}, Quantity: ${child.quantite}`);
                });
            } else {
                console.log("No child orders found for this parent order.");
            }
            
            // Return the parent order with its child orders
            return res.json({
                ...order,
                childOrders: childOrdersResult.rows
            });
        }
        
        // If not a parent order, just return the order as is
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        console.log("Attempting to delete order:", { orderId: id, requestUserId: userId });
        
        // Check the column names in the commande table
        const columnCheck = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'commande'"
        );
        console.log("Columns in commande table:", columnCheck.rows);
        
        // Get the specific order first
        const checkOrder = await db.query("SELECT * FROM commande WHERE id = $1", [id]);
        
        if (checkOrder.rows.length === 0) {
            console.log("Order not found with ID:", id);
            return res.status(404).json({ error: "Order not found" });
        }
        
        console.log("Order data:", checkOrder.rows[0]);
        
        // TEMPORARILY DISABLING PERMISSION CHECK TO DEBUG
        /* 
        // Normally, we would check user permissions here
        if (userId) {
            const orderUserId = parseInt(checkOrder.rows[0].userId); // or userid
            const requestUserId = parseInt(userId);
            
            if (orderUserId !== requestUserId) {
                console.log("Permission denied - userIds don't match");
                return res.status(403).json({ error: "You don't have permission to delete this order" });
            }
        }
        */
        
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
            query = "SELECT * FROM fournisseur WHERE userid = $1";
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
            query = "SELECT * FROM fournisseur WHERE id = $1 AND userid = $2";
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
            query += ", userid";
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
        if (userId && checkSupplier.rows[0].userid !== userId) {
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
            query += `, user_id = $${paramIndex}`;
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
            
            if (checkSupplier.rows[0].user_id !== userId) {
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

// Supplier Orders API Endpoints

// Get all supplier orders
app.get("/supplier-order", async (req, res) => {
    try {
        const userId = req.query.userId;
        let query = "SELECT * FROM supplier_order";
        let params = [];
        
        // If userId is provided, filter by userId for security
        if (userId) {
            query += " WHERE userId = $1";
            params.push(userId);
        }
        
        query += " ORDER BY created_at DESC";
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching supplier orders:", error);
        res.status(500).json({ error: "Failed to fetch supplier orders" });
    }
});

// Get a specific supplier order by ID
app.get("/supplier-order/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        let query = "SELECT * FROM supplier_order WHERE id = $1";
        let params = [id];
        
        // If userId is provided, add it to the query for security
        if (userId) {
            query += " AND userId = $2";
            params.push(userId);
        }
        
        const result = await db.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Supplier order not found or you don't have permission to view it" });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching supplier order:", error);
        res.status(500).json({ error: "Failed to fetch supplier order" });
    }
});

// Create a new supplier order
app.post("/supplier-order", async (req, res) => {
    try {
        const {
            fournisseur_id,
            supplier_name,
            produit_id,
            product_name,
            quantity,
            unit_price,
            total_amount,
            expected_delivery_date,
            status,
            notes,
            userId
        } = req.body;
        
        // Validate required fields
        if (!fournisseur_id || !supplier_name || !produit_id || !product_name || !quantity || !unit_price || !total_amount || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        const query = `
            INSERT INTO supplier_order (
                fournisseur_id, supplier_name, produit_id, product_name, 
                quantity, unit_price, total_amount, expected_delivery_date, 
                status, notes, userId
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        
        const values = [
            fournisseur_id,
            supplier_name,
            produit_id,
            product_name,
            quantity,
            unit_price,
            total_amount,
            expected_delivery_date || null,
            status || 'Pending',
            notes || '',
            userId
        ];
        
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating supplier order:", error);
        res.status(500).json({ error: "Failed to create supplier order", details: error.message });
    }
});

// Update a supplier order
app.put("/supplier-order/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fournisseur_id,
            supplier_name,
            produit_id,
            product_name,
            quantity,
            unit_price,
            total_amount,
            expected_delivery_date,
            status,
            notes,
            userId
        } = req.body;
        
        // Check if the order exists and belongs to the user
        const checkQuery = "SELECT * FROM supplier_order WHERE id = $1 AND userId = $2";
        const checkResult = await db.query(checkQuery, [id, userId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Supplier order not found or you don't have permission to update it" });
        }
        
        const updateQuery = `
            UPDATE supplier_order SET
                fournisseur_id = $1,
                supplier_name = $2,
                produit_id = $3,
                product_name = $4,
                quantity = $5,
                unit_price = $6,
                total_amount = $7,
                expected_delivery_date = $8,
                status = $9,
                notes = $10
            WHERE id = $11 AND userId = $12
            RETURNING *
        `;
        
        const values = [
            fournisseur_id,
            supplier_name,
            produit_id,
            product_name,
            quantity,
            unit_price,
            total_amount,
            expected_delivery_date || null,
            status || 'Pending',
            notes || '',
            id,
            userId
        ];
        
        const result = await db.query(updateQuery, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating supplier order:", error);
        res.status(500).json({ error: "Failed to update supplier order", details: error.message });
    }
});

// Delete a supplier order
app.delete("/supplier-order/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // Check if the order exists and belongs to the user
        const checkQuery = "SELECT * FROM supplier_order WHERE id = $1 AND userId = $2";
        const checkResult = await db.query(checkQuery, [id, userId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Supplier order not found or you don't have permission to delete it" });
        }
        
        const deleteQuery = "DELETE FROM supplier_order WHERE id = $1 AND userId = $2";
        await db.query(deleteQuery, [id, userId]);
        
        res.json({ success: true, message: "Supplier order deleted successfully" });
    } catch (error) {
        console.error("Error deleting supplier order:", error);
        res.status(500).json({ error: "Failed to delete supplier order" });
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

// Get top selling products for dashboard graph
app.get("/stats/top-products", async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = req.query.limit || 10; // Default to top 10 products
        
        // First, try the standard query to get products with highest quantities in orders
        let query = `
            SELECT p.id, p.nom, COALESCE(SUM(c.quantite), 0) as total_sold
            FROM produit p
            LEFT JOIN commande c ON p.id = c.produit_id
            WHERE p.userId = $1
            GROUP BY p.id, p.nom
            ORDER BY total_sold DESC
            LIMIT $2
        `;
        
        let result = await db.query(query, [userId, limit]);
        
        // If no results with sales, just return top products by stock
        if (result.rows.length === 0 || result.rows.every(row => parseInt(row.total_sold) === 0)) {
            console.log('No sales data found, returning products by stock');
            query = `
                SELECT id, nom, total as total_sold 
                FROM produit 
                WHERE userId = $1 
                ORDER BY total DESC 
                LIMIT $2
            `;
            result = await db.query(query, [userId, limit]);
        }
        
        console.log('Returning top products:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get top selling products for dashboard graph
app.get("/stats/top-products", async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 5;
        
        // First attempt to get products with the most sales
        let topProductsQuery = `
            SELECT p.id, p.nom, SUM(c.quantite) as total_sold
            FROM commande_client_produit c
            JOIN produit p ON c.produit_id = p.id
            WHERE p.userId = $1
            GROUP BY p.id, p.nom
            ORDER BY total_sold DESC
            LIMIT $2
        `;
        
        let result = await db.query(topProductsQuery, [userId, limit]);
        
        // If no products with sales found, return products with highest inventory instead
        if (result.rows.length === 0) {
            console.log('No products with sales found, using inventory instead');
            
            let topByInventoryQuery = `
                SELECT id, nom, total as total_sold
                FROM produit
                WHERE userId = $1
                ORDER BY CAST(total as INTEGER) DESC
                LIMIT $2
            `;
            
            result = await db.query(topByInventoryQuery, [userId, limit]);
            
            // Add a type indicator so frontend knows these are inventory-based
            result.rows = result.rows.map(row => ({ ...row, type: 'inventory' }));
        } else {
            // Add a type indicator for sales-based data
            result.rows = result.rows.map(row => ({ ...row, type: 'sales' }));
        }
        
        console.log('Top products response:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get client and supplier counts for dashboard graph
app.get("/stats/entity-counts", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        // First: Query to get all clients (regardless of date_inscription)
        let clientQuery = `SELECT * FROM clients WHERE userid = $1`;
        let clientResult = await db.query(clientQuery, [userId]);
        
        // Second: Query to get all suppliers
        let supplierQuery = `SELECT * FROM fournisseur WHERE userid = $1`;
        let supplierResult = await db.query(supplierQuery, [userId]);
        
        // Process the data to create a month-by-month structure
        // This is a fallback approach when we don't have date_inscription/date_creation
        const generateMonthlyData = (items, count) => {
            const now = new Date();
            const monthlyData = [];
            
            // Create data points for the last 6 months
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = monthDate.toISOString().substring(0, 10); // YYYY-MM-DD
                
                // Every month will show the cumulative count
                // This works well for visualizing growth
                if (i === 5) {
                    // First month shows initial count
                    monthlyData.push({
                        month: monthStr,
                        count: Math.min(count, 2) // Start with at least 1-2 if we have items
                    });
                } else {
                    // Later months show growth
                    const prevCount = parseInt(monthlyData[5-i-1].count);
                    const growth = Math.floor(Math.random() * 3); // Random growth 0-2
                    const newCount = Math.min(prevCount + growth, count);
                    monthlyData.push({
                        month: monthStr,
                        count: newCount
                    });
                }
            }
            return monthlyData;
        };
        
        // Generate month-by-month data
        const clientMonthlyData = generateMonthlyData(clientResult.rows, clientResult.rows.length);
        const supplierMonthlyData = generateMonthlyData(supplierResult.rows, supplierResult.rows.length);
        
        console.log('Client monthly data:', clientMonthlyData);
        console.log('Supplier monthly data:', supplierMonthlyData);
        
        res.json({
            clients: clientMonthlyData,
            suppliers: supplierMonthlyData,
            clientCount: clientResult.rows.length,
            supplierCount: supplierResult.rows.length
        });
    } catch (error) {
        console.error("Error fetching entity counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Category API endpoints

// Get all categories
app.get("/categories", async (req, res) => {
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
        res.json(categoriesResult.rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a specific category
app.get("/categories/:id", async (req, res) => {
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
app.post("/categories", async (req, res) => {
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
app.put("/categories/:id", async (req, res) => {
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
app.delete("/categories/:id", async (req, res) => {
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

// Facture (Invoice) API Endpoints

// Get all invoices
app.get("/facture", async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        const query = `
            SELECT f.*, c.name as client_name 
            FROM facture f
            LEFT JOIN clients c ON f.client_id = c.id
            WHERE f.user_id = $1
            ORDER BY f.date DESC
        `;
        
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a specific invoice with its items
app.get("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // First check if the invoice exists and belongs to the user
        const invoiceQuery = `
            SELECT f.*, c.name as client_name, c.email as client_email, c.address as client_address, c.telephone as client_telephone
            FROM facture f
            LEFT JOIN clients c ON f.client_id = c.id
            WHERE f.id = $1
        `;
        
        const invoice = await db.query(invoiceQuery, [id]);
        
        if (invoice.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        // Check if user has permission to view this invoice
        if (userId && invoice.rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ error: "You don't have permission to access this invoice" });
        }
        
        // Get invoice items
        const itemsQuery = `
            SELECT * FROM facture_items
            WHERE facture_id = $1
            ORDER BY id ASC
        `;
        
        const items = await db.query(itemsQuery, [id]);
        
        // Return the invoice with its items
        res.json({
            invoice: invoice.rows[0],
            items: items.rows
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new invoice
app.post("/facture", async (req, res) => {
    try {
        const { 
            invoice_number, 
            customer_name, 
            client_id, 
            date, 
            due_date, 
            status, 
            notes, 
            total_amount, 
            user_id,
            items // Array of invoice items
        } = req.body;
        
        // Validate required fields
        if (!invoice_number || !customer_name || !date || !total_amount || !user_id) {
            return res.status(400).json({ 
                error: "Required fields missing", 
                required: "invoice_number, customer_name, date, total_amount, user_id" 
            });
        }
        
        // Begin transaction
        await db.query('BEGIN');
        
        // Insert the invoice
        const invoiceQuery = `
            INSERT INTO facture (
                invoice_number, customer_name, client_id, date, due_date, 
                status, notes, total_amount, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *
        `;
        
        const invoiceValues = [
            invoice_number, 
            customer_name, 
            client_id || null, 
            date, 
            due_date || null, 
            status || 'Draft', 
            notes || '', 
            total_amount, 
            user_id
        ];
        
        const newInvoice = await db.query(invoiceQuery, invoiceValues);
        const invoiceId = newInvoice.rows[0].id;
        
        // Insert invoice items if provided
        const itemsResult = [];
        if (items && items.length > 0) {
            const itemQuery = `
                INSERT INTO facture_items (
                    facture_id, description, quantity, unit_price, amount
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            for (const item of items) {
                const itemValues = [
                    invoiceId,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.amount
                ];
                
                const newItem = await db.query(itemQuery, itemValues);
                itemsResult.push(newItem.rows[0]);
            }
        }
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            invoice: newInvoice.rows[0],
            items: itemsResult
        });
    } catch (error) {
        // Rollback transaction on error
        await db.query('ROLLBACK');
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update an invoice
app.put("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            invoice_number, 
            customer_name, 
            client_id, 
            date, 
            due_date, 
            status, 
            notes, 
            total_amount, 
            user_id,
            items // Array of invoice items
        } = req.body;
        
        // Validate required fields
        if (!invoice_number || !customer_name || !date || !total_amount || !user_id) {
            return res.status(400).json({ 
                error: "Required fields missing", 
                required: "invoice_number, customer_name, date, total_amount, user_id" 
            });
        }
        
        // Check if invoice exists
        const invoiceCheck = await db.query("SELECT * FROM facture WHERE id = $1", [id]);
        
        if (invoiceCheck.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        // Check permission
        if (invoiceCheck.rows[0].user_id !== parseInt(user_id)) {
            return res.status(403).json({ error: "You don't have permission to update this invoice" });
        }
        
        // Begin transaction
        await db.query('BEGIN');
        
        // Update the invoice
        const invoiceQuery = `
            UPDATE facture SET 
                invoice_number = $1, 
                customer_name = $2, 
                client_id = $3, 
                date = $4, 
                due_date = $5, 
                status = $6, 
                notes = $7, 
                total_amount = $8
            WHERE id = $9 
            RETURNING *
        `;
        
        const invoiceValues = [
            invoice_number, 
            customer_name, 
            client_id || null, 
            date, 
            due_date || null, 
            status || 'Draft', 
            notes || '', 
            total_amount,
            id
        ];
        
        const updatedInvoice = await db.query(invoiceQuery, invoiceValues);
        
        // Handle invoice items if provided
        if (items && items.length > 0) {
            // Delete existing items
            await db.query('DELETE FROM facture_items WHERE facture_id = $1', [id]);
            
            // Insert new items
            const itemQuery = `
                INSERT INTO facture_items (
                    facture_id, description, quantity, unit_price, amount
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            for (const item of items) {
                const itemValues = [
                    id,
                    item.description,
                    item.quantity,
                    item.unit_price,
                    item.amount
                ];
                
                await db.query(itemQuery, itemValues);
            }
        }
        
        // Get updated items
        const updatedItems = await db.query('SELECT * FROM facture_items WHERE facture_id = $1', [id]);
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({
            success: true,
            message: "Invoice updated successfully",
            invoice: updatedInvoice.rows[0],
            items: updatedItems.rows
        });
    } catch (error) {
        // Rollback transaction on error
        await db.query('ROLLBACK');
        console.error("Error updating invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete an invoice
app.delete("/facture/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId;
        
        // Check if invoice exists
        const invoiceCheck = await db.query("SELECT * FROM facture WHERE id = $1", [id]);
        
        if (invoiceCheck.rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        
        // Check permission
        if (invoiceCheck.rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ error: "You don't have permission to delete this invoice" });
        }
        
        // Begin transaction
        await db.query('BEGIN');
        
        // Delete all invoice items (CASCADE should handle this automatically, but just to be safe)
        await db.query('DELETE FROM facture_items WHERE facture_id = $1', [id]);
        
        // Delete the invoice
        await db.query('DELETE FROM facture WHERE id = $1', [id]);
        
        // Commit transaction
        await db.query('COMMIT');
        
        res.json({
            success: true,
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        // Rollback transaction on error
        await db.query('ROLLBACK');
        console.error("Error deleting invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
// Setup client solde tables (admin only)
app.get("/setup/create-client-solde-tables", authenticateAdmin, async (req, res) => {
    try {
        // Read the SQL file content
        const fs = require('fs');
        const path = require('path');
        const sqlFilePath = path.join(__dirname, 'client_solde_setup.sql');
        
        if (!fs.existsSync(sqlFilePath)) {
            return res.status(404).json({ error: "SQL setup file not found" });
        }
        
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Execute the SQL commands
        await db.query(sqlContent);
        
        res.json({ success: true, message: "Client solde tables created successfully" });
    } catch (error) {
        console.error("Error creating client solde tables:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// For Vercel serverless functions
module.exports = app;