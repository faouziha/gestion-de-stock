const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCreatedAtToProduit() {
    const client = await pool.connect();
    try {
        // Start transaction
        await client.query('BEGIN');

        // Check if created_at column exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'produit' AND column_name = 'created_at'
        `;
        const columnCheck = await client.query(checkColumnQuery);
        
        if (columnCheck.rows.length === 0) {
            console.log('Adding created_at column to produit table...');
            
            // Add created_at column with default value of current timestamp
            const addColumnQuery = `
                ALTER TABLE produit 
                ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            `;
            await client.query(addColumnQuery);
            
            console.log('Column created_at added successfully!');
        } else {
            console.log('Column created_at already exists in produit table');
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (error) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Error during migration:', error);
        throw error;
    } finally {
        client.release();
        // Close the pool
        await pool.end();
    }
}

// Run the migration
addCreatedAtToProduit().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});
