# Dataset Publishing Platform - Component Documentation

This document provides detailed information about the React components used in the Dataset Publishing Platform.

## Table of Contents

1. [Upload Components](#upload-components)
2. [Metadata Components](#metadata-components)
3. [Dataset Components](#dataset-components)
4. [Submission Components](#submission-components)
5. [UI Components](#ui-components)

## Upload Components

### FileUpload

A drag-and-drop file upload component that handles CSV and Excel files.

**Props:**
```typescript
interface FileUploadProps {
  onUploadSuccess: (data: { 
    datasetId: string;
    fileStats: {
      filename: string;
      fileSize: number;
      rowCount: number;
      columns: string[];
    }
  }) => void;
  onUploadError?: (error: Error) => void;
}
```

**State:**
- `isUploading`: Boolean indicating if a file is currently being uploaded
- `uploadProgress`: Number (0-100) indicating upload progress
- `error`: Error object if upload fails

**Usage Example:**
```tsx
<FileUpload 
  onUploadSuccess={(data) => {
    console.log('Upload successful:', data);
    router.push(`/datasets/${data.datasetId}/metadata`);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

**Implementation Details:**
- Uses React Dropzone for drag-and-drop functionality
- Validates file types (only .csv, .xlsx, .xls allowed)
- Shows visual feedback during upload process
- Handles file processing on the server via API call
- Displays error messages for invalid files or failed uploads

### FilePreview

Displays a preview of the uploaded file with statistics.

**Props:**
```typescript
interface FilePreviewProps {
  fileStats: {
    filename: string;
    fileSize: number;
    rowCount: number;
    columns: string[];
  };
  datasetId: string;
}
```

**Usage Example:**
```tsx
<FilePreview 
  fileStats={{
    filename: "example.csv",
    fileSize: 1024,
    rowCount: 100,
    columns: ["id", "name", "age"]
  }}
  datasetId="123e4567-e89b-12d3-a456-426614174000"
/>
```

**Implementation Details:**
- Displays file name, size (formatted), row count, and column names
- Provides a "Continue to Metadata" button that links to the metadata page
- Uses responsive design for different screen sizes

## Metadata Components

### MetadataEditor

A form component for editing dataset metadata with bilingual support.

**Props:**
```typescript
interface MetadataEditorProps {
  datasetId: string;
  initialMetadata?: {
    title?: string;
    titleArabic?: string;
    description?: string;
    descriptionArabic?: string;
    tags?: string[];
    category?: string;
    isAIGenerated?: boolean;
  };
  onSaveSuccess?: (metadata: any) => void;
  redirectUrl?: string;
}
```

**State:**
- `activeTab`: String ('english' or 'arabic') indicating the active language tab
- `metadata`: Object containing all metadata fields
- `isSaving`: Boolean indicating if metadata is being saved
- `isGenerating`: Boolean indicating if AI is generating metadata
- `errors`: Object containing validation errors
- `successMessage`: String containing success message after save

**Usage Example:**
```tsx
<MetadataEditor
  datasetId="123e4567-e89b-12d3-a456-426614174000"
  initialMetadata={{
    title: "Example Dataset",
    description: "This is an example dataset",
    tags: ["example", "test"],
    category: "Education"
  }}
  redirectUrl="/datasets/123e4567-e89b-12d3-a456-426614174000"
/>
```

**Implementation Details:**
- Tabbed interface for switching between English and Arabic content
- Form validation for required fields
- Tag input with add/remove functionality
- Category selection dropdown
- AI generation button for automatic metadata creation
- Save and Submit buttons with appropriate actions
- Error handling and success messages

### TagInput

A component for managing tags with add/remove functionality.

**Props:**
```typescript
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  error?: string;
}
```

**State:**
- `inputValue`: String containing the current input value
- `isInputFocused`: Boolean indicating if the input is focused

**Usage Example:**
```tsx
<TagInput
  tags={["education", "government"]}
  onChange={(newTags) => setMetadata({...metadata, tags: newTags})}
  placeholder="Add a tag and press Enter"
  maxTags={10}
  error={errors.tags}
/>
```

**Implementation Details:**
- Input field for adding new tags
- Visual display of existing tags with remove button
- Validation for maximum number of tags
- Prevents duplicate tags
- Keyboard support (Enter to add, Backspace to remove)

## Dataset Components

### DatasetList

A component that displays a list of datasets with filtering and search.

**Props:**
```typescript
interface DatasetListProps {
  initialDatasets?: Dataset[];
  isLoading?: boolean;
}
```

**State:**
- `datasets`: Array of dataset objects
- `isLoading`: Boolean indicating if datasets are being loaded
- `searchTerm`: String containing the current search term
- `statusFilter`: String containing the current status filter
- `pagination`: Object containing pagination information

**Usage Example:**
```tsx
<DatasetList 
  initialDatasets={serverDatasets} 
  isLoading={false}
/>
```

**Implementation Details:**
- Table layout with sortable columns
- Search input for filtering by filename
- Status filter dropdown
- Pagination controls
- Status badges with appropriate colors
- Action buttons for each dataset
- Client-side filtering and sorting

### DatasetDetail

A component that displays detailed information about a dataset.

**Props:**
```typescript
interface DatasetDetailProps {
  dataset: {
    id: string;
    filename: string;
    fileSize: number;
    rowCount: number;
    columns: string[];
    createdAt: string;
    updatedAt: string;
    versions: {
      id: string;
      versionNumber: number;
      status: string;
      createdAt: string;
    }[];
    metadata?: {
      id: string;
      title: string;
      titleArabic?: string;
      description: string;
      descriptionArabic?: string;
      tags: string[];
      category: string;
      isAIGenerated: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}
```

**Usage Example:**
```tsx
<DatasetDetail dataset={dataset} />
```

**Implementation Details:**
- Displays file information (name, size, creation date)
- Shows column names and count
- Displays metadata if available
- Shows version history with status badges
- Provides action buttons for editing metadata and submitting for review
- Responsive layout for different screen sizes

## Submission Components

### SubmitForm

A form component for submitting a dataset for review.

**Props:**
```typescript
interface SubmitFormProps {
  datasetId: string;
  versionId: string;
}
```

**State:**
- `comments`: String containing reviewer comments
- `isSubmitting`: Boolean indicating if submission is in progress
- `error`: String containing error message if submission fails
- `success`: Boolean indicating if submission was successful

**Usage Example:**
```tsx
<SubmitForm 
  datasetId="123e4567-e89b-12d3-a456-426614174000"
  versionId="123e4567-e89b-12d3-a456-426614174001"
/>
```

**Implementation Details:**
- Textarea for optional reviewer comments
- Submit button with loading state
- Cancel button that returns to dataset page
- Error handling and success messages
- Redirects to dataset page after successful submission

## UI Components

### StatusBadge

A component that displays a colored badge for dataset status.

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
  className?: string;
}
```

**Usage Example:**
```tsx
<StatusBadge status="pending_review" />
```

**Implementation Details:**
- Color-coded badges for different statuses:
  - Draft: Gray
  - Pending Review: Yellow
  - Approved: Green
  - Published: Blue
  - Rejected: Red
- Responsive design with appropriate padding
- Optional custom className for styling

### LoadingSpinner

A component that displays a loading spinner.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}
```

**Usage Example:**
```tsx
<LoadingSpinner size="medium" color="primary" />
```

**Implementation Details:**
- SVG-based spinner with animation
- Size variants (small, medium, large)
- Color variants (primary, secondary, white)
- Optional custom className for styling

### ErrorMessage

A component that displays an error message.

**Props:**
```typescript
interface ErrorMessageProps {
  message: string;
  className?: string;
}
```

**Usage Example:**
```tsx
<ErrorMessage message="An error occurred while uploading the file." />
```

**Implementation Details:**
- Red text with appropriate icon
- Responsive design with proper spacing
- Optional custom className for styling

### SuccessMessage

A component that displays a success message.

**Props:**
```typescript
interface SuccessMessageProps {
  message: string;
  className?: string;
}
```

**Usage Example:**
```tsx
<SuccessMessage message="Metadata saved successfully!" />
```

**Implementation Details:**
- Green text with appropriate icon
- Responsive design with proper spacing
- Optional custom className for styling

## Component Composition

The components are designed to be composable and reusable. Here's an example of how they work together in the dataset workflow:

1. User interacts with `FileUpload` to upload a dataset
2. On successful upload, `FilePreview` is displayed
3. User proceeds to `MetadataEditor` to add or generate metadata
4. After saving metadata, user views the dataset in `DatasetDetail`
5. User submits the dataset using `SubmitForm`
6. All datasets are viewable in the `DatasetList` on the dashboard

This modular approach allows for easy maintenance and extension of the application. 