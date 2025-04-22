import nextAuthClient from './nextAuthClient';
import { removeEmptyProps } from './helpers';

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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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

// ===== USER API ENDPOINTS =====
export const userApi = {
  // No need for login/register here as they are handled by NextAuth
  getCurrent: () => 
    nextAuthClient.get('/users/me').then(res => res.data),
  
  getById: (userId: number | string) => 
    nextAuthClient.get(`/users/${userId}`).then(res => res.data),
  
  update: (userId: number | string, data: Partial<User>) => 
    nextAuthClient.put(`/users/${userId}`, data).then(res => res.data),
  
  getAll: (params = {}) => 
    nextAuthClient.get('/users', { params }).then(res => res.data),
  
  delete: (userId: number | string) => 
    nextAuthClient.delete(`/users/${userId}`).then(res => res.data)
};

// ===== DOCUMENT API ENDPOINTS =====
export const documentApi = {
  getAll: (params = {}) => 
    nextAuthClient.get('/documents', { params }).then(res => res.data),
  
  getById: (documentId: number | string) => 
    nextAuthClient.get(`/documents/${documentId}`).then(res => res.data),
  
  create: (data: {
    title: string;
    description?: string;
    file: File;
    tags?: string[];
  } | FormData) => {
    let formData: FormData;
    
    if (data instanceof FormData) {
      formData = data;
    } else {
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
    }
    
    return nextAuthClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data);
  },
  
  update: (documentId: number | string, data: {
    title?: string;
    description?: string;
    tags?: string[];
  }) => 
    nextAuthClient.put(`/documents/${documentId}`, data).then(res => res.data),
  
  delete: (documentId: number | string) => 
    nextAuthClient.delete(`/documents/${documentId}`).then(res => res.data),
  
  download: (documentId: number | string) => 
    nextAuthClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    }).then(res => {
      // Extract filename from content-disposition header if available
      const contentDisposition = res.headers['content-disposition'];
      let filename = `document-${documentId}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      return {
        blob: res.data,
        filename
      };
    }),
  
  search: (searchTerm: string, params = {}) => 
    nextAuthClient.get('/documents/search', { 
      params: { ...params, q: searchTerm } 
    }).then(res => res.data)
};

// ===== FOLDER API ENDPOINTS =====
export const folderApi = {
  getAll: () => 
    nextAuthClient.get('/folders').then(res => res.data),
  
  getById: (folderId: number | string) => 
    nextAuthClient.get(`/folders/${folderId}`).then(res => res.data),
  
  create: (data: {
    name: string;
    type: 'private' | 'team';
  }) => 
    nextAuthClient.post('/folders', data).then(res => res.data),
  
  update: (folderId: number | string, data: {
    name?: string;
    type?: 'private' | 'team';
  }) => 
    nextAuthClient.put(`/folders/${folderId}`, data).then(res => res.data),
  
  delete: (folderId: number | string) => 
    nextAuthClient.delete(`/folders/${folderId}`).then(res => res.data),
  
  getDocuments: (folderId: number | string) => 
    nextAuthClient.get(`/folders/${folderId}/documents`).then(res => res.data),
  
  moveDocument: (documentId: number | string, folderId: number | string) => 
    nextAuthClient.post(`/folders/${folderId}/documents`, { 
      document_id: documentId 
    }).then(res => res.data)
}; 