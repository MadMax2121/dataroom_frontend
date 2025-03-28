# API Client

This folder contains the API client setup for communicating with the backend API located in the `dataroom_backend` folder.

## Structure

- `axios.ts`: Base Axios configuration and interceptors
- `apiService.ts`: Base API service class with common HTTP methods
- `types.ts`: Common type definitions for API responses
- `index.ts`: Exports all API services and types
- `blueprints/`: Contains API services for different resources

## Usage

### Import the API

```tsx
import { api } from '@/lib/api';
// Or import specific services and types
import { userApi, User } from '@/lib/api';
```

### Authentication

The API client handles authentication tokens automatically. When a user logs in, store the token in local storage:

```tsx
const response = await api.user.login({ email, password });
localStorage.setItem('authToken', response.data.token);
```

The axios interceptor will automatically include the token in subsequent requests.

### Making API Requests

```tsx
// Example: Get user profile
try {
  const response = await api.user.getCurrentUser();
  const user = response.data;
  console.log(user);
} catch (error) {
  console.error('Failed to get user profile', error);
}

// Example: Get documents with pagination
try {
  const response = await api.document.getDocuments({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const documents = response.data.items;
  console.log(documents);
} catch (error) {
  console.error('Failed to get documents', error);
}
```

### File Uploads

For file uploads, the `createDocument` function handles the FormData creation:

```tsx
const file = event.target.files[0];
try {
  await api.document.createDocument({
    file,
    title: 'My Document',
    description: 'Document description',
    tags: ['important', 'document']
  });
} catch (error) {
  console.error('Upload failed', error);
}
```

### File Downloads

```tsx
const handleDownload = async (documentId) => {
  try {
    const blob = await api.document.downloadDocument(documentId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filename.pdf'; // Set the filename
    a.click();
  } catch (error) {
    console.error('Download failed', error);
  }
};
```

## Adding New API Blueprints

To create a new API blueprint for a different resource:

1. Create a new file in the `blueprints/` directory
2. Extend the `ApiService` class
3. Define interfaces for the resource
4. Implement methods for API endpoints
5. Export a singleton instance
6. Add the service to the `api` object in `index.ts`

Example:

```tsx
// blueprints/newResourceApi.ts
import { ApiService } from '../apiService';
import { ApiResponse } from '../types';

export interface NewResource {
  id: number;
  name: string;
  // ...other properties
}

export class NewResourceApi extends ApiService {
  constructor() {
    super('/new-resource');
  }

  async getAll(): Promise<ApiResponse<NewResource[]>> {
    return this.get<ApiResponse<NewResource[]>>('');
  }

  // ...other methods
}

export const newResourceApi = new NewResourceApi();
```

Then update `index.ts`:

```tsx
// index.ts
import { newResourceApi } from './blueprints/newResourceApi';

export * from './blueprints/newResourceApi';

export const api = {
  user: userApi,
  document: documentApi,
  newResource: newResourceApi,
  // ...other services
};
```

## Environment Configuration

The API base URL is configured using environment variables. For local development, create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production, set the appropriate URL in your deployment environment. 