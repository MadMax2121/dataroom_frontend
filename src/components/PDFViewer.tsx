'use client';

import React from 'react';
import { Document, Page } from 'react-pdf';

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    setError('Failed to load PDF preview');
    console.error('PDF preview error:', error);
  };

  return (
    <div>
      <Document
        file={url}
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
  );
};

export default PDFViewer; 