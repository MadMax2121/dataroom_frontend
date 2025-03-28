## API Usage

This project uses a direct function approach for API calls with Axios. All API functions return the raw Axios response, which you'll need to handle in your components.

### Making API Calls

```typescript
import { login, register, getDocuments } from '@/lib/api';

// Example usage
const handleLogin = async () => {
  try {
    const response = await login({ 
      email: 'user@example.com', 
      password: 'password' 
    });
    
    // Access the data from the response
    const userData = response.data.data; 
    const token = userData.token;
    
    // Handle success
    localStorage.setItem('authToken', token);
  } catch (error) {
    // Handle error
    console.error('Login failed:', error);
  }
};
```

### Response Structure

All API responses follow this structure:
```typescript
{
  data: {
    data: T, // The actual data
    message: string, // Success or error message
    status: number // HTTP status code
  },
  status: number, // HTTP status code
  statusText: string, // HTTP status text
  headers: Object, // Response headers
  config: Object // Request configuration
}
```

When accessing data, you need to use `response.data.data`.

### Error Handling

```typescript
try {
  const response = await login(credentials);
  // Success path
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with a non-2xx status
    console.error('Error data:', error.response.data);
    const errorMessage = error.response.data.message;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received');
  } else {
    // Something happened in setting up the request
    console.error('Request error:', error.message);
  }
}
```

### Available API Functions

The API provides functions for working with users, documents, and folders:

#### User API
- `login(data)`: User login
- `register(data)`: User registration
- `getCurrentUser()`: Get current user profile
- `updateProfile(userId, data)`: Update user profile
- `getUserById(userId)`: Get user by ID
- `getAllUsers(params)`: Get all users with optional filtering
- `deleteUser(userId)`: Delete user

#### Document API
- `getDocuments(params)`: Get all documents with optional filtering
- `getDocumentById(documentId)`: Get document by ID
- `createDocument(data)`: Create a new document
- `updateDocument(documentId, data)`: Update document
- `deleteDocument(documentId)`: Delete document
- `downloadDocument(documentId)`: Download document file
- `searchDocuments(searchTerm, params)`: Search documents

#### Folder API
- `getFolders()`: Get all folders
- `getFolderById(folderId)`: Get folder by ID
- `createFolder(data)`: Create a new folder
- `updateFolder(folderId, data)`: Update folder
- `deleteFolder(folderId)`: Delete folder
- `getFolderDocuments(folderId)`: Get documents in a folder
- `moveDocument(documentId, folderId)`: Move document to a folder 