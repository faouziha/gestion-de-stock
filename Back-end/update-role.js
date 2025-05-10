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

// Function to update user role
async function updateUserRole(email, newRole) {
    try {
        // Update the user's role
        const updateRoleQuery = `
            UPDATE users
            SET role = $1
            WHERE email = $2
            RETURNING id, name, last_name, email, role
        `;
        
        const result = await pool.query(updateRoleQuery, [newRole, email]);
        
        if (result.rows.length === 0) {
            console.error("User not found with email:", email);
            return null;
        }
        
        console.log("User role updated successfully:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error updating user role:", error);
        return null;
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Get email from command line arguments
const email = process.argv[2];
const role = process.argv[3] || 'admin';

if (!email) {
    console.error("Please provide an email address as an argument");
    console.log("Usage: node update-role.js <email> [role]");
    process.exit(1);
}

// Update the user role
updateUserRole(email, role)
    .then(() => {
        console.log("Script completed");
        process.exit(0);
    })
    .catch(err => {
        console.error("Script failed:", err);
        process.exit(1);
    });
