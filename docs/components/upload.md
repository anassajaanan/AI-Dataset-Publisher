# Upload Components

This section documents the components used for file upload and validation in the Dataset Publishing Platform.

## FileUpload Component

The `FileUpload` component provides a drag-and-drop interface for uploading dataset files.

### Usage

```tsx
import { FileUpload } from '@/components/upload/FileUpload';

const MyComponent = () => {
  const handleUploadComplete = (fileData) => {
    console.log('Upload complete:', fileData);
  };

  return (
    <FileUpload 
      onUploadComplete={handleUploadComplete}
      maxFileSize={10 * 1024 * 1024} // 10MB
      acceptedFileTypes={['.csv', '.xlsx', '.xls']}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | `(fileData: FileData) => void` | Required | Callback function called when upload is complete |
| `onUploadError` | `(error: Error) => void` | `undefined` | Callback function called when an error occurs during upload |
| `maxFileSize` | `number` | `50 * 1024 * 1024` (50MB) | Maximum allowed file size in bytes |
| `acceptedFileTypes` | `string[]` | `['.csv', '.xlsx', '.xls']` | Array of accepted file extensions |
| `multiple` | `boolean` | `false` | Whether to allow multiple file uploads |
| `disabled` | `boolean` | `false` | Whether the upload component is disabled |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Drag-and-drop file upload
- File type validation
- File size validation
- Upload progress indicator
- Error handling and display
- Accessibility support with keyboard navigation
- Responsive design for different screen sizes

### Implementation Details

The `FileUpload` component uses the `react-dropzone` library for drag-and-drop functionality and handles file validation and upload through the `/api/upload/file` endpoint. It displays appropriate error messages for invalid files and shows upload progress during the upload process.

## FileValidation Component

The `FileValidation` component validates uploaded files and displays validation results.

### Usage

```tsx
import { FileValidation } from '@/components/upload/FileValidation';

const MyComponent = () => {
  const handleValidationComplete = (validationResults) => {
    console.log('Validation complete:', validationResults);
  };

  return (
    <FileValidation 
      file={myFile}
      onValidationComplete={handleValidationComplete}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `File` | Required | The file to validate |
| `onValidationComplete` | `(results: ValidationResults) => void` | Required | Callback function called when validation is complete |
| `onValidationError` | `(error: Error) => void` | `undefined` | Callback function called when an error occurs during validation |
| `showResults` | `boolean` | `true` | Whether to display validation results |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- File format validation
- Content structure validation
- Missing value detection
- Data type validation
- Detailed validation results display
- Warning and error categorization

### Implementation Details

The `FileValidation` component sends the file to the `/api/upload/validate` endpoint for validation and displays the validation results, including any warnings or errors. It categorizes validation issues by severity and provides detailed information about each issue.

## UploadProgress Component

The `UploadProgress` component displays the progress of a file upload.

### Usage

```tsx
import { UploadProgress } from '@/components/upload/UploadProgress';

const MyComponent = () => {
  return (
    <UploadProgress 
      progress={75}
      fileName="example_dataset.csv"
      fileSize={1024567}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | Required | Upload progress percentage (0-100) |
| `fileName` | `string` | Required | Name of the file being uploaded |
| `fileSize` | `number` | Required | Size of the file in bytes |
| `status` | `'uploading' \| 'processing' \| 'complete' \| 'error'` | `'uploading'` | Current status of the upload |
| `error` | `string` | `''` | Error message to display if status is 'error' |
| `className` | `string` | `''` | Additional CSS classes to apply to the component |

### Features

- Visual progress bar
- Upload status display
- File information display
- Error message display
- Cancel upload button
- Responsive design

### Implementation Details

The `UploadProgress` component displays a progress bar and status information during file upload. It shows the file name, size, and current progress percentage. When the upload is complete, it displays a success message, and when an error occurs, it displays the error message. 