# State Management

This document describes the state management approach used in the Dataset Publishing Platform.

## Overview

The Dataset Publishing Platform uses a combination of state management approaches to handle different types of state:

1. **Local Component State**: For component-specific state that doesn't need to be shared.
2. **Context API**: For state that needs to be shared across multiple components in a specific feature.
3. **Zustand**: For global application state that needs to be accessed across different features.
4. **React Query**: For server state management, including caching, refetching, and synchronization.

## State Categories

The application state is divided into several categories:

### UI State

UI state includes state related to the user interface, such as:

- Modal visibility
- Form input values
- Validation errors
- Loading indicators
- Pagination state
- Sorting and filtering preferences

UI state is typically managed using local component state (React's `useState` hook) or Context API for state that needs to be shared across multiple components in a specific feature.

### Session State

Session state includes state related to the current user session, such as:

- Authentication status
- User information
- Permissions and roles
- Theme preferences
- Language preferences

Session state is managed using Zustand for global access across the application.

### Application State

Application state includes state related to the application's core functionality, such as:

- Current dataset being edited
- Workflow step
- Metadata draft
- Upload progress

Application state is managed using a combination of Context API for feature-specific state and Zustand for global state.

### Server State

Server state includes data fetched from the server, such as:

- Dataset list
- Dataset details
- User list
- Metadata suggestions

Server state is managed using React Query for efficient caching, refetching, and synchronization with the server.

## State Management Libraries

### Zustand

Zustand is used for global state management. It provides a simple and lightweight solution for managing global state without the boilerplate of Redux.

#### Example: Authentication Store

```tsx
import create from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    try {
      const user = await loginApi(credentials);
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await logoutApi();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
}));
```

#### Example: Dataset Store

```tsx
import create from 'zustand';

interface DatasetState {
  currentDataset: Dataset | null;
  setCurrentDataset: (dataset: Dataset | null) => void;
  updateMetadata: (metadata: Metadata) => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  currentDataset: null,
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  updateMetadata: (metadata) => set((state) => ({
    currentDataset: state.currentDataset
      ? { ...state.currentDataset, metadata }
      : null,
  })),
}));
```

### React Context

React Context is used for feature-specific state that needs to be shared across multiple components within a feature.

#### Example: Upload Context

```tsx
import React, { createContext, useContext, useState } from 'react';

interface UploadContextType {
  file: File | null;
  setFile: (file: File | null) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  uploadStatus: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  setUploadStatus: (status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error') => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <UploadContext.Provider
      value={{
        file,
        setFile,
        uploadProgress,
        setUploadProgress,
        uploadStatus,
        setUploadStatus,
        error,
        setError,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
```

### React Query

React Query is used for server state management, including caching, refetching, and synchronization with the server.

#### Example: Fetching Datasets

```tsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchDatasets, createDataset, updateDataset } from '@/lib/api/datasets';

// Fetch datasets with filtering and pagination
export const useDatasets = (filters, pagination) => {
  return useQuery(
    ['datasets', filters, pagination],
    () => fetchDatasets(filters, pagination),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Create a new dataset
export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation(createDataset, {
    onSuccess: () => {
      queryClient.invalidateQueries('datasets');
    },
  });
};

// Update an existing dataset
export const useUpdateDataset = () => {
  const queryClient = useQueryClient();
  
  return useMutation(updateDataset, {
    onSuccess: (updatedDataset) => {
      queryClient.invalidateQueries('datasets');
      queryClient.invalidateQueries(['dataset', updatedDataset.id]);
    },
  });
};
```

## State Management Patterns

### Composition Pattern

The composition pattern is used to combine multiple state providers to create a complete state management solution.

```tsx
const AppProviders: React.FC = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UploadProvider>
          <MetadataProvider>
            {children}
          </MetadataProvider>
        </UploadProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

### Container/Presenter Pattern

The container/presenter pattern is used to separate state management from presentation.

```tsx
// Container component
const DatasetListContainer: React.FC = () => {
  const { data, isLoading, error } = useDatasets(filters, pagination);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DatasetList datasets={data.datasets} />;
};

// Presenter component
const DatasetList: React.FC<{ datasets: Dataset[] }> = ({ datasets }) => {
  return (
    <div>
      {datasets.map((dataset) => (
        <DatasetCard key={dataset.id} dataset={dataset} />
      ))}
    </div>
  );
};
```

### Custom Hooks Pattern

The custom hooks pattern is used to encapsulate state management logic and provide a clean API for components.

```tsx
// Custom hook for dataset metadata editing
const useMetadataEditor = (datasetId: string) => {
  const { data, isLoading, error } = useQuery(
    ['dataset', datasetId],
    () => fetchDataset(datasetId)
  );
  
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  
  useEffect(() => {
    if (data) {
      setMetadata(data.metadata);
    }
  }, [data]);
  
  const updateMetadata = useMutation(
    (newMetadata: Metadata) => updateDatasetMetadata(datasetId, newMetadata),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['dataset', datasetId]);
      },
    }
  );
  
  return {
    dataset: data,
    metadata,
    setMetadata,
    updateMetadata: updateMetadata.mutate,
    isLoading,
    error,
    isSaving: updateMetadata.isLoading,
    saveError: updateMetadata.error,
  };
};
```

## Performance Considerations

### Memoization

Components and expensive calculations are memoized using React's `useMemo` and `useCallback` hooks to prevent unnecessary re-renders.

```tsx
const MemoizedComponent = React.memo(({ data }) => {
  // Component implementation
});

const ParentComponent = () => {
  const data = useData();
  
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // Event handler implementation
  }, []);
  
  return <MemoizedComponent data={processedData} onClick={handleClick} />;
};
```

### Selective Rendering

Components are designed to render only when their props change, using techniques such as:

- React.memo for function components
- Selective state updates to avoid unnecessary re-renders
- Using keys to optimize list rendering

### Code Splitting

The application uses code splitting to load only the necessary code for each page, reducing the initial bundle size and improving performance.

```tsx
import { lazy, Suspense } from 'react';

const DatasetEditor = lazy(() => import('@/components/DatasetEditor'));

const DatasetPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DatasetEditor />
    </Suspense>
  );
};
```

## Testing State Management

The state management code is tested using a combination of unit tests and integration tests:

### Unit Tests

Unit tests are used to test individual state management functions and hooks.

```tsx
// Testing a Zustand store
test('auth store login updates state correctly', async () => {
  const { result } = renderHook(() => useAuthStore());
  
  await act(async () => {
    await result.current.login({ email: 'test@example.com', password: 'password' });
  });
  
  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).not.toBeNull();
});

// Testing a custom hook
test('useMetadataEditor updates metadata correctly', async () => {
  const { result } = renderHook(() => useMetadataEditor('dataset-id'));
  
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  
  act(() => {
    result.current.setMetadata({ title: 'New Title' });
  });
  
  expect(result.current.metadata.title).toBe('New Title');
});
```

### Integration Tests

Integration tests are used to test how state management interacts with components and the server.

```tsx
test('dataset list filters and pagination work correctly', async () => {
  render(<DatasetListPage />);
  
  // Wait for initial data to load
  await screen.findByText('Dataset 1');
  
  // Apply a filter
  fireEvent.click(screen.getByText('Published'));
  
  // Wait for filtered data to load
  await waitFor(() => {
    expect(screen.queryByText('Draft Dataset')).not.toBeInTheDocument();
  });
  
  // Go to next page
  fireEvent.click(screen.getByText('Next'));
  
  // Wait for next page data to load
  await screen.findByText('Dataset 11');
});
``` 