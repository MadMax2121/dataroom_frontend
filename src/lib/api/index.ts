// Export legacy client - to be removed in future updates
export { axiosClient } from './apiClient';

// Export the NextAuth API services
export { 
  userApi, 
  documentApi, 
  folderApi,
  // Utilities
  constructUrl
} from './nextAuthApi';

// Export types
export type { 
  Document,
  Folder,
  User,
  LoginRequest,
  RegisterRequest,
  PaginatedResponse
} from './nextAuthApi';

// Export the client for advanced usage scenarios
export { default as api } from './nextAuthClient';

// NOTE: When using these API functions, they return processed data objects.
// Example:
// const userData = await userApi.getCurrent();
// console.log(userData);