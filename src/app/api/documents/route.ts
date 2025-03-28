import { NextResponse } from 'next/server';
import { documents } from './documents';

// GET handler for /api/documents
export async function GET() {
  // Log the request
  console.log('Mock API: GET /api/documents called');
  
  return NextResponse.json({
    data: {
      items: documents,
      total: documents.length,
      page: 1,
      pageSize: 10,
      totalPages: 1
    },
    message: 'Documents retrieved successfully',
    status: 200
  });
}

// POST handler for /api/documents
export async function POST(request: Request) {
  try {
    // Log the request
    console.log('Mock API: POST /api/documents called');
    
    // Try to parse the request body
    const body = await request.json().catch(() => null);
    console.log('Request body:', body);
    
    // Mocked successful response
    const newDocument = {
      id: documents.length + 1,
      title: body?.title || 'New Document',
      description: body?.description || 'No description provided',
      fileUrl: '/sample/new-file.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      tags: body?.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 1
    };
    
    // Add to our mock database
    documents.push(newDocument);
    
    return NextResponse.json({
      data: newDocument,
      message: 'Document created successfully',
      status: 201
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json({
      message: 'Failed to create document',
      status: 500,
      error: String(error)
    }, { status: 500 });
  }
} 