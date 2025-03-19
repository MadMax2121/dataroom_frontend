'use client';

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Upload, FileText, Search, Plus, Trash2 } from 'lucide-react';
import { DroppableFolder } from '../DroppableFolder';
import { DraggableDocument } from '../DraggableDocument';
import DocumentPreview from '../DocumentPreview';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  file?: File;
}

interface Folder {
  id: string;
  name: string;
  type: 'private' | 'team';
  documents: Document[];
}

interface PreviewState {
  isOpen: boolean;
  document: Document | null;
}

const Documents = () => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: 'loaded-documents',
      name: 'Loaded Documents',
      type: 'private',
      documents: [
        {
          id: '1',
          name: 'Pitch Deck 2024.pdf',
          type: 'PDF',
          size: '2.4 MB',
          lastModified: '2 hours ago',
          shared: true
        },
        {
          id: '2',
          name: 'Financial Projections.xlsx',
          type: 'Spreadsheet',
          size: '1.8 MB',
          lastModified: '1 day ago',
          shared: true
        }
      ]
    },
    {
      id: 'team-docs',
      name: 'Team Documents',
      type: 'team',
      documents: [
        {
          id: '3',
          name: 'Team Overview.docx',
          type: 'Document',
          size: '890 KB',
          lastModified: '3 days ago',
          shared: false
        }
      ]
    }
  ]);

  const [activeFolder, setActiveFolder] = useState<string>('loaded-documents');
  const [preview, setPreview] = useState<PreviewState>({
    isOpen: false,
    document: null
  });
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<'private' | 'team'>('private');

  const handleDrop = (documentId: string, fromFolderId: string, toFolderId: string) => {
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
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: newFolderType,
        documents: []
      };
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folderId === 'loaded-documents') return; // Prevent deleting the default folder
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    if (activeFolder === folderId) {
      setActiveFolder('loaded-documents');
    }
  };

  const handlePreview = (doc: Document) => {
    setPreview({
      isOpen: true,
      document: doc
    });
  };

  const handleDownload = (doc: Document) => {
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const activeDocuments = folders.find(f => f.id === activeFolder)?.documents || [];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </button>
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
                  onDeleteClick={folder.id !== 'loaded-documents' ? () => handleDeleteFolder(folder.id) : undefined}
                />
              ))}
            </div>
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
                  {activeDocuments.map((doc) => (
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
                  ))}
                </tbody>
              </table>
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