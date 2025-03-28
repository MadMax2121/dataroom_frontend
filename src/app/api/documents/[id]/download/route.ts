import { NextResponse } from 'next/server';
import { documents } from '../../documents';

// GET handler for /api/documents/[id]/download
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`Mock API: GET /api/documents/${params.id}/download called`);
  
  // Find the document by ID
  const id = parseInt(params.id);
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return NextResponse.json({
      message: 'Document not found',
      status: 404
    }, { status: 404 });
  }
  
  // Create a simple text blob as a mock file
  const mockContent = `This is a mock file content for ${document.title}`;
  const blob = new Blob([mockContent], { type: document.fileType });
  
  // Return the blob
  return new NextResponse(blob, {
    headers: {
      'Content-Type': document.fileType,
      'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-z0-9.]/gi, '_')}"`,
      'Content-Length': blob.size.toString()
    }
  });
} 