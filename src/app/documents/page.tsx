'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Upload, FileText, Search, Plus, Trash2, Loader, File, FilePlus, X, FileImage, FileSpreadsheet, FileIcon, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
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
  deleteDocument,
  Document as ApiDocument,
  Folder as ApiFolder,
  updateFolder,
  updateDocument
} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useDrag } from 'react-dnd';
import { getFileIcon, getFileExtension } from '@/lib/fileIcons';
import dynamic from 'next/dynamic';

// Create a dynamic DndProvider component that only loads on the client
const DndProviderWithHTML5Backend = dynamic(
  () => 
    import('react-dnd').then((mod) => {
      const { DndProvider } = mod;
      const HTML5Backend = require('react-dnd-html5-backend').HTML5Backend;
      
      return function DndProviderWrapper({ children }: { children: React.ReactNode }) {
        return (
          <DndProvider backend={HTML5Backend}>
            {children}
          </DndProvider>
        );
      };
    }),
  { ssr: false }
);

// Update interfaces to match the API types but maintain local properties
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  file?: File;
  folder_id?: string;  // Add folder_id to track which folder a document belongs to
  original_document?: ApiDocument; // Reference to original API document
  tags?: string[]; // Add tags property
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

// Add a type for selected files with tags
interface SelectedFile {
  file: File;
  tags: string[];
  isDuplicate?: boolean;
  willBeRenamed?: boolean;
  willReplace?: boolean;
}

// Add new interface and state variables for duplicate resolution
interface DuplicateFileResolution {
  file: SelectedFile;
  fileIndex: number;
  action: 'keepBoth' | 'replace';
}

