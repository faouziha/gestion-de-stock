// This file serves as the entry point for Vercel deployment
// It simply imports and re-exports the main Server.js file

// Import the main server file
const app = require('./Server');

// Export the Express app for Vercel
module.exports = app;
