// Centralized configuration file

const API_BASE_URL = import.meta.env.PROD 
  ? '/api'                      // Production URL - relative path for any hosting platform
  : 'http://localhost:3000';    // Development URL

// Configuration object
const config = {
  API_URL: API_BASE_URL,
};

export default config;
