// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative paths for production (same domain)
  : 'http://localhost:5001/api';   // Use local server for development

export { API_BASE_URL };
