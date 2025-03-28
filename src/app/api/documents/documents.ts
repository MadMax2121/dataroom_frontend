// Simple in-memory database for demo purposes
export const documents = [
  {
    id: 1,
    title: 'Sample Document 1',
    description: 'This is a sample document description',
    fileUrl: '/sample/file1.pdf',
    fileType: 'application/pdf',
    fileSize: 1024000,
    tags: ['sample', 'pdf'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1
  },
  {
    id: 2,
    title: 'Sample Document 2',
    description: 'Another sample document',
    fileUrl: '/sample/file2.docx',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 2048000,
    tags: ['sample', 'docx'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1
  }
]; 