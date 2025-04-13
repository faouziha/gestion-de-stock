const pg = require("pg");
require('dotenv').config();

const db = new pg.Client({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT
});

async function addUserProfileColumns() {
    try {
        await db.connect();
        console.log("Connected to database");

        // Check if phone column exists
        const checkPhoneQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'phone'
        `;
        const phoneCheck = await db.query(checkPhoneQuery);
        
        if (phoneCheck.rows.length === 0) {
            // Column doesn't exist, add it
            const addPhoneQuery = `
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20)
            `;
            await db.query(addPhoneQuery);
            console.log("Phone column added to users table");
        } else {
            console.log("Phone column already exists");
        }

        // Check if address column exists
        const checkAddressQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'address'
        `;
        const addressCheck = await db.query(checkAddressQuery);
        
        if (addressCheck.rows.length === 0) {
            // Column doesn't exist, add it
            const addAddressQuery = `
                ALTER TABLE users 
                ADD COLUMN address TEXT
            `;
            await db.query(addAddressQuery);
            console.log("Address column added to users table");
        } else {
            console.log("Address column already exists");
        }

        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Error during migration:", error);
    } finally {
        await db.end();
        console.log("Database connection closed");
    }
}

// Run the migration
addUserProfileColumns();
