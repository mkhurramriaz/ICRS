import axios from 'axios';

// Create Axios client pointing to the Node.js backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Authorization headers automatically if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (token expired or invalid), clear credentials
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Force redirect to login page if currently on a protected route
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
