'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Upload, FileText, Search, Plus, Trash2, Loader } from 'lucide-react';
import { DroppableFolder } from '@/components/DroppableFolder';
import { DraggableDocument } from '@/components/DraggableDocument';
import DocumentPreview from '@/components/DocumentPreview';
import { 
  getDocuments, 
  getFolders, 
  createFolder, 
  getFolderDocuments, 
  moveDocument,
  deleteFolder,
  downloadDocument,
  createDocument,
  Document as ApiDocument,
  Folder as ApiFolder
} from '@/lib/api';
import { useRouter } from 'next/navigation';

// Update interfaces to match the API types but maintain local properties
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  file?: File;
  original_document?: ApiDocument; // Reference to original API document
}

interface Folder {
  id: string;
  name: string;
  type: 'private' | 'team';
  documents: Document[];
  originalFolder?: ApiFolder; // Reference to original API folder
}

interface PreviewState {
  isOpen: boolean;
  document: Document | null;
}

// Convert file size in bytes to human-readable format
const formatFileSize = (bytes: number | undefined | null): string => {
  if (bytes == null) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Format date to a relative time string
const formatRelativeTime = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    // Check if the date string already has a timezone indicator
    // If not, assume it's UTC and add the 'Z' suffix
    const dateWithTimezone = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    
    // Parse the date (now properly treated as UTC)
    const date = new Date(dateWithTimezone);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Get current time
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Handle future dates - this could happen if server and client clocks are out of sync
    if (diff < 0) {
      // Minor future date (within 1 minute) - probably just clock sync issues
      if (diff > -60) return 'just now';
      // Actual future date
      return date.toLocaleString();
    }
    
    // Standard relative time formatting
    if (diff < 60) return 'just now';
    else if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
    else if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    else if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    else return date.toLocaleDateString();
  } catch (error) {
    return 'Date error';
  }
};

// Simplified helper to extract file extension
const getFileExtension = (filename: string | undefined): string | null => {
  if (!filename || !filename.includes('.')) return null;
  return filename.split('.').pop()?.toUpperCase() || null;
};

// Helper function to get a property from a document, handling both camelCase and snake_case
const getProperty = (obj: any, key: string): any => {
  // Try the snake_case version first
  const snake_case_key = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  if (obj && snake_case_key in obj) {
    return obj[snake_case_key];
  }
  
  // If not found, try the original key (might be camelCase)
  if (obj && key in obj) {
    return obj[key];
  }
  
  return undefined;
};

// Update in your functions to use snake_case properties
const mapApiDocumentToFrontend = (doc: any): Document => {
  // Try to get created_at and updated_at fields
  const created_at = getProperty(doc, 'created_at');
  const updated_at = getProperty(doc, 'updated_at');
  
  // Use the most recent timestamp for display
  let timestamp = updated_at || created_at;
  
  return {
    id: getProperty(doc, 'id')?.toString() || '0',
    name: getProperty(doc, 'title') || 'Untitled Document',
    type: getProperty(doc, 'file_type') || getFileExtension(getProperty(doc, 'title')) || 'Unknown',
    size: formatFileSize(getProperty(doc, 'file_size')),
    lastModified: formatRelativeTime(timestamp || new Date().toISOString()),
    shared: false,
    original_document: doc  // Changed from originalDocument to original_document
  };
};

