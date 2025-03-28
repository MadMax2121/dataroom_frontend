import axios from 'axios';

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
  (config) => {
    // Log the request
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      headers: config.headers,
      data: config.data
    });
    
    // Get token from local storage before sending the request
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear authentication data
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      
      // Redirect to login page if needed
      // You can implement redirect logic here
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 