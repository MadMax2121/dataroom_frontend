// Export all API functions directly
export * from './apiClient';

// Export the client for advanced usage scenarios
export { default as axiosClient } from './apiClient';

// NOTE: When using these functions, remember that they return the axios response directly.
// You'll need to access the data property to get the actual response data:
// Example:
// const response = await login(data);
// const userData = response.data;