const Documents = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('');
  const [preview, setPreview] = useState<PreviewState>({
    isOpen: false,
    document: null
  });
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<'private' | 'team'>('private');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [documentsResponse, foldersResponse] = await Promise.all([
          getDocuments(),
          getFolders()
        ]);
        
        console.log('Documents from API:', documentsResponse);
        console.log('All folders from API:', foldersResponse);
        
        const allDocuments = documentsResponse?.items || [];
        let folders = foldersResponse?.folders || [];
        
        console.log(`Found ${folders.length} folders`);
        
        // 2. Convert to frontend format with simplified data mapping
        const frontendFolders = folders.map((apiFolder: ApiFolder) => ({
          id: apiFolder.id.toString(),
          name: apiFolder.name,
          type: apiFolder.type as 'private' | 'team',
          documents: [] as Document[],
          originalFolder: apiFolder
        }));
        
        // 3. Load and organize documents (single API call instead of one per folder)
        // First try to get documents already associated with folders
        const folderDocuments = new Map<string, Document[]>();
        
        await Promise.all(frontendFolders.map(async (folder: Folder) => {
          try {
            const response = await getFolderDocuments(parseInt(folder.id));
            const docs = response?.documents || [];
            
            console.log(`Documents for folder ${folder.id} - raw data:`, docs);
            
            // Create a simpler document mapping
            folderDocuments.set(folder.id, docs.map((doc: ApiDocument) => {
              console.log('Processing document:', doc);
              
              // Check for timestamp properties
              const created_at = getProperty(doc, 'created_at');
              const updated_at = getProperty(doc, 'updated_at');
              
              // Use the most recent timestamp
              let timestamp = updated_at || created_at;
              
              return {
                id: getProperty(doc, 'id')?.toString() || '0',
                name: getProperty(doc, 'title') || getProperty(doc, 'name') || 'Untitled',
                type: getProperty(doc, 'file_type') || getFileExtension(getProperty(doc, 'title')) || 'Unknown',
                size: formatFileSize(getProperty(doc, 'file_size')),
                lastModified: formatRelativeTime(timestamp),
                shared: false,
                original_document: doc
              };
            }));
          } catch (err) {
            console.error(`Error loading documents for folder ${folder.id}:`, err);
            folderDocuments.set(folder.id, []);
          }
        }));
        
        // Assign documents to folders
        frontendFolders.forEach((folder: Folder) => {
          folder.documents = folderDocuments.get(folder.id) || [];
        });
        
        // Check if we found any documents in folders
        const totalFolderDocs = frontendFolders.reduce(
          (sum: number, folder: Folder) => sum + folder.documents.length, 0);
          
        // Do not automatically associate documents with the first folder
        // Just set the folders without modifying document associations
        setFolders(frontendFolders);
        
        // Set the active folder to the first one if we have folders
        if (frontendFolders.length > 0) {
          setActiveFolder(frontendFolders[0].id);
        }
      } catch (err: any) {
        console.error('Error loading folders and documents:', err);
        setError(err.message || 'Failed to load folders and documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDrop = async (documentId: string, fromFolderId: string, toFolderId: string) => {
    try {
      // Optimistically update UI
      setFolders(prevFolders => {
        const updatedFolders = [...prevFolders];
        const fromFolder = updatedFolders.find(f => f.id === fromFolderId);
        const toFolder = updatedFolders.find(f => f.id === toFolderId);
        
        if (fromFolder && toFolder) {
          const documentIndex = fromFolder.documents.findIndex(d => d.id === documentId);
          if (documentIndex !== -1) {
            const [document] = fromFolder.documents.splice(documentIndex, 1);
            toFolder.documents.push(document);
          }
        }
        
        return updatedFolders;
      });
      
      // Make API call to move document between folders
      await moveDocument(
        parseInt(documentId), 
        parseInt(toFolderId)
      );
    } catch (err: any) {
      console.error('Error moving document:', err);
      // Revert the UI change on error
      alert('Failed to move document. Please try again.');
      // Reload folders to restore correct state
      window.location.reload();
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        // Create folder in API
        const response = await createFolder({
          name: newFolderName.trim(),
          type: newFolderType
        });
        
        // Add new folder to UI
        const newFolder: Folder = {
          id: response?.folder?.id.toString(),
          name: response?.folder?.name,
          type: response?.folder?.type as 'private' | 'team',
          documents: [],
          originalFolder: response?.folder
        };
        
        setFolders(prev => [...prev, newFolder]);
        setNewFolderName('');
        setShowNewFolderDialog(false);
      } catch (err: any) {
        console.error('Error creating folder:', err);
        alert(err.message || 'Failed to create folder');
      }
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;
    
    try {
      // Delete folder in API
      await deleteFolder(parseInt(folderId));
      
      // Remove folder from UI
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      if (activeFolder === folderId && folders.length > 0) {
        // Set another folder as active
        const firstRemainingFolder = folders.find(f => f.id !== folderId);
        if (firstRemainingFolder) {
          setActiveFolder(firstRemainingFolder.id);
        }
      }
    } catch (err: any) {
      console.error('Error deleting folder:', err);
      alert(err.message || 'Failed to delete folder');
    }
  };

  const handlePreview = (doc: Document) => {
    console.log('Previewing document:', doc);
    if (doc.original_document) {
      console.log('Original document data:', doc.original_document);
    }
    setPreview({
      isOpen: true,
      document: doc
    });
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (!doc.original_document) {
        throw new Error('No original document data available');
      }
      
      console.log('Attempting to download document:', {
        id: doc.original_document.id,
        title: doc.name
      });
      
      const docId = doc.original_document.id;
      console.log(`Calling download API for document ID: ${docId}`);
      
      // Using the new direct download approach
      const result = await downloadDocument(docId);
      console.log('Download initiated:', result);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert(`Failed to download document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Check if any folders exist
      if (folders.length === 0) {
        alert('Please create a folder first before uploading files.');
        setShowNewFolderDialog(true);
        return;
      }
      
      setSelectedFile(e.target.files[0]);
      setUploadTitle(e.target.files[0].name);
      setUploadModalOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !activeFolder) return;
    
    try {
      // Create form data directly to minimize transformation layers
      const formData = new FormData();
      
      // Make sure the file is appended with the correct field name - must be 'file'
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle || selectedFile.name);
      if (uploadDescription) {
        formData.append('description', uploadDescription);
      }
      
      // Log what we're uploading
      console.log('Uploading file:', {
        title: uploadTitle || selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Log FormData contents for debugging
      console.log('FormData contents:');
      console.log('- file field added:', formData.has('file'));
      console.log('- title field added:', formData.has('title'));
      console.log('- description field added:', formData.has('description'));
      
      // Direct API request to upload document
      const response = await createDocument(formData);
      
      console.log('Upload response:', response);
      
      // The document data is directly in the response
      const newDocument = response?.document;
      
      if (!newDocument || !newDocument.id) {
        console.error('Document data or ID missing from response:', response);
        throw new Error('Failed to get document ID from upload response');
      }
      
      // Associate with active folder
      await moveDocument(
        newDocument.id,
        parseInt(activeFolder)
      );
      
      // Create a simplified document object for the UI
      const frontendDoc: Document = {
        id: getProperty(newDocument, 'id')?.toString() || '0',
        name: getProperty(newDocument, 'title') || getProperty(newDocument, 'name') || selectedFile.name,
        type: getProperty(newDocument, 'file_type') || 
              getFileExtension(getProperty(newDocument, 'title')) ||
              selectedFile.type.split('/')[1]?.toUpperCase() || 
              'Unknown',
        size: formatFileSize(getProperty(newDocument, 'file_size') || selectedFile.size),
        lastModified: formatRelativeTime(
          getProperty(newDocument, 'updated_at') || 
          getProperty(newDocument, 'created_at') || 
          new Date().toISOString()
        ),
        shared: false,
        original_document: newDocument
      };
      
      // Update UI directly by adding to the current folder
      setFolders(prevFolders => {
        return prevFolders.map(folder => {
          if (folder.id === activeFolder) {
            return {
              ...folder,
              documents: [...folder.documents, frontendDoc]
            };
          }
          return folder;
        });
      });
      
      // Clear form
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadModalOpen(false);
    } catch (err: any) {
      console.error('Error uploading document:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      alert(err.message || 'Failed to upload document');
    }
  };

  const activeDocuments = folders.find(f => f.id === activeFolder)?.documents || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>

        <div className="flex gap-6">
          {/* Folders Sidebar */}
          <div className="w-72 space-y-4">
            <button
              onClick={() => setShowNewFolderDialog(true)}
              className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Folder
            </button>

            {folders.length === 0 ? (
              <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-xl">
                No folders created yet. Create a folder to organize your documents.
              </div>
            ) : (
              <div className="space-y-3">
                {folders.map(folder => (
                  <DroppableFolder
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    type={folder.type}
                    documentsCount={folder.documents.length}
                    isActive={activeFolder === folder.id}
                    onDrop={handleDrop}
                    onClick={() => setActiveFolder(folder.id)}
                    onSettingsClick={() => {}}
                    onDeleteClick={() => handleDeleteFolder(folder.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {folders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Create a folder to start organizing your documents</p>
                  <button
                    onClick={() => setShowNewFolderDialog(true)}
                    className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create First Folder
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No documents in this folder. Upload a file to get started.
                        </td>
                      </tr>
                    ) : (
                      activeDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handlePreview(doc)}
                        >
                          <td className="px-6 py-4">
                            <DraggableDocument
                              id={doc.id}
                              name={doc.name}
                              type={doc.type}
                              currentFolderId={activeFolder}
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{doc.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{doc.size}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{doc.lastModified}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Type
                </label>
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="private"
                      checked={newFolderType === 'private'}
                      onChange={(e) => setNewFolderType(e.target.value as 'private' | 'team')}
                      className="form-radio"
                    />
                    <span className="ml-2">Private</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="team"
                      checked={newFolderType === 'team'}
                      onChange={(e) => setNewFolderType(e.target.value as 'private' | 'team')}
                      className="form-radio"
                    />
                    <span className="ml-2">Team</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewFolderDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Document Dialog */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Document description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Selected file: {selectedFile?.name}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadTitle('');
                    setUploadDescription('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview */}
        {preview.isOpen && preview.document && (
          <DocumentPreview
            document={preview.document}
            onClose={() => setPreview({ isOpen: false, document: null })}
            onDownload={() => preview.document && handleDownload(preview.document)}
            onShare={() => {
              console.log('Share:', preview.document?.name);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default Documents;