// Create a new interface for duplicate file handling
interface DuplicateFileModalProps {
  files: SelectedFile[];
  onResolve: (resolutions: DuplicateFileResolution[]) => void;
  onCancel: () => void;
}

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
  
  // Add search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Add sort state with localStorage initialization
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>(() => {
    const savedSortBy = typeof window !== 'undefined' ? localStorage.getItem('documentsSortBy') : null;
    return (savedSortBy as 'name' | 'date' | 'size') || 'date';
  });
  
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const savedSortOrder = typeof window !== 'undefined' ? localStorage.getItem('documentsSortOrder') : null;
    return (savedSortOrder as 'asc' | 'desc') || 'desc';
  });
  
  // Save sort preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('documentsSortBy', sortBy);
      localStorage.setItem('documentsSortOrder', sortOrder);
    }
  }, [sortBy, sortOrder]);
  
  // Replace single file state with multiple files
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [preUploadModalOpen, setPreUploadModalOpen] = useState<boolean>(false);
  
  // Add file handling state variables
  const [fileResolutions, setFileResolutions] = useState<DuplicateFileResolution[]>([]);
  const [tagInputs, setTagInputs] = useState<{[key: number]: string}>({});
  const [showTagInput, setShowTagInput] = useState<{[key: number]: boolean}>({});
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  
  // Add upload progress tracking
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [totalToUpload, setTotalToUpload] = useState<number>(0);
  const [showUploadSuccess, setShowUploadSuccess] = useState<boolean>(false);
  
  // Add state for inline tag input
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [currentFileTag, setCurrentFileTag] = useState<string>('');
  const router = useRouter();

  // Update file input reference to accept multiple files
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inside the Documents component, add these handler functions
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [showRenameFolderDialog, setShowRenameFolderDialog] = useState(false);

  // Add setDocuments state variable
  const [documents, setDocuments] = useState<Document[]>([]);

  // Add state for inline document renaming
  const [documentRenaming, setDocumentRenaming] = useState<{id: string, name: string, originalName?: string} | null>(null);
  const [menuOpenForDoc, setMenuOpenForDoc] = useState<string | null>(null);

  // Add file tags helper function
  const addTag = (fileIndex: number, tag: string) => {
    if (!tag.trim()) return;
    
    setSelectedFiles((prev: SelectedFile[]) => prev.map((file: SelectedFile, index: number) => {
      if (index === fileIndex) {
        return {
          ...file,
          tags: [...file.tags, tag.trim()]
        };
      }
      return file;
    }));
  };

  // Add function to generate a unique filename when keeping both
  const generateUniqueFilename = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
    
    // Find existing documents with similar names to determine the next number
    const folderDocuments = folders.find(f => f.id === activeFolder)?.documents || [];
    const baseNameRegex = new RegExp(`^${name}\\s*\\((\\d+)\\)${extension.replace('.', '\\.')}$`);
    
    let highestNumber = 0;
    folderDocuments.forEach(doc => {
      const match = doc.name.match(baseNameRegex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    return `${name} (${highestNumber + 1})${extension}`;
  };

  // Add function to toggle tag input visibility
  const toggleTagInput = (fileIndex: number) => {
    setShowTagInput(prev => ({
      ...prev,
      [fileIndex]: !prev[fileIndex]
    }));
    setTagInputs(prev => ({
      ...prev,
      [fileIndex]: ''
    }));
  };

  // Add function to handle tag input change
  const handleTagInputChange = (fileIndex: number, value: string) => {
    setTagInputs(prev => ({
      ...prev,
      [fileIndex]: value
    }));
  };

  // Add function to handle tag submission via Enter key
  const handleTagKeyDown = (e: React.KeyboardEvent, fileIndex: number) => {
    if (e.key === 'Enter') {
      const tag = tagInputs[fileIndex]?.trim();
      if (tag) {
        addTag(fileIndex, tag);
        toggleTagInput(fileIndex);
      }
    }
  };

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
    
    // Get file type by file extension from title
    const title = getProperty(doc, 'title') || '';
    const fileTypeFromApi = getProperty(doc, 'file_type') || '';
    const extension = getFileExtension(title) || '';
    
    console.log('File mapping:', { 
      title, 
      fileTypeFromApi, 
      extension,
      originalDocType: doc.file_type
    });
    
    // Determine the best file type to use
    let fileType = fileTypeFromApi;
    
    // Check for Excel files by extension
    if (title.toLowerCase().endsWith('.xlsx') || title.toLowerCase().endsWith('.xls')) {
      console.log('Detected Excel file by extension:', title);
      fileType = 'EXCEL';
    }
    // Check for PowerPoint files by extension
    else if (title.toLowerCase().endsWith('.pptx') || title.toLowerCase().endsWith('.ppt')) {
      console.log('Detected PowerPoint file by extension:', title);
      fileType = 'POWERPOINT';
    }
    // Check for Word files by extension
    else if (title.toLowerCase().endsWith('.docx') || title.toLowerCase().endsWith('.doc')) {
      console.log('Detected Word file by extension:', title);
      fileType = 'WORD';
    }
    // Otherwise use the extension if available
    else if (!fileType && extension) {
      fileType = extension;
    }
  
  return {
    id: getProperty(doc, 'id')?.toString() || '0',
      name: title || 'Untitled Document',
      type: fileType || 'Unknown',
    size: formatFileSize(getProperty(doc, 'file_size')),
    lastModified: formatRelativeTime(timestamp || new Date().toISOString()),
    shared: false,
    folder_id: getProperty(doc, 'folder_id')?.toString(),
    tags: getProperty(doc, 'tags') || [],
    original_document: doc  // Changed from originalDocument to original_document
  };
};

  const handleDrop = async (documentId: string, fromFolderId: string, toFolderId: string) => {
    try {
      // First find the document that's being moved so we can preserve its data
      const documentsToMove = folders
        .find(f => f.id === fromFolderId)?.documents
        .filter(d => d.id === documentId) || [];
      
      const documentToMove = documentsToMove[0];
      
      // Make the API call to move the document
      const response = await moveDocument(
        parseInt(documentId), 
        parseInt(toFolderId)
      );
      
      console.log('Move document response:', response);
      
      // Use the document data from the API response if available
      const movedDocData = response?.data?.document;
      
      // Update UI with the server-provided data to ensure consistency
      setFolders(prevFolders => {
        const updatedFolders = [...prevFolders];
        const fromFolder = updatedFolders.find(f => f.id === fromFolderId);
        const toFolder = updatedFolders.find(f => f.id === toFolderId);
        
        if (fromFolder && toFolder) {
          // Remove document from source folder
          fromFolder.documents = fromFolder.documents.filter(d => d.id !== documentId);
          
          // Check if document already exists in the destination folder
          const documentAlreadyExists = toFolder.documents.some(d => d.id === documentId);
          
          // Only add to the destination folder if it doesn't already exist
          if (!documentAlreadyExists) {
            if (movedDocData) {
              // Create a properly formatted document with preserved timestamps from API
              console.log('Using document data from API response');
              const movedDocument: Document = mapApiDocumentToFrontend(movedDocData);
              
              // Add the document to the destination folder
              toFolder.documents.push(movedDocument);
              console.log(`Document moved successfully with preserved timestamps: ${movedDocument.lastModified}`);
            } else if (documentToMove) {
              // Fallback to using the original document data with updated folder_id
              console.log('API did not return document data, using original document data with preserved timestamps');
              
              // Make a copy to avoid reference issues and update the folder_id
              const docCopy = {...documentToMove, folder_id: toFolderId};
              toFolder.documents.push(docCopy);
              console.log(`Using preserved timestamp: ${docCopy.lastModified}`);
            }
          } else {
            console.log('Document already exists in destination folder, avoiding duplication');
          }
        }
        
        return updatedFolders;
      });
      
    } catch (err: any) {
      console.error('Error moving document:', err);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error('Error response:', err.response);
      }
      
      // If there was an error but the document data is still available, we can still update the UI
      const documentsToMove = folders
        .find(f => f.id === fromFolderId)?.documents
        .filter(d => d.id === documentId) || [];
      
      if (documentsToMove.length > 0) {
        console.log('Moving document in UI despite API error');
        
        setFolders(prevFolders => {
          const updatedFolders = [...prevFolders];
          const fromFolder = updatedFolders.find(f => f.id === fromFolderId);
          const toFolder = updatedFolders.find(f => f.id === toFolderId);
          
          if (fromFolder && toFolder) {
            // Remove document from source folder
            fromFolder.documents = fromFolder.documents.filter(d => d.id !== documentId);
            
            // Check if document already exists in the destination folder
            const documentAlreadyExists = toFolder.documents.some(d => d.id === documentId);
            
            // Only add to the destination folder if it doesn't already exist
            if (!documentAlreadyExists) {
              // Add the document to the destination folder with preserved data
              const docCopy = {...documentsToMove[0], folder_id: toFolderId};
              toFolder.documents.push(docCopy);
              console.log(`Using preserved timestamp in error handler: ${docCopy.lastModified}`);
            } else {
              console.log('Document already exists in destination folder, avoiding duplication');
            }
          }
          
          return updatedFolders;
        });
      }
      
      // Show error message without blocking the UI update
      console.log(`Document move error: ${err.message || 'Unknown error'}, but UI was updated`);
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
      
      // Use the current document name for the download
      const result = await downloadDocument(docId, doc.name);
      console.log('Download initiated:', result);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert(`Failed to download document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update file selection handler to immediately upload files without showing review modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Check if any folders exist
      if (folders.length === 0) {
        alert('Please create a folder first before uploading files.');
        setShowNewFolderDialog(true);
        return;
      }
      
      // Convert FileList to array and create SelectedFile objects
      const newFiles = Array.from(e.target.files).map(file => {
        // Check if file already exists in the active folder
        const duplicate = documentExists(file.name, activeFolder);
        
        return {
          file,
          tags: [],
          isDuplicate: duplicate
        };
      });
      
      setSelectedFiles(newFiles);
      setPreUploadModalOpen(false);
      
      // Start upload process immediately
      handleMultipleUpload(newFiles);
    }
  };

  // Update file drop handler to immediately upload files
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (folders.length === 0) {
      alert('Please create a folder first before uploading files.');
      setShowNewFolderDialog(true);
      return;
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Filter for allowed file types
      const allowedTypes = ['pdf', 'xls', 'xlsx', 'csv', 'ods', 'png', 'jpeg', 'jpg', 'ppt', 'pptx'];
      const validFiles = droppedFiles.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        return allowedTypes.includes(ext);
      });
      
      if (validFiles.length === 0) {
        alert('Unsupported file format. Please upload PDF, Excel, CSV, ODS, PowerPoint, or image files.');
        return;
      }
      
      // Create SelectedFile objects
      const newFiles = validFiles.map(file => {
        // Check if file already exists
        const duplicate = documentExists(file.name, activeFolder);
        
        return {
          file,
          tags: [],
          isDuplicate: duplicate
        };
      });
      
      setSelectedFiles(newFiles);
      setPreUploadModalOpen(false);
      
      // Start upload process immediately
      handleMultipleUpload(newFiles);
    }
  };

  // Add a function to remove a file from the selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add a function to check if a document already exists
  const documentExists = (fileName: string, activeFolder: string): boolean => {
    const folderDocuments = folders.find(f => f.id === activeFolder)?.documents || [];
    return folderDocuments.some(doc => doc.name.toLowerCase() === fileName.toLowerCase());
  };

  // Add this component inside the Documents component
  const DuplicateFileModal = ({ files, onResolve, onCancel }: DuplicateFileModalProps) => {
    const [resolutions, setResolutions] = useState<{[index: number]: 'keepBoth' | 'replace'}>({});
    const [resolveAll, setResolveAll] = useState<'keepBoth' | 'replace' | null>(null);
    
    useEffect(() => {
      // When resolveAll changes, apply to all files
      if (resolveAll) {
        const newResolutions = {...resolutions};
        files.forEach((_, index) => {
          newResolutions[index] = resolveAll;
        });
        setResolutions(newResolutions);
      }
    }, [resolveAll, files]);

    const handleResolution = (index: number, action: 'keepBoth' | 'replace') => {
      setResolutions(prev => ({
        ...prev,
        [index]: action
      }));
    };

    const handleConfirm = () => {
      // Convert resolutions to the format expected by the upload handler
      const fileResolutions: DuplicateFileResolution[] = files.map((file, index) => ({
        file,
        fileIndex: index,
        action: resolutions[index] || 'keepBoth' // Default to keepBoth if not specified
      }));
      
      onResolve(fileResolutions);
    };

    const allResolved = files.every((_, index) => resolutions[index]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-w-[95%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Duplicate Files</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            {files.length} file{files.length !== 1 ? 's' : ''} with the same name already exist. 
            How would you like to handle these duplicates?
          </p>
          
          <div className="mb-4">
            <div className="flex justify-end gap-2 mb-4">
              <span className="text-sm text-gray-500">Apply to all:</span>
              <button 
                onClick={() => setResolveAll('keepBoth')}
                className={`text-xs px-2 py-1 rounded ${resolveAll === 'keepBoth' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Keep Both
              </button>
              <button 
                onClick={() => setResolveAll('replace')}
                className={`text-xs px-2 py-1 rounded ${resolveAll === 'replace' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
              >
                Replace
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolution(index, 'keepBoth')}
                      className={`text-xs px-2 py-1 rounded ${resolutions[index] === 'keepBoth' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      Keep Both
                    </button>
                    <button
                      onClick={() => handleResolution(index, 'replace')}
                      className={`text-xs px-2 py-1 rounded ${resolutions[index] === 'replace' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!allResolved}
              className={`px-4 py-2 text-white rounded-lg ${allResolved ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              Continue Upload
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the handleMultipleUpload function to accept files parameter and handle duplicates at the end
  const handleMultipleUpload = async (files: SelectedFile[] = selectedFiles) => {
    // Skip the file review modal and check for duplicates directly
    const duplicateFiles = files.filter(file => file.isDuplicate);
    
    if (duplicateFiles.length > 0) {
      // Show the duplicate resolution modal
      setSelectedFiles(files); // Make sure we're using the provided files
      setShowDuplicateModal(true);
      return;
    }
    
    // If no duplicates, proceed with upload
    await uploadFiles(files);
  };

  // Update the upload files function to accept files parameter
  const uploadFiles = async (files: SelectedFile[] = selectedFiles) => {
    // Get files to upload (non-duplicates or ones with resolutions)
    const filesToUpload = files.filter(file => 
      !file.isDuplicate || file.willBeRenamed || file.willReplace
    );
    
    if (filesToUpload.length === 0 || !activeFolder) {
      if (files.length > 0 && filesToUpload.length === 0) {
        alert('All selected files were skipped. No files to upload.');
      }
      return;
    }
    
    try {
      setUploadingFiles(true);
      setUploadProgress(0);
      setUploadedCount(0);
      setTotalToUpload(filesToUpload.length);
      
      let successCount = 0;
      
      // Upload each file in sequence
      for (let i = 0; i < filesToUpload.length; i++) {
        const selectedFile = filesToUpload[i];
        
        const formData = new FormData();
        formData.append('file', selectedFile.file);
        
        // Use a different name if renaming to keep both
        if (selectedFile.willBeRenamed) {
          const uniqueName = generateUniqueFilename(selectedFile.file.name);
          formData.append('title', uniqueName);
        } else {
          formData.append('title', selectedFile.file.name);
        }
        
        // Add tags if present
        if (selectedFile.tags.length > 0) {
          console.log('Adding tags to document:', selectedFile.tags);
          // Send tags both ways to ensure compatibility
          selectedFile.tags.forEach((tag, index) => {
            console.log(`Adding tag[${index}]: ${tag}`);
            formData.append(`tags[${index}]`, tag);
          });
          
          // Also add as a plain array for the tags[] format
          selectedFile.tags.forEach(tag => {
            formData.append('tags[]', tag);
          });
        }
        
        console.log(`Uploading file: ${selectedFile.file.name}`);
        
        // If replacing, delete the existing file first
        if (selectedFile.willReplace) {
          // Find the existing document with the same name to get its ID
          const existingDoc = folders
            .find(f => f.id === activeFolder)?.documents
            .find(d => d.name.toLowerCase() === selectedFile.file.name.toLowerCase());
          
          if (existingDoc && existingDoc.id) {
            try {
              // Delete the existing document
              await deleteDocument(parseInt(existingDoc.id));
              
              // Remove from UI
              setFolders(prevFolders => {
                return prevFolders.map(folder => {
                  if (folder.id === activeFolder) {
                    return {
                      ...folder,
                      documents: folder.documents.filter(d => d.id !== existingDoc.id)
                    };
                  }
                  return folder;
                });
              });
            } catch (error) {
              console.error(`Error deleting document before replace: ${error}`);
            }
          }
        }
        
        // Upload the document
        const response = await createDocument(formData);
        console.log('Document created response:', response);
        
        if (!response?.document || !response.document.id) {
          console.error('Document data or ID missing from response:', response);
          throw new Error(`Failed to upload document: ${selectedFile.file.name}`);
        }
        
        // Check if tags are in the response
        console.log('Tags in response:', getProperty(response.document, 'tags'));
        
        // Associate with active folder
        await moveDocument(
          response.document.id,
          parseInt(activeFolder)
        );
        
        // Extract the proper file extension for the document type
        const fileName = selectedFile.willBeRenamed ? 
          generateUniqueFilename(selectedFile.file.name) : selectedFile.file.name;
        const fileExtension = getFileExtension(fileName) || '';
        
        // Get the appropriate file type based on file name extension
        let fileType = '';
        
        // Prioritize file extension detection for specific types
        if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
          fileType = 'EXCEL';
          console.log('Setting EXCEL type for file:', fileName);
        } 
        else if (fileName.toLowerCase().endsWith('.pptx') || fileName.toLowerCase().endsWith('.ppt')) {
          fileType = 'POWERPOINT';
          console.log('Setting POWERPOINT type for file:', fileName);
        }
        else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
          fileType = 'WORD';
          console.log('Setting WORD type for file:', fileName);
        }
        // Fallback to API provided type or extension
        else {
          fileType = getProperty(response.document, 'file_type') || '';
          if (!fileType && fileExtension) {
            fileType = fileExtension;
          }
        }
        
        console.log('Determining file type:', {
          fileName,
          fileExtension,
          apiFileType: getProperty(response.document, 'file_type'),
          resolvedFileType: fileType
        });
        
        // Create frontend document object
        const frontendDoc: Document = {
          id: getProperty(response.document, 'id')?.toString() || '0',
          name: getProperty(response.document, 'title') || fileName,
          type: fileType || 'Unknown',
          size: formatFileSize(getProperty(response.document, 'file_size') || selectedFile.file.size),
          lastModified: formatRelativeTime(
            getProperty(response.document, 'updated_at') || 
            getProperty(response.document, 'created_at') || 
            new Date().toISOString()
          ),
          shared: false,
          folder_id: activeFolder,  // Set the active folder as the document's folder
          tags: selectedFile.tags.length > 0 ? selectedFile.tags : (getProperty(response.document, 'tags') || []),
          original_document: response.document
        };
        
        console.log('Created frontend document:', frontendDoc);
        console.log('Document assigned to folder:', frontendDoc.folder_id);
        
        // Update UI with new document
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
        
        successCount++;
        
        // Update progress
        setUploadedCount(prev => prev + 1);
        setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
      }
      
      // Show success message and hide loading immediately
      setUploadingFiles(false);
      setShowUploadSuccess(true);
      
      // Hide success message after 1.5 seconds instead of 3
      setTimeout(() => {
        setShowUploadSuccess(false);
      }, 1500);
      
      // Reset state
      setSelectedFiles([]);
      setFileResolutions([]);
    } catch (err: any) {
      console.error('Error uploading documents:', err);
      alert(err.message || 'Failed to upload documents');
      setUploadingFiles(false);
    }
  };
  
  // Update the handleDuplicateResolutions function
  const handleDuplicateResolutions = (resolutions: DuplicateFileResolution[]) => {
    setShowDuplicateModal(false);
    
    // Process file resolutions
    setFileResolutions(resolutions);
    
    // Apply resolutions to selectedFiles
    const updatedFiles = [...selectedFiles];
    
    resolutions.forEach(resolution => {
      if (resolution.action === 'keepBoth') {
        updatedFiles[resolution.fileIndex] = {
          ...updatedFiles[resolution.fileIndex],
          isDuplicate: false,
          willBeRenamed: true
        };
      } else if (resolution.action === 'replace') {
        updatedFiles[resolution.fileIndex] = {
          ...updatedFiles[resolution.fileIndex],
          isDuplicate: false,
          willReplace: true
        };
      }
    });
    
    setSelectedFiles(updatedFiles);
    
    // Start upload
    uploadFiles(updatedFiles);
  };

  // Format file size helper function
  const formatSize = (size: number): string => {
    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    } else {
      return `${Math.round(size / (1024 * 1024))} MB`;
    }
  };

  // Update fileInputRef to accept multiple files
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = true;
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Add a new function to sort documents
  const sortDocuments = (documents: Document[]): Document[] => {
    return [...documents].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        // For dates, convert the relative time strings back to comparable timestamps
        const aDate = a.original_document?.updated_at || a.original_document?.created_at || '';
        const bDate = b.original_document?.updated_at || b.original_document?.created_at || '';
        return sortOrder === 'asc' 
          ? new Date(aDate).getTime() - new Date(bDate).getTime()
          : new Date(bDate).getTime() - new Date(aDate).getTime();
      } else if (sortBy === 'size') {
        // For sizes, use the original_document.file_size for accurate comparison
        const aSize = a.original_document?.file_size || 0;
        const bSize = b.original_document?.file_size || 0;
        return sortOrder === 'asc' ? aSize - bSize : bSize - aSize;
      }
      return 0;
    });
  };

  // Update the function to toggle sort order
  const toggleSort = (column: 'name' | 'date' | 'size') => {
    if (sortBy === column) {
      // If already sorting by this column, toggle order
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
    } else {
      // If switching columns, set default order
      setSortBy(column);
      setSortOrder(column === 'date' ? 'desc' : 'asc'); // Default to newest first for dates
    }
  };
  
  // Improve fuzzy search with better matching and scoring
  const fuzzyMatch = (str: string, pattern: string): { matched: boolean; score: number } => {
    if (!pattern.trim()) return { matched: true, score: 0 }; // Empty search shows all items
    
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();
    
    // Check for exact match first (highest priority)
    if (str === pattern) {
      return { matched: true, score: 1000 };
    }
    
    // Check if str starts with pattern (high priority)
    if (str.startsWith(pattern)) {
      return { matched: true, score: 900 };
    }
    
    // Check if any word in str starts with pattern (medium-high priority)
    const words = str.split(/\s+|_|\.|\-|\(|\)/);
    for (const word of words) {
      if (word.startsWith(pattern)) {
        return { matched: true, score: 800 };
      }
    }
    
    // Original fuzzy match (lowest priority)
    let patternIdx = 0;
    let strIdx = 0;
    let consecutive = 0;
    let maxConsecutive = 0;
    
    while (patternIdx < pattern.length && strIdx < str.length) {
      // If characters match, move to next pattern character
      if (pattern[patternIdx] === str[strIdx]) {
        patternIdx++;
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 0;
      }
      strIdx++;
    }
    
    // If we've gone through all pattern characters, it's a match
    // Score based on consecutive matches and pattern completion
    if (patternIdx === pattern.length) {
      const completionRatio = patternIdx / pattern.length;
      const consecutiveBonus = maxConsecutive * 10;
      const score = 100 + (completionRatio * 300) + consecutiveBonus;
      return { matched: true, score };
    }
    
    return { matched: false, score: 0 };
  };
  
  // Update the getActiveDocuments function to use the improved search
  const getActiveDocuments = (): Document[] => {
    const documents = folders.find(f => f.id === activeFolder)?.documents || [];
    
    if (!searchTerm.trim()) {
      // If no search term, just sort documents
      return sortDocuments(documents);
    }
    
    // Get search results with scores
    const searchResults = documents.map(doc => {
      let bestMatch = { matched: false, score: 0 };
      
      // Check document name
      const nameMatch = fuzzyMatch(doc.name, searchTerm);
      if (nameMatch.matched && nameMatch.score > bestMatch.score) {
        bestMatch = nameMatch;
      }
      
      // Check document type
      const typeMatch = fuzzyMatch(doc.type, searchTerm);
      if (typeMatch.matched && typeMatch.score > bestMatch.score) {
        bestMatch = typeMatch;
      }
      
      // Check document tags
      if (doc.tags) {
        for (const tag of doc.tags) {
          const tagMatch = fuzzyMatch(tag, searchTerm);
          if (tagMatch.matched && tagMatch.score > bestMatch.score) {
            bestMatch = tagMatch;
          }
        }
      }
      
      return {
        document: doc,
        matched: bestMatch.matched,
        score: bestMatch.score
      };
    });
    
    // Filter to matched documents only
    const matchedResults = searchResults.filter(result => result.matched);
    
    // Sort by score (highest first), then by the normal sort
    matchedResults.sort((a, b) => b.score - a.score);
    
    // Extract just the documents from the sorted results
    const sortedFilteredDocs = matchedResults.map(result => result.document);
    
    // Apply regular sorting as a secondary sort only if needed for same-score items
    return sortedFilteredDocs;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Inside the Documents component, add these handler functions
  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setRenameFolderId(folderId);
      setNewFolderNameInput(folder.name);
      setShowRenameFolderDialog(true);
    }
  };

  const handleSaveRename = async () => {
    if (!renameFolderId || !newFolderNameInput.trim()) return;
    
    try {
      // Call API to rename folder
      await updateFolder(parseInt(renameFolderId), {
        name: newFolderNameInput.trim()
      });
      
      // Update state
      setFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === renameFolderId 
            ? { ...folder, name: newFolderNameInput.trim() } 
            : folder
        )
      );
      
      // Close dialog
      setShowRenameFolderDialog(false);
      setRenameFolderId(null);
      setNewFolderNameInput('');
    } catch (err: any) {
      console.error('Error renaming folder:', err);
      alert(err.message || 'Failed to rename folder');
    }
  };

  const handleShareFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      // For now just show an alert - you could implement a sharing dialog later
      alert(`Sharing folder: ${folder.name}`);
    }
  };

  const handleMoveFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      // For now just show an alert - you could implement a move dialog later
      alert(`Moving folder: ${folder.name}`);
    }
  };

  // Add a helper function to ensure file extensions are preserved during rename
  const ensureFileExtension = (filename: string, originalFilename: string): string => {
    // If the new filename already has an extension, return it as is
    if (filename.includes('.')) {
      return filename;
    }
    
    // Extract extension from original filename
    const extensionMatch = originalFilename.match(/\.[^/.]+$/);
    const extension = extensionMatch ? extensionMatch[0] : '';
    
    // Append extension if available
    return extension ? `${filename}${extension}` : filename;
  };

  // Update handleRenameDocument to set the document for inline renaming
  const handleRenameDocument = (documentId: string) => {
    // Find the document
    const document = getActiveDocuments().find(doc => doc.id === documentId);
    if (!document) return;
    
    // Set only the name part without extension for easier editing
    const nameWithoutExtension = document.name.includes('.') 
      ? document.name.substring(0, document.name.lastIndexOf('.'))
      : document.name;
    
    // Set the document for inline renaming
    setDocumentRenaming({ 
      id: documentId, 
      name: nameWithoutExtension,
      originalName: document.name // Store original name to preserve extension
    });
  };

  // Modify the saveDocumentRename function to update the name in the API as well
  const saveDocumentRename = async () => {
    if (!documentRenaming || !documentRenaming.name.trim()) {
      setDocumentRenaming(null);
      return;
    }
    
    try {
      // Find the document to get its original data
      const document = getActiveDocuments().find(doc => doc.id === documentRenaming.id);
      if (!document) {
        setDocumentRenaming(null);
        return;
      }
      
      // Ensure file extension is preserved
      const newName = ensureFileExtension(
        documentRenaming.name.trim(), 
        documentRenaming.originalName || document.name
      );
      
      console.log(`Renaming document ${documentRenaming.id} from "${document.name}" to "${newName}"`);
      
      // Make API call to update the document name in the database
      // You'll need to implement or use an existing API function for updating documents
      if (document.original_document && document.original_document.id) {
        try {
          // Call API to update document name
          const response = await updateDocument(document.original_document.id, {
            title: newName
          });
          console.log('Document rename API response:', response);
        } catch (err) {
          console.error('Error updating document name in API:', err);
          // Continue with UI update even if API fails
        }
      }
      
      // Update UI optimistically
      setFolders(prev => 
        prev.map(folder => {
          if (folder.id === activeFolder) {
            return {
              ...folder,
              documents: folder.documents.map(doc => 
                doc.id === documentRenaming.id ? {...doc, name: newName} : doc
              )
            };
          }
          return folder;
        })
      );
      
      // Clear the renaming state
      setDocumentRenaming(null);
    } catch (err) {
      console.error('Error renaming document:', err);
      setDocumentRenaming(null);
    }
  };

  const handleShareDocument = (documentId: string) => {
    // Find the document
    const document = getActiveDocuments().find(doc => doc.id === documentId);
    if (!document) return;
    
    // TODO: Implement sharing functionality
    console.log(`Sharing document ${documentId}: ${document.name}`);
    
    // For demonstration purposes, show an alert
    alert(`Sharing options for "${document.name}" would appear here.`);
  };

  const handleMoveDocument = (documentId: string) => {
    // Find the document
    const document = getActiveDocuments().find(doc => doc.id === documentId);
    if (!document) return;
    
    // For now, prompt for target folder (in real implementation, would use a modal with folder selection)
    const folderOptions = folders
      .filter(folder => folder.id !== document.folder_id)
      .map(folder => `${folder.id}: ${folder.name}`)
      .join('\n');
    
    const targetFolderId = prompt(`Select destination folder:\n${folderOptions}`);
    if (!targetFolderId) return;
    
    // Extract ID (assuming format "id: name")
    const folderId = targetFolderId.split(':')[0].trim();
    
    // Call existing handler to move document
    if (document.folder_id) {
      handleDrop(documentId, document.folder_id, folderId);
    }
  };

  // Fix the handleDeleteDocument with proper types
  const handleDeleteDocument = async (documentId: string) => {
    // Find the document
    const document = getActiveDocuments().find(doc => doc.id === documentId);
    if (!document) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${document.name}"?`)) return;
    
    try {
      setLoading(true);
      // Call API to delete document
      await deleteDocument(parseInt(documentId));
      
      // Update UI
      setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== documentId));
      
      // Also remove from folder.documents if it exists in a folder
      if (document.folder_id) {
        setFolders(prev => 
          prev.map(folder => {
            if (folder.id === document.folder_id) {
              return {
                ...folder,
                documents: folder.documents.filter(doc => doc.id !== documentId)
              };
            }
            return folder;
          })
        );
      }
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  // Fix the getIcon function to properly handle Excel files
  const getIcon = (type: string, className: string = '') => {
    // Extra handling for common file types to ensure consistency
    const upperType = type?.toUpperCase?.() || '';
    
    console.log('Getting icon for type:', upperType);
    
    // Pre-process common extensions to standardize them
    let standardizedType = upperType;
    
    // Handle Excel files
    if (['XLS', 'XLSX', 'EXCEL'].some(ext => upperType.includes(ext))) {
      console.log('Excel file detected, standardizing to EXCEL');
      standardizedType = 'EXCEL';
    }
    // Handle PowerPoint files
    else if (['PPT', 'PPTX', 'POWERPOINT'].some(ext => upperType.includes(ext))) {
      console.log('PowerPoint file detected, standardizing to POWERPOINT');
      standardizedType = 'POWERPOINT';
    }
    // Handle Word files
    else if (['DOC', 'DOCX', 'WORD'].some(ext => upperType.includes(ext))) {
      console.log('Word file detected, standardizing to WORD');
      standardizedType = 'WORD';
    }
    
    return getFileIcon(standardizedType, className);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First get the folders
        const foldersResponse = await getFolders();
        console.log('All folders from API:', foldersResponse);
        let folders = foldersResponse?.folders || [];
        console.log(`Found ${folders.length} folders`);
        
        // Convert to frontend format with simplified data mapping
        const frontendFolders = folders.map((apiFolder: ApiFolder) => ({
          id: apiFolder.id.toString(),
          name: apiFolder.name,
          type: apiFolder.type as 'private' | 'team',
          documents: [] as Document[],
          originalFolder: apiFolder
        }));
        
        // Prepare a map for quick folder lookups
        const folderMap = new Map<string, Folder>();
        frontendFolders.forEach((folder: Folder) => {
          folderMap.set(folder.id, folder);
        });
        
        // For each folder, load its documents separately
        await Promise.all(frontendFolders.map(async (folder: Folder) => {
          try {
            console.log(`Loading documents for folder ${folder.id}`);
            const response = await getFolderDocuments(parseInt(folder.id));
            const docs = response?.documents || [];
            
            // Map each document to frontend format and add to folder
            const frontendDocs = docs.map((doc: ApiDocument) => mapApiDocumentToFrontend(doc));
            
            // Make sure each document has a folder_id
            frontendDocs.forEach((doc: Document) => {
              if (!doc.folder_id) {
                doc.folder_id = folder.id;
              }
            });
            
            // Update folder with documents
            folder.documents = frontendDocs;
            
            console.log(`Folder ${folder.id} has ${frontendDocs.length} documents`);
          } catch (err) {
            console.error(`Error loading documents for folder ${folder.id}:`, err);
          }
        }));
        
        // Set the folders state
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
    <DndProviderWithHTML5Backend>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <button
            onClick={() => setPreUploadModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </button>
        </div>

        <div className="flex gap-6 w-full">
          {/* Folders Sidebar */}
          <div className="w-72 space-y-4 shrink-0">
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
                    onRenameClick={() => handleRenameFolder(folder.id)}
                    onShareClick={() => handleShareFolder(folder.id)}
                    onMoveClick={() => handleMoveFolder(folder.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm min-w-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents in this folder..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="min-w-full">
                <table className="w-full" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '35%' }} />
                  </colgroup>
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="flex items-center gap-1 hover:text-gray-700">
                          <span>Name</span>
                          <div className="flex items-center">
                            <ArrowUp 
                              className={`h-4 w-4 ${sortBy === 'name' && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                            <ArrowDown 
                              className={`h-4 w-4 ${sortBy === 'name' && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                        onClick={() => toggleSort('size')}
                      >
                        <div className="flex items-center gap-1 hover:text-gray-700">
                          <span>Size</span>
                          <div className="flex items-center">
                            <ArrowUp 
                              className={`h-4 w-4 ${sortBy === 'size' && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                            <ArrowDown 
                              className={`h-4 w-4 ${sortBy === 'size' && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center gap-1 hover:text-gray-700">
                          <span>Last Modified</span>
                          <div className="flex items-center">
                            <ArrowUp 
                              className={`h-4 w-4 ${sortBy === 'date' && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                            <ArrowDown 
                              className={`h-4 w-4 ${sortBy === 'date' && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
                            />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getActiveDocuments().length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No documents in this folder. Upload a file to get started.
                        </td>
                      </tr>
                    ) : (
                      getActiveDocuments().map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50 border-t border-gray-200">
                          <td className="px-6 py-4" onClick={() => handlePreview(doc)}>
                            <div className="flex items-center">
                              {documentRenaming && documentRenaming.id === doc.id ? (
                                <div onClick={(e) => e.stopPropagation()} className="flex items-center flex-grow w-full">
                                  {/* Remove debug call that's showing in UI */}
                                  {getIcon(doc.type, 'w-6 h-6 mr-3')}
                                  <input
                                    type="text"
                                    value={documentRenaming.name}
                                    onChange={(e) => setDocumentRenaming({...documentRenaming, name: e.target.value})}
                                    onBlur={saveDocumentRename}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveDocumentRename();
                                      if (e.key === 'Escape') setDocumentRenaming(null);
                                    }}
                                    className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center w-full">
                                  <div className="flex-shrink-0">
                                    {/* Remove debug call that's showing in UI */}
                                    <DraggableDocument 
                                      id={doc.id}
                                      name={doc.name}
                                      type={doc.name.toLowerCase().endsWith('.xlsx') || doc.name.toLowerCase().endsWith('.xls') ? 'EXCEL' : doc.type}
                                      currentFolderId={doc.folder_id || activeFolder}
                                      onRenameClick={() => handleRenameDocument(doc.id)}
                                      onShareClick={() => handleShareDocument(doc.id)}
                                      onMoveClick={() => handleMoveDocument(doc.id)}
                                      onDeleteClick={() => handleDeleteDocument(doc.id)}
                                    />
                                  </div>
                                  
                                  {doc.tags && doc.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 ml-3">
                                      {doc.tags.slice(0, 5).map((tag, index) => (
                                        <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                      {doc.tags.length > 5 && (
                                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                          +{doc.tags.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500" onClick={() => handlePreview(doc)}>
                            {doc.size}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500" onClick={() => handlePreview(doc)}>
                            <div className="flex justify-between items-center w-full">
                              <span>{doc.lastModified}</span>
                              <div className="inline-block">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenForDoc(menuOpenForDoc === doc.id ? null : doc.id);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreVertical size={18} className="text-gray-500" />
                                </button>
                                
                                {menuOpenForDoc === doc.id && (
                                  <div className="absolute right-0 mt-1 z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-44">
                                    <button 
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenForDoc(null);
                                        handleRenameDocument(doc.id);
                                      }}
                                    >
                                      Rename
                                    </button>
                                    <button 
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenForDoc(null);
                                        handleShareDocument(doc.id);
                                      }}
                                    >
                                      Share file
                                    </button>
                                    <button 
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenForDoc(null);
                                        handleMoveDocument(doc.id);
                                      }}
                                    >
                                      Move to folder
                                    </button>
                                    <button 
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpenForDoc(null);
                                        handleDeleteDocument(doc.id);
                                      }}
                                    >
                                      Delete file
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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

        {/* Add the Pre-Upload Modal */}
        {preUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[800px] max-w-[90%]">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Add a document</h2>
                <button 
                  onClick={() => setPreUploadModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <p className="text-gray-600 mb-6">Select an option below</p>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 mb-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleFileDrop}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28 4H12C10.9391 4 9.92172 4.42143 9.17157 5.17157C8.42143 5.92172 8 6.93913 8 8V40C8 41.0609 8.42143 42.0783 9.17157 42.8284C9.92172 43.5786 10.9391 44 12 44H36C37.0609 44 38.0783 43.5786 38.8284 42.8284C39.5786 42.0783 40 41.0609 40 40V16L28 4Z" 
                        stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M28 4V16H40" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24 26V34" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 30H28" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">
                    Supported formats: .pdf, .xls, .xlsx, .csv, .ods, .png, .jpeg, .jpg, .ppt, .pptx (30 MB maximum).
                  </p>
                  <p className="text-gray-500">
                    Drag and drop your files or click here to choose from device.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.xls,.xlsx,.csv,.ods,.png,.jpeg,.jpg,.ppt,.pptx"
                    multiple
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Save
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

        {/* Add Upload Progress Indicator */}
        {uploadingFiles && (
          <div className="fixed bottom-0 right-0 m-6 bg-white rounded-lg shadow-lg p-4 w-96">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading documents...</span>
              <span className="text-sm font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {uploadedCount} of {totalToUpload} documents processed
            </div>
          </div>
        )}

        {/* Success Message */}
        {showUploadSuccess && (
          <div className="fixed bottom-0 right-0 m-6 bg-white rounded-lg shadow-lg p-4 w-96">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Upload complete</span>
              <span className="text-sm font-semibold">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full w-full"></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {uploadedCount} documents successfully uploaded
            </div>
          </div>
        )}

        {/* Add duplicate file modal */}
        {showDuplicateModal && (
          <DuplicateFileModal
            files={selectedFiles.filter(file => file.isDuplicate)}
            onResolve={handleDuplicateResolutions}
            onCancel={() => setShowDuplicateModal(false)}
          />
        )}
      </div>
    </DndProviderWithHTML5Backend>
  );
};

export default Documents;