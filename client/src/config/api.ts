// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Vercel will handle API routes
  : 'http://localhost:5001/api';   // Local development

export { API_BASE_URL };
