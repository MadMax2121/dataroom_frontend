import nextAuthClient from './nextAuthClient';
import { userApi, documentApi, folderApi, constructUrl } from './nextAuthApi';
import { removeEmptyProps } from './helpers';
export * from './nextAuthApi';

// Create a passthrough client
export const axiosClient = nextAuthClient;
export const axiosBackendInstance = nextAuthClient;

// Re-export the APIs with the old function signatures for compatibility
export const login = userApi.getCurrent;
export const register = userApi.getCurrent;
export const getCurrentUser = userApi.getCurrent;
export const updateProfile = userApi.update;
export const getUserById = userApi.getById;
export const getAllUsers = userApi.getAll;
export const deleteUser = userApi.delete;

export const getDocuments = documentApi.getAll;
export const getDocumentById = documentApi.getById;
export const createDocument = documentApi.create;
export const updateDocument = documentApi.update;
export const deleteDocument = documentApi.delete;
export const downloadDocument = documentApi.download;
export const searchDocuments = documentApi.search;

export const getFolders = folderApi.getAll;
export const getFolderById = folderApi.getById;
export const createFolder = folderApi.create;
export const updateFolder = folderApi.update;
export const deleteFolder = folderApi.delete;
export const getFolderDocuments = folderApi.getDocuments;
export const moveDocument = folderApi.moveDocument;

// Helper function to construct URLs with query parameters
export { constructUrl };

// Type definitions
export interface Document {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  file_path?: string;
  file_type: string;
  file_size: number;
  folder_id?: number;
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

// Default export
export default axiosClient; 