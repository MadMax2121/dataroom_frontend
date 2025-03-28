import { NextResponse } from 'next/server';
import { documents } from '../documents';

// GET handler for /api/documents/search
export async function GET(request: Request) {
  console.log('Mock API: GET /api/documents/search called');
  
  // Get the search query from the URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  console.log('Search query:', query);
  
  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => {
    const lowerQuery = query.toLowerCase();
    return (
      doc.title.toLowerCase().includes(lowerQuery) ||
      (doc.description && doc.description.toLowerCase().includes(lowerQuery)) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
  
  return NextResponse.json({
    data: {
      items: filteredDocuments,
      total: filteredDocuments.length,
      page: 1,
      pageSize: 10,
      totalPages: 1
    },
    message: 'Documents search completed',
    status: 200
  });
} 