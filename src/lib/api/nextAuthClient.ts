import axios from 'axios';
import { getAuthToken, handleAuthError } from '../auth';

// Create a NextAuth-compatible axios instance
const nextAuthClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor to add the auth token
nextAuthClient.interceptors.request.use(
  async (config) => {
    try {
      // Skip token for login/register endpoints
      const isAuthEndpoint = 
        config.url?.includes('/users/login') || 
        config.url?.includes('/users/register') ||
        config.url?.includes('/users/oauth');
        
      if (!isAuthEndpoint) {
        // Get the token from NextAuth session
        const token = await getAuthToken();
        
        // If token exists, add it to the headers
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(`Request to ${config.url} proceeding without auth token`);
        }
      }
    } catch (error) {
      console.error('Error getting auth token for request:', error);
      // Don't reject the request if we can't get the token
      // It will proceed without authentication
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
nextAuthClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors (will redirect to login if needed)
    handleAuthError(error);
    return Promise.reject(error);
  }
);

export default nextAuthClient; 