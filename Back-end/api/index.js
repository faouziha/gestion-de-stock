// Create a custom server-compatible handler for Vercel

// This is the app from Server.js
const app = require('../Server');

// Explicitly handle CORS for Vercel serverless functions
module.exports = (req, res) => {
  // Set CORS headers before anything else
  res.setHeader('Access-Control-Allow-Origin', 'https://gestion-de-stock-kohl.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log request for debugging
  console.log(`${req.method} ${req.url}`);
  
  // Make CORS middleware run before any other middleware
  return new Promise((resolve) => {
    // Monkey patch res.end to add CORS headers again in case they were modified
    const originalEnd = res.end;
    res.end = function(...args) {
      // Re-add the CORS headers just before sending the response
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', 'https://gestion-de-stock-kohl.vercel.app');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      originalEnd.apply(res, args);
      resolve();
    };
    
    // Pass request to the Express app
    app(req, res);
  });
};
