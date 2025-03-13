# File Preview Component

## Overview

The File Preview component displays metadata and information about an uploaded dataset file. It provides users with a summary of the file's characteristics and allows them to preview the actual data content through an integrated Data Table Preview component.

## Features

- Displays file metadata (filename, file size, row count, column names)
- Formats file size in human-readable format (KB, MB, GB)
- Provides a toggle button to show/hide the data preview
- Integrates with the Data Table Preview component to show sample data rows
- Includes a link to view the full dataset details

## Usage

```tsx
import FilePreview from '@/components/preview/FilePreview';

// In your component
<FilePreview 
  fileData={{
    fileId: "file_123456",
    fileName: "sample_dataset.csv",
    fileSize: 1024000,
    rowCount: 100,
    columns: ["id", "name", "age", "city"]
  }} 
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fileData` | object | Yes | Object containing file metadata |
| `fileData.fileId` | string | Yes | Unique identifier for the file |
| `fileData.fileName` | string | Yes | Name of the uploaded file |
| `fileData.fileSize` | number | Yes | Size of the file in bytes |
| `fileData.rowCount` | number | Yes | Number of rows in the dataset |
| `fileData.columns` | string[] | Yes | Array of column names in the dataset |

## Component Structure

The File Preview component consists of two main parts:

1. **File Information Section**: Displays metadata about the file
2. **Data Preview Section**: Shows a sample of the actual data rows (toggled by a button)

## Example

```tsx
// Example usage in the Upload component
import React from 'react';
import FilePreview from '@/components/preview/FilePreview';

const UploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const handleFileUpload = async (file) => {
    // Upload file and get metadata
    const response = await uploadFile(file);
    setUploadedFile(response.data);
  };
  
  return (
    <div className="upload-page">
      <h1>Upload Dataset</h1>
      
      <FileUpload onFileUpload={handleFileUpload} />
      
      {uploadedFile && (
        <FilePreview fileData={uploadedFile} />
      )}
    </div>
  );
};
```

## Styling

The component uses Tailwind CSS for styling and is designed to be responsive. It features a clean, card-based layout with clear typography and appropriate spacing.

## Integration with Data Table Preview

The File Preview component integrates with the Data Table Preview component to show sample data rows. This integration is handled through:

1. A toggle button that shows/hides the data preview
2. Passing the `fileId` to the Data Table Preview component
3. Setting a default maximum number of rows to display (10)

## Accessibility

- The component uses semantic HTML elements
- The toggle button is keyboard accessible
- Color contrast meets WCAG AA standards
- Appropriate ARIA attributes are used where necessary

## Future Enhancements

- Add ability to download the file directly from the preview
- Include data quality metrics (missing values, data types)
- Add visualization options for numeric columns
- Support for previewing different file formats
- Enhanced error handling for corrupted files 