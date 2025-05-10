// This file serves as the main entry point for the application

try {
  // Set environment for production
  process.env.NODE_ENV = 'production';
  
  // Log environment variables (without sensitive info)
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_HOST: process.env.DATABASE_HOST ? '✓ Set' : '✗ Missing',
    DATABASE_NAME: process.env.DATABASE_NAME ? '✓ Set' : '✗ Missing',
    USER_NAME: process.env.USER_NAME ? '✓ Set' : '✗ Missing',
    DATABASE_PORT: process.env.DATABASE_PORT,
    PORT: process.env.PORT
  });
  
  // Import the server file
  require('./Back-end/Server.js');
  
  console.log('Server started successfully');
} catch (error) {
  console.error('Failed to start server:', error);
}
