// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://gen-connect-production.up.railway.app/api'  // Your Railway backend
  : 'http://localhost:5001/api';   // Local development

export { API_BASE_URL };
