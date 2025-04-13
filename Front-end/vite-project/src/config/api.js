// API configuration file
// This file centralizes all API URL configurations and automatically
// switches between development and production URLs

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://gestion-de-stock-kappa.vercel.app' // Production URL
  : 'http://localhost:3000';                     // Development URL

// Export the base URL and specific endpoint URLs
export const API_URLS = {
  base: API_BASE_URL,
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/register`,
  users: `${API_BASE_URL}/users`,
  products: `${API_BASE_URL}/produit`,
  orders: `${API_BASE_URL}/commande`,
  suppliers: `${API_BASE_URL}/fournisseur`,
  clients: `${API_BASE_URL}/clients`,
  invoices: `${API_BASE_URL}/facture`,
};

export default API_URLS;
