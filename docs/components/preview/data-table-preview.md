# Data Table Preview Component

## Overview

The Data Table Preview component displays a sample of the actual data rows from an uploaded dataset. It provides users with a visual representation of the dataset's structure and content before proceeding with metadata generation and publishing.

## Features

- Displays a configurable number of sample rows from the dataset (default: 10)
- Shows column headers and data in a structured table format
- Indicates the total number of rows in the dataset
- Handles loading states with a spinner
- Displays appropriate error messages if data cannot be loaded
- Responsive design that works on various screen sizes

## Usage

```tsx
import DataTablePreview from '@/components/preview/DataTablePreview';

// In your component
<DataTablePreview 
  datasetId="dataset_123456"
  maxRows={10} 
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `datasetId` | string | Yes | - | The ID of the dataset to preview |
| `maxRows` | number | No | 10 | Maximum number of rows to display |

## API Integration

The component fetches data from the `/api/datasets/:datasetId/preview` endpoint, which returns:

```json
{
  "success": true,
  "data": {
    "headers": ["id", "name", "age", "city"],
    "rows": [
      [1, "John Doe", 28, "New York"],
      [2, "Jane Smith", 32, "London"]
    ],
    "totalRows": 100
  }
}
```

## States

The component handles the following states:

1. **Loading**: Displays a spinner while data is being fetched
2. **Error**: Shows an error message if data fetching fails
3. **Empty**: Displays a message when no preview data is available
4. **Data**: Renders the data table with headers and rows

## Example

```tsx
// Example usage in the FilePreview component
import React, { useState } from 'react';
import DataTablePreview from '@/components/preview/DataTablePreview';

const FilePreview = ({ fileData }) => {
  const [showDataPreview, setShowDataPreview] = useState(false);
  
  return (
    <div className="file-preview">
      <h2>File Information</h2>
      <div className="file-info">
        <p><strong>Filename:</strong> {fileData.fileName}</p>
        <p><strong>Size:</strong> {formatFileSize(fileData.fileSize)}</p>
        <p><strong>Rows:</strong> {fileData.rowCount}</p>
        <p><strong>Columns:</strong> {fileData.columns.join(', ')}</p>
      </div>
      
      <button 
        onClick={() => setShowDataPreview(!showDataPreview)}
        className="preview-toggle-button"
      >
        {showDataPreview ? 'Hide Data Preview' : 'Show Data Preview'}
      </button>
      
      {showDataPreview && (
        <DataTablePreview 
          datasetId={fileData.fileId} 
          maxRows={10}
        />
      )}
    </div>
  );
};
```

## Styling

The component uses Tailwind CSS for styling and is designed to be responsive. The table has alternating row colors for better readability and horizontal scrolling for tables with many columns.

## Accessibility

- The table uses proper semantic HTML elements (`<table>`, `<thead>`, `<tbody>`, etc.)
- Loading and error states are properly announced to screen readers
- Color contrast meets WCAG AA standards

## Future Enhancements

- Add pagination to navigate through larger datasets
- Allow sorting by clicking on column headers
- Add filtering capabilities
- Support for displaying different data types with appropriate formatting
- Export functionality for the preview data 