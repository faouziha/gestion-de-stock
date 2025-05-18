// db.js - Shared database connection pool for the stock management system
// This centralises Postgres connection handling so all route modules can reuse the same pool.

const pg = require('pg');
require('dotenv').config(); // Ensure .env variables are loaded

// Create a connection pool. Adjust pool settings as needed.
const pool = new pg.Pool({
  user: process.env.USER_NAME,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.USER_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  max: 20,
});

// Optional helper that mirrors pool.query for convenience
const query = (text, params) => pool.query(text, params);

// Simple startup check
pool
  .connect()
  .then((client) => {
    console.log('PostgreSQL pool connected');
    client.release();
  })
  .catch((err) => {
    console.error('PostgreSQL connection error:', err.message);
  });

module.exports = { pool, query };
