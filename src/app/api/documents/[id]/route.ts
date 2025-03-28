import { NextResponse } from 'next/server';

// Import the documents array from the parent route
// In a real app, this would be a database query
import { documents } from '../documents';

// GET handler for /api/documents/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`Mock API: GET /api/documents/${params.id} called`);
  
  // Find the document by ID
  const id = parseInt(params.id);
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return NextResponse.json({
      message: 'Document not found',
      status: 404
    }, { status: 404 });
  }
  
  return NextResponse.json({
    data: document,
    message: 'Document retrieved successfully',
    status: 200
  });
}

// PUT handler for /api/documents/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`Mock API: PUT /api/documents/${params.id} called`);
  
  try {
    const id = parseInt(params.id);
    const body = await request.json().catch(() => null);
    
    // Find the document
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return NextResponse.json({
        message: 'Document not found',
        status: 404
      }, { status: 404 });
    }
    
    // Update the document
    const updatedDocument = {
      ...documents[documentIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    documents[documentIndex] = updatedDocument;
    
    return NextResponse.json({
      data: updatedDocument,
      message: 'Document updated successfully',
      status: 200
    });
  } catch (error) {
    console.error(`Error in PUT /api/documents/${params.id}:`, error);
    return NextResponse.json({
      message: 'Failed to update document',
      status: 500,
      error: String(error)
    }, { status: 500 });
  }
}

// DELETE handler for /api/documents/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`Mock API: DELETE /api/documents/${params.id} called`);
  
  try {
    const id = parseInt(params.id);
    
    // Find the document
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return NextResponse.json({
        message: 'Document not found',
        status: 404
      }, { status: 404 });
    }
    
    // Remove the document
    documents.splice(documentIndex, 1);
    
    return NextResponse.json({
      data: null,
      message: 'Document deleted successfully',
      status: 200
    });
  } catch (error) {
    console.error(`Error in DELETE /api/documents/${params.id}:`, error);
    return NextResponse.json({
      message: 'Failed to delete document',
      status: 500,
      error: String(error)
    }, { status: 500 });
  }
} 