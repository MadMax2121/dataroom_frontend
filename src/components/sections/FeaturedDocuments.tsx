import React, { useState } from 'react';
import { X, Upload, FileText, Grid, List, Plus, Trash2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker URL for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  uploaded: boolean;
  fileUrl?: string;
  previewUrl?: string;
  type?: string;
}

interface FeaturedDocumentsProps {
  onClose?: () => void;
}

const FeaturedDocuments: React.FC<FeaturedDocumentsProps> = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [numPages, setNumPages] = useState<{ [key: string]: number }>({});
  const [loadError, setLoadError] = useState<{ [key: string]: boolean }>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      
      setDocuments(prev => prev.map((doc, index) => {
        if (index === docIndex) {
          return {
            ...doc,
            fileName: file.name,
            uploaded: true,
            fileUrl,
            type: file.type,
            previewUrl: fileUrl
          };
        }
        return doc;
      }));
    }
  };

  const onDocumentLoadSuccess = (docId: string, { numPages }: { numPages: number }) => {
    setNumPages(prev => ({ ...prev, [docId]: numPages }));
    setLoadError(prev => ({ ...prev, [docId]: false }));
  };

  const onDocumentLoadError = (docId: string) => {
    setLoadError(prev => ({ ...prev, [docId]: true }));
  };

  const addNewDocument = () => {
    const newDoc: DocumentItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      fileName: '',
      uploaded: false
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc?.fileUrl) {
        URL.revokeObjectURL(doc.fileUrl);
      }
      return prev.filter(doc => doc.id !== id);
    });
  };

  const updateDocumentTitle = (id: string, title: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, title } : doc
    ));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const renderPreview = (doc: DocumentItem, size: 'small' | 'large') => {
    if (!doc.previewUrl) {
      return <FileText className={size === 'large' ? 'w-12 h-12' : 'w-8 h-8'} />;
    }

    if (doc.type === 'application/pdf') {
      return (
        <Document
          file={doc.previewUrl}
          onLoadSuccess={(result) => onDocumentLoadSuccess(doc.id, result)}
          onLoadError={() => onDocumentLoadError(doc.id)}
          loading={
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          }
        >
          <Page
            pageNumber={1}
            width={size === 'large' ? 200 : 64}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      );
    }

    return <FileText className={size === 'large' ? 'w-12 h-12' : 'w-8 h-8'} />;
  };

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Featured Documents</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Edit
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                <div className="flex items-center justify-center w-full h-32 bg-gray-50 rounded-lg mb-4 overflow-hidden">
                  {renderPreview(doc, 'large')}
                </div>
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mr-4">
                  {renderPreview(doc, 'small')}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doc.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Featured Documents</h2>
          <p className="text-sm text-gray-500">Add documents that you want to highlight in this section</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={doc.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <input
                type="text"
                value={doc.title}
                onChange={(e) => updateDocumentTitle(doc.id, e.target.value)}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
              />
              <div className="flex items-center space-x-4">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, index)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {doc.fileName || 'Choose file'}
                    </span>
                  </div>
                </label>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addNewDocument}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Document
        </button>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default FeaturedDocuments;