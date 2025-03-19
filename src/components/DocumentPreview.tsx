'use client';

import React from 'react';
import { X, Download, Share2, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface DocumentPreviewProps {
  document: {
    id: string;
    name: string;
    type: string;
    size: string;
    file?: File;
    preview?: string;
  };
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onDownload,
  onShare
}) => {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);

  const isPDF = document.type === 'PDF';
  const isImage = ['Image'].includes(document.type);
  const previewUrl = document.preview || (document.file ? URL.createObjectURL(document.file) : null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    setError('Failed to load document preview');
    console.error('Preview error:', error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
            <p className="text-sm text-gray-500">{document.size}</p>
          </div>
          <div className="flex items-center space-x-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <File className="w-16 h-16 mb-4" />
              <p>{error}</p>
            </div>
          ) : previewUrl ? (
            <div className="flex justify-center">
              {isPDF ? (
                <div>
                  <Document
                    file={previewUrl}
                    onLoadSuccess={handleLoadSuccess}
                    onLoadError={handleLoadError}
                    loading={
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={currentPage}
                      width={800}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                  {numPages && numPages > 1 && (
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {numPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                        disabled={currentPage >= numPages}
                        className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : isImage ? (
                <img
                  src={previewUrl}
                  alt={document.name}
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={() => setError('Failed to load image preview')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="w-16 h-16 mb-4" />
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-16 h-16 mb-4" />
              <p>No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;