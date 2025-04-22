import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create a custom axios instance
const apiClient = axios.create({
  // The backend is in a separate folder outside of the frontend project
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Log the request
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      headers: config.headers,
      data: config.data
    });
    
    // Get token from NextAuth session
    const session = await getSession();
    
    // If token exists, add it to the headers
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log the successful response
    console.log('API Response Success:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Log the error
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // No need to clear local storage - let NextAuth handle session management
      
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 