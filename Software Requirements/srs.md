## 1. Software Requirements Specification (SRS)

### 1.1 Overview

The Dataset Publishing Platform is a modern web application that lets users:

- Upload datasets (CSV and Excel)
- Process and validate file contents
- Generate AI-powered metadata (title, description, tags, category) with bilingual support (English/Arabic)
- Manage the dataset publishing workflow with multi-step processes, versioning, and supervisor review

### 1.2 Functional Requirements

### Mini-Task 1: Dataset Upload and Processing System

- **File Upload Component**
    - Drag-and-drop and manual file selection
    - Accept CSV and Excel files only
- **File Processing Service**
    - Parse uploaded file to extract row count, column names, and file size
    - Validate file format and content
    - Return error messages for invalid files
- **Preview Component**
    - Display file information: row count, column names, file size
- **Database Schema**
    - Create models to store dataset metadata and file statistics
- **Error Handling**
    - Handle and display errors for invalid file uploads

### Mini-Task 2: AI-Powered Metadata Generation

- **Metadata Generation Service**
    - Integrate with an AI API (e.g., OpenAI or Hugging Face) to generate metadata
    - Extract title, description, tags, and category suggestions
    - Support bilingual generation (English and Arabic)
- **Metadata Editor UI**
    - Allow users to review and modify AI suggestions
    - Provide a save draft functionality with proper state management
- **Unit Testing**
    - Write tests for the metadata generation service to ensure quality

### Mini-Task 3: Publishing Workflow and Review System

- **Multi-step Publishing Workflow**
    - End-to-end process from dataset upload to final publishing
- **Supervisor Review Interface**
    - Enable supervisors to approve or request changes
- **Dataset Versioning**
    - Maintain version history of datasets
- **Dashboard**
    - Display all datasets with status indicators
    - Include search and filtering functionality
- **Documentation**
    - Document the overall architecture and design decisions

### 1.3 Non-Functional Requirements

- **Code Quality & Architecture**
    - Follow DRY principles, clean and maintainable code
    - Proper error handling and accessibility features
- **User Experience (UX)**
    - Intuitive UI using Shadcn components and Tailwind CSS for styling
- **Performance**
    - Efficient file parsing and metadata generation even for large datasets
- **Testing**
    - Unit tests for critical services (metadata generation, file validation)
- **Accessibility**
    - Implement accessibility features on interactive elements (e.g., tabindex, aria-labels)

---

## 2. Detailed Task Breakdown and Pseudocode

### 2.1 Mini-Task 1: Dataset Upload and Processing System

### 2.1.1 Tasks & Steps

1. **Setup File Upload Component**
    - Create a Next.js page/component for file uploads.
    - Use Shadcn’s drag-and-drop component.
    - Validate file type (CSV/Excel) on the client side.
2. **Implement Backend API for File Upload**
    - Create an API route in Next.js to handle file uploads.
    - Use a middleware (e.g., multer) for file handling.
    - Return file metadata (size, type).
3. **Parse and Validate File Contents**
    - Implement a service to parse CSV/Excel.
    - Extract row count, column names, and validate content.
    - Return a JSON response with file stats or errors.
4. **Preview Component**
    - Create a component to display file stats (row count, column names, file size).
    - Handle error display if file validation fails.
5. **Database Schema**
    - Include fields: id, filename, rowCount, columns, fileSize, uploadDate, etc.

### 2.1.2 Pseudocode

```

Component FileUpload
  Render drag-and-drop area with Shadcn UI component
  On file drop:
    If file type is valid:
      Call API /api/upload with file
      Await response for file metadata
      If successful:
        Display preview component with file stats
      Else:
        Display error message
    Else:
      Display "Invalid file type" error

API Route /api/upload
  Accept file upload using middleware
  Parse file content using parser service
  Validate file (check type, count rows, extract column names)
  If valid:
    Save file metadata to DB
    Return file stats in response
  Else:
    Return error message

Service parseFile(file)
  If CSV:
    Use CSV parser to count rows, get column names
  Else if Excel:
    Use Excel parser to extract similar info
  Validate content and return metadata or error

```

---

