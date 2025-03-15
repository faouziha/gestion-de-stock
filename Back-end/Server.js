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
const Port = 3000;

app.use(express.json());
app.use(cors());


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

app.post("/produit",async (req, res) => {
    try {
        const {nom, description, image, total, serial_num, fournisseur_id, prix, user_id} = req.body;
        const newProduct = await db.query(
            "INSERT INTO produit (nom, description, image, total, serial_num, fournisseur_id, prix, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [nom, description, image, total, serial_num, fournisseur_id, prix, user_id]
        );
        res.status(201).json({
            message: "Product created successfully",
            produit: newProduct.rows[0]
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//update a product

app.put("/produit/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {nom, description, image, total, serial_num, fournisseur_id, prix, user_id} = req.body;
        
        // First check if the product belongs to the user
        const productCheck = await db.query("SELECT * FROM produit WHERE id = $1", [id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        if (user_id && productCheck.rows[0].user_id !== user_id) {
            return res.status(403).json({ error: "You don't have permission to update this product" });
        }
        
        const updatedProduct = await db.query(
            "UPDATE produit SET nom = $2, description = $3, image = $4, total = $5, serial_num = $6, fournisseur_id = $7, prix = $8, user_id = $9 WHERE id = $1 RETURNING *",
            [id, nom, description, image, total, serial_num, fournisseur_id, prix, user_id || productCheck.rows[0].user_id]
        );
        res.json(updatedProduct.rows[0]);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
        const allCommande = "SELECT * FROM commande"
        db.query(allCommande, (err, result) => {
            res.json(result.rows);
        })
    } catch (error) {
        console.error("Error getting commandes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//get a commande

app.get("/commande/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const aCommande = await db.query("SELECT * FROM commande WHERE id = $1", [id])
        res.json(aCommande.rows[0]);
    } catch (error) {
        console.error("Error getting commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//post commande

app.post("/commande", async (req, res) => {
    try {
        const { produit_id, nom_produit, quantite} = req.body;
        const newCommande = await db.query(
            "INSERT INTO commande (produit_id, nom_produit, quantite) VALUES ($1, $2, $3) RETURNING *",
            [produit_id, nom_produit, quantite]
        );
        res.status(201).json({
            message: "Commande created successfully",
            commande: newCommande.rows[0]
        });
    } catch (error) {
        console.error("Error creating commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//update a commande

app.put("/commande/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {produit_id, nom_produit, quantite} = req.body;
        const updatedCommande = await db.query(
            "UPDATE commande SET produit_id = $2, nom_produit = $3, quantite = $4 WHERE id = $1 RETURNING *",
            [id, produit_id, nom_produit, quantite]
        );
        res.json(updatedCommande.rows[0]);
    } catch (error) {
        console.error("Error updating commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

//delete a commande

app.delete("/commande/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deletedCommande = await db.query("DELETE FROM commande WHERE id = $1 RETURNING *", [id]);
        res.json(deletedCommande.rows[0]);
    } catch (error) {
        console.error("Error deleting commande:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
