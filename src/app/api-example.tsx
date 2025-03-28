'use client';

// This is just an example file to demonstrate API usage

import { useState, useEffect } from 'react';
import { 
  getDocuments, 
  createDocument, 
  getFolders, 
  createFolder,
  getCurrentUser,
  Document,
  Folder,
  ApiResponse,
  PaginatedResponse
} from '@/lib/api';

export default function ApiExamplePage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Example of fetching the current user
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    // Example of fetching documents
    const fetchDocuments = async () => {
      try {
        const response = await getDocuments();
        setDocuments(response.data.items);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    // Example of fetching folders
    const fetchFolders = async () => {
      try {
        const response = await getFolders();
        setFolders(response.data);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchUser();
    fetchDocuments();
    fetchFolders();
  }, []);
  
  // Example of creating a document
  const handleCreateDocument = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createDocument({
        title: 'New Document',
        description: 'Document created using direct function import',
        file,
        tags: ['example', 'direct-import']
      });
      
      // Update documents list with new document
      setDocuments(prevDocuments => [...prevDocuments, response.data]);
      
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Error creating document');
      console.error('Error creating document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Example of creating a folder
  const handleCreateFolder = async (name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createFolder({
        name,
        type: 'private'
      });
      
      // Update folders list with new folder
      setFolders(prevFolders => [...prevFolders, response.data]);
      
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Error creating folder');
      console.error('Error creating folder:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Example</h1>
      <p className="mb-6">This is just an example component demonstrating API usage with direct function imports.</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">User</h2>
          {user ? (
            <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <p>No user data</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Documents ({documents.length})</h2>
          {documents.length > 0 ? (
            <ul className="bg-gray-100 p-3 rounded">
              {documents.map((doc) => (
                <li key={doc.id} className="mb-1">
                  {doc.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No documents</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Folders ({folders.length})</h2>
          {folders.length > 0 ? (
            <ul className="bg-gray-100 p-3 rounded">
              {folders.map((folder) => (
                <li key={folder.id} className="mb-1">
                  {folder.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No folders</p>
          )}
        </div>
      </div>
    </div>
  );
} 