### 2.2 Mini-Task 2: AI-Powered Metadata Generation

### 2.2.1 Tasks & Steps

1. **Metadata Generation Service**
    - Create an API route/service that sends file content to an AI API.
    - Generate metadata: title, description, tags, category.
    - Ensure bilingual support by sending language parameters.
2. **Metadata Editor Component**
    - Develop a form component for users to review and edit AI-generated metadata.
    - Use state management (e.g., React Context or Zustand) for draft saving.
3. **Draft Saving Functionality**
    - Implement a service to save metadata drafts in the database.
    - Provide UI feedback for successful saves.
4. **Unit Testing**
    - Write unit tests for the metadata generation logic using Jest.

### 2.2.2 Pseudocode

```

API Route /api/generate-metadata
  Accept dataset content and language preference
  Call AI API with dataset content to generate metadata
  Return metadata (title, description, tags, category)

Component MetadataEditor
  Fetch AI-generated metadata from /api/generate-metadata
  Render form fields pre-filled with metadata
  Allow user to modify values
  On save:
    Validate form data
    Call API /api/save-draft with updated metadata
    Display success/error message

Service saveDraft(metadata)
  Save metadata draft to DB (include dataset id, metadata fields)
  Return confirmation

```

---

### 2.3 Mini-Task 3: Publishing Workflow and Review System

### 2.3.1 Tasks & Steps

1. **Multi-Step Workflow Implementation**
    - Create a Next.js page that manages steps (upload, metadata, review, publish).
    - Use state management to persist data across steps.
2. **Supervisor Review Interface**
    - Build a dashboard view for supervisors to review datasets.
    - Include buttons for “Approve” or “Request Changes” with proper accessibility attributes.
3. **Dataset Versioning**
    - Implement logic to maintain and display different versions of a dataset.
    - Store version history in the database.
4. **Dashboard with Search & Filtering**
    - Develop a dashboard that lists all datasets with statuses.
    - Add search and filtering inputs (by status, date, category).
    - Use Tailwind CSS for styling.
5. **Documentation**
    - Write README with architecture overview, setup instructions, and design decisions.

### 2.3.2 Pseudocode

```

Component PublishingWorkflow
  Manage steps: FileUpload -> MetadataEditor -> Review -> Publish
  Use state management to persist form data between steps
  Render current step based on state
  Provide navigation buttons with accessibility attributes

Component SupervisorDashboard
  Fetch dataset list with statuses from API
  Render table/grid with dataset details and version info
  Provide search/filter inputs
  For each dataset:
    Render buttons for "Approve" and "Request Changes" (with onClick and onKeyDown handlers)

Service updateDatasetStatus(datasetId, newStatus)
  Update dataset status in DB
  Return confirmation

Service fetchDatasets(queryParams)
  Query DB for datasets with filters applied
  Return list of datasets

```

---

## 3. Code Example: File Upload Component

Below is an example of a complete Next.js file upload component using Shadcn UI and TailwindCSS. This code follows the guidelines with early returns, descriptive naming, accessibility features, and proper imports.

```tsx
tsx
// pages/upload.tsx
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

type FileStats = {
  rowCount: number;
  columns: string[];
  fileSize: number;
};

const FileUpload: React.FC = () => {
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    // Validate file type
    if (!file.type.match(/(csv|excel|spreadsheet)/i)) {
      setErrorMessage('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.fileStats) {
        setFileStats(response.data.fileStats);
        setErrorMessage('');
      } else {
        setErrorMessage('Failed to process file.');
      }
    } catch (error) {
      setErrorMessage('Error uploading file.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-300 p-8 text-center cursor-pointer"
        tabIndex={0}
        aria-label="File Upload Area"
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">Drag & drop a CSV or Excel file here, or click to select file</p>
      </div>
      {errorMessage && <p className="mt-4 text-red-500" role="alert">{errorMessage}</p>}
      {fileStats && (
        <div className="mt-4 p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">File Information</h2>
          <ul className="mt-2">
            <li>Row Count: {fileStats.rowCount}</li>
            <li>Columns: {fileStats.columns.join(', ')}</li>
            <li>File Size: {fileStats.fileSize} bytes</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

```