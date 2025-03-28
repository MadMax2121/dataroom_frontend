'use client';

import { useEffect, useState } from 'react';
import { getDocuments, downloadDocument, deleteDocument } from '@/lib/api';
import Link from 'next/link';

// Define the Document interface since we no longer import it
interface Document {
  id: number;
  title: string;
  description?: string;
  file_type: string;
  file_size?: number;
  tags?: string[];
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await getDocuments();
        setDocuments(response?.items || []);
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        setError(err.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleDownload = async (documentId: number) => {
    try {
      const blob = await downloadDocument(documentId);
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Find the document to get its title
      const doc = documents.find(d => d.id === documentId);
      a.download = doc?.title || `document-${documentId}`;
      // Append to the DOM, click it, and clean up
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document');
    }
  };
  
  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      setLoading(true);
      await deleteDocument(documentId);
      // Remove the document from the list
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && documents.length === 0) {
    return <div>Loading documents...</div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  }
  
  if (documents.length === 0) {
    return <div>No documents found. <Link href="/documents/upload" className="text-blue-500 hover:underline">Upload a document</Link></div>;
  }
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Documents ({documents.length})</h2>
        <Link 
          href="/documents/upload" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Upload New
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="p-4 border rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
            {doc.description && <p className="text-gray-600 mb-2">{doc.description}</p>}
            
            <div className="mb-2">
              <span className="text-gray-500 text-sm">Type: </span>
              <span className="text-sm">{doc.file_type}</span>
            </div>
            
            {doc.tags && doc.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {doc.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleDownload(doc.id)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Download
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 