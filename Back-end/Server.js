const express = require("express");
const cors = require("cors");
const pg = require("pg");
require('dotenv').config();

const db = new pg.Client({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT
});

db.connect();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' })); // Increase payload limit for Base64 images
app.use(cors());

// Serve static files from the uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.json("Hello World!");
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

//fournisseur
// get fournisseur

app.get("/fournisseur", (req, res) => {
    try {
        const allFournisseur = "SELECT * FROM fournisseur"
        db.query(allFournisseur, (err, result) => {
            res.json(result.rows);
        })
    } catch (error) {
        console.error("Error getting fournisseurs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//get a fournisseur

app.get("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const aFournisseur = await db.query("SELECT * FROM fournisseur WHERE id = $1", [id])
        res.json(aFournisseur.rows[0]);
    } catch (error) {
        console.error("Error getting fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//post fournisseur

app.post("/fournisseur", async (req, res) => {
    try {
        const {nom_entreprise, num_registre, email, tel} = req.body;
        const newFournisseur = await db.query(
            "INSERT INTO fournisseur (nom_entreprise, num_registre, email, tel) VALUES ($1, $2, $3, $4) RETURNING *",
            [nom_entreprise, num_registre, email, tel]
        );
        res.status(201).json({
            message: "Fournisseur created successfully",
            fournisseur: newFournisseur.rows[0]
        });
    } catch (error) {
        console.error("Error creating fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//update a fournisseur

app.put("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {nom_entreprise, num_registre, email, tel} = req.body;
        const updatedFournisseur = await db.query(
            "UPDATE fournisseur SET nom_entreprise = $2, num_registre = $3, email = $4, tel = $5 WHERE id = $1 RETURNING *",
            [id, nom_entreprise, num_registre, email, tel]
        );
        res.json(updatedFournisseur.rows[0]);
    } catch (error) {
        console.error("Error updating fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//delete a fournisseur

app.delete("/fournisseur/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deletedFournisseur = await db.query("DELETE FROM fournisseur WHERE id = $1 RETURNING *", [id]);
        res.json(deletedFournisseur.rows[0]);
    } catch (error) {
        console.error("Error deleting fournisseur:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//commande
//get commande

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
        const userId = req.query.userId;
        
        let query = "SELECT * FROM commande WHERE id = $1";
        let params = [id];
        
        // If userId is provided, ensure the order belongs to that user
        if (userId) {
            query = "SELECT * FROM commande WHERE id = $1 AND userId = $2";
            params = [id, userId];
        }
        
        const aCommande = await db.query(query, params);
        
        if (aCommande.rows.length === 0) {
            return res.status(404).json({ error: "Order not found or you don't have permission to view it" });
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
        const { produit_id, nom_produit, quantite, date_commande, userId, customer_name } = req.body;
        
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
        
        // Complete the query
        query += ") VALUES (" + placeholders + ") RETURNING *";
        
        const newCommande = await db.query(query, values);
        
        res.status(201).json({
            message: "Commande created successfully",
            commande: newCommande.rows[0]
        });
    } catch (error) {
        console.error("Error creating commande:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

//update a commande

app.put("/commande/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { produit_id, nom_produit, quantite, date_commande, customer_name, userId } = req.body;
        
        // First check if the order exists and belongs to the user
        const checkOrder = await db.query("SELECT * FROM commande WHERE id = $1", [id]);
        
        if (checkOrder.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        // If userId is provided, ensure the order belongs to that user
        if (userId && checkOrder.rows[0].userId !== userId) {
            return res.status(403).json({ error: "You don't have permission to update this order" });
        }
        
        // Build the query dynamically based on provided fields
        let query = "UPDATE commande SET produit_id = $1, nom_produit = $2, quantite = $3";
        let values = [produit_id, nom_produit, quantite];
        let paramIndex = 4;
        
        if (date_commande) {
            query += `, date_commande = $${paramIndex}`;
            values.push(date_commande);
            paramIndex++;
        }
        
        if (customer_name) {
            query += `, customer_name = $${paramIndex}`;
            values.push(customer_name);
            paramIndex++;
        }
        
        // Ensure userId is preserved
        if (userId) {
            query += `, userId = $${paramIndex}`;
            values.push(userId);
            paramIndex++;
        }
        
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
