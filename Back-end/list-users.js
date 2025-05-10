const pg = require("pg");
require('dotenv').config();

// Create a database connection
const pool = new pg.Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Function to list all users
async function listUsers() {
    try {
        const query = "SELECT id, name, last_name, email, role FROM users";
        const result = await pool.query(query);
        
        if (result.rows.length === 0) {
            console.log("No users found in the database.");
            return [];
        }
        
        console.log("Users in the database:");
        result.rows.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.name} ${user.last_name}, Email: ${user.email}, Role: ${user.role || 'user'}`);
        });
        
        return result.rows;
    } catch (error) {
        console.error("Error listing users:", error);
        return [];
    } finally {
        await pool.end();
    }
}

// List all users
listUsers()
    .then(() => {
        console.log("Script completed");
        process.exit(0);
    })
    .catch(err => {
        console.error("Script failed:", err);
        process.exit(1);
    });
