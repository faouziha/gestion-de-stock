const express = require("express");
const cors = require("cors");
const pg = require("pg");

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "PFE",
    password: "postgres321",
    port: 5433
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

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
