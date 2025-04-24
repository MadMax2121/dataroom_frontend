import axios from 'axios';
import { removeEmptyProps } from './helpers';
import { getSession } from 'next-auth/react';

// Create axios instances
export const axiosBackendInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  async (config) => {
    // Get token from NextAuth session
    const session = await getSession();
    
    // If token exists, add it to the headers
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to construct URLs with query parameters
export const constructUrl = (url: string, args: Record<string, any> = {}) => {
  if (Object.keys(args).length === 0) return url;
  
  const obj = removeEmptyProps(args);
  const query: string[] = [];
  
  Object.keys(obj).forEach((key: string) => {
    const value = obj[key].toString();
    query.push(`${key}=${encodeURIComponent(value)}`);
  });
  
  return `${url}?${query.join('&')}`;
};

// Type definitions
export interface Document {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  file_path?: string;
  file_type: string;
  file_size: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface Folder {
  id: number;
  name: string;
  type: 'private' | 'team';
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== USER API ENDPOINTS =====

export const login = (data: LoginRequest) => 
  axiosClient.post('/users/login', data).then(res => res.data);

export const register = (data: RegisterRequest) =>
  axiosClient.post('/users/register', data).then(res => res.data);

export const getCurrentUser = () =>
  axiosClient.get('/users/me').then(res => res.data);

export const updateProfile = (userId: number | string, data: Partial<User>) =>
  axiosClient.put(`/users/${userId}`, data).then(res => res.data);

export const getUserById = (userId: number | string) =>
  axiosClient.get(`/users/${userId}`).then(res => res.data);

export const getAllUsers = (params = {}) =>
  axiosClient.get('/users', { params }).then(res => res.data);

export const deleteUser = (userId: number | string) =>
  axiosClient.delete(`/users/${userId}`).then(res => res.data);

// ===== DOCUMENT API ENDPOINTS =====

export const getDocuments = (params = {}) =>
  axiosClient.get('/documents', { params }).then(res => res.data);

export const getDocumentById = (documentId: number | string) =>
  axiosClient.get(`/documents/${documentId}`).then(res => res.data);

export const createDocument = (data: {
  title: string;
  description?: string;
  file: File;
  tags?: string[];
} | FormData) => {
  let formData: FormData;
  
  if (data instanceof FormData) {
    // If data is already FormData, use it directly
    formData = data;
    console.log('Using provided FormData directly');
  } else {
    // Otherwise, create FormData from the object
    formData = new FormData();
    formData.append('title', data.title);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    formData.append('file', data.file);
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }
    console.log('Created new FormData from object');
  }
  
  // Log that we're sending the request (without iterating through FormData)
  console.log('Sending multipart/form-data request to /documents');
  
  return axiosClient.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data);
};

export const updateDocument = (documentId: number | string, data: {
  title?: string;
  description?: string;
  tags?: string[];
}) =>
  axiosClient.put(`/documents/${documentId}`, data).then(res => res.data);

export const deleteDocument = (documentId: number | string) =>
  axiosClient.delete(`/documents/${documentId}`).then(res => res.data);

export const downloadDocument = (documentId: number | string) => {
  console.log(`Preparing to download document ${documentId}`);
  
  // Get the base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const downloadUrl = `${baseUrl}/documents/${documentId}/download`;
  
  // For binary downloads, it's often more reliable to let the browser handle the download directly
  return new Promise(async (resolve, reject) => {
    try {
      // Get token from NextAuth session
      const session = await getSession();
      
      // Create a hidden link and trigger it
      const link = document.createElement('a');
      
      // Add token as query parameter for direct download if available
      link.href = session?.accessToken 
        ? `${downloadUrl}?token=${session.accessToken}` 
        : downloadUrl;
        
      link.setAttribute('download', ''); // Let the server set the filename
      
      // Attach to document, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      resolve({ success: true });
    } catch (error) {
      console.error('Error initiating download:', error);
      reject(error);
    }
  });
};

export const searchDocuments = (searchTerm: string, params = {}) =>
  axiosClient.get('/documents/search', { params: { ...params, q: searchTerm } }).then(res => res.data);

// ===== FOLDER API ENDPOINTS =====

export const getFolders = () =>
  axiosClient.get('/folders').then(res => res.data);

export const getFolderById = (folderId: number | string) =>
  axiosClient.get(`/folders/${folderId}`).then(res => res.data);

export const createFolder = (data: {
  name: string;
  type: 'private' | 'team';
}) =>
  axiosClient.post('/folders', data).then(res => res.data);

export const updateFolder = (folderId: number | string, data: {
  name?: string;
  type?: 'private' | 'team';
}) =>
  axiosClient.put(`/folders/${folderId}`, data).then(res => res.data);

export const deleteFolder = (folderId: number | string) =>
  axiosClient.delete(`/folders/${folderId}`).then(res => res.data);

export const getFolderDocuments = (folderId: number | string) =>
  axiosClient.get(`/folders/${folderId}/documents`).then(res => res.data);

export const moveDocument = (documentId: number | string, folderId: number | string) =>
  axiosClient.post(`/folders/${folderId}/documents`, { 
    documentId: typeof documentId === 'string' ? parseInt(documentId) : documentId 
  }).then(res => res.data);

// Default export
export default axiosClient; 