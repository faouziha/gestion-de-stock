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

// Function to check if role column exists and add it if needed
async function addRoleColumnIfNeeded() {
    try {
        // Check if the role column already exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'role'
        `;
        const columnCheck = await pool.query(checkColumnQuery);
        
        if (columnCheck.rows.length === 0) {
            console.log("Role column doesn't exist. Adding it...");
            
            // Add the role column
            const addColumnQuery = `
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(20) DEFAULT 'user'
            `;
            await pool.query(addColumnQuery);
            console.log("Role column added successfully!");
        } else {
            console.log("Role column already exists.");
        }
        
        return true;
    } catch (error) {
        console.error("Error checking/adding role column:", error);
        return false;
    }
}

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
    }
}

// Get email from command line arguments
const email = process.argv[2];
const role = process.argv[3] || 'admin';

if (!email) {
    console.error("Please provide an email address as an argument");
    console.log("Usage: node add-role-column.js <email> [role]");
    process.exit(1);
}

// First add the role column if needed, then update the user role
addRoleColumnIfNeeded()
    .then(success => {
        if (success) {
            return updateUserRole(email, role);
        } else {
            throw new Error("Failed to add role column");
        }
    })
    .then(() => {
        console.log("Script completed");
        pool.end();
        process.exit(0);
    })
    .catch(err => {
        console.error("Script failed:", err);
        pool.end();
        process.exit(1);
    });
