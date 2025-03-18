const pg = require("pg");
require('dotenv').config();

// Create a new client instance
const db = new pg.Client({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT
});

async function addStatusColumn() {
    try {
        // Connect to the database
        await db.connect();
        console.log("Connected to database");
        
        // Check if the status column already exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'commande' AND column_name = 'status'
        `;
        const columnCheck = await db.query(checkColumnQuery);
        
        if (columnCheck.rows.length === 0) {
            // Column doesn't exist, add it
            console.log("Status column does not exist. Adding it now...");
            const addColumnQuery = `
                ALTER TABLE commande 
                ADD COLUMN status VARCHAR(20) DEFAULT 'Pending'
            `;
            await db.query(addColumnQuery);
            console.log("Status column added successfully!");
        } else {
            console.log("Status column already exists!");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Close the connection
        await db.end();
        console.log("Database connection closed");
    }
}

// Run the function
addStatusColumn();
