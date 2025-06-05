const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('Starting database reset...');
        
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, 'reset_database.sql');
        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Execute the SQL commands
        await client.query('BEGIN');
        await client.query(sqlCommands);
        await client.query('COMMIT');
        
        console.log('Database reset completed successfully!');
        console.log('All tables except users have been reset.');
        console.log('Your existing user accounts are preserved.');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error resetting database:', error);
    } finally {
        client.release();
        pool.end();
    }
}

resetDatabase();
