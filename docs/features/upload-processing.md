# Dataset Upload and Processing

This document describes the dataset upload and processing feature of the Dataset Publishing Platform.

## Overview

The dataset upload and processing feature allows users to upload CSV and Excel files, validate their contents, and extract metadata such as row count, column names, and file size. The feature provides a user-friendly interface for uploading files, with drag-and-drop functionality and progress indicators.

## User Flow

1. User navigates to the upload page
2. User selects or drags and drops a CSV or Excel file
3. The file is validated for format and size
4. If valid, the file is uploaded to the server
5. The server processes the file to extract metadata
6. The user is shown a preview of the file contents and metadata
7. The user can proceed to the metadata editing step or cancel the upload

## Components

The Upload and Processing feature consists of three main components:

1. **File Upload Component**: A drag-and-drop interface for file uploads, validating file type and size.
2. **File Validation Component**: Validates the contents of the uploaded file, checking for issues like missing values and invalid data types.
3. **File Preview Component**: Displays a preview of the uploaded file's contents and metadata, including:
   - Basic file information (filename, file size, row count, column names)
   - Data table preview showing a sample of the actual data rows (up to 10 rows by default)
   - Toggle functionality to show/hide the detailed data preview

![File Upload Component](../assets/file-upload.png)

### File Validation Component

The file validation component validates the uploaded file's contents, checking for issues such as missing values, invalid data types, and structural problems. It displays validation results with warnings and errors.

![File Validation Component](../assets/file-validation.png)

### File Preview Component

The file preview component displays a preview of the uploaded file's contents, including a table of data and summary statistics. It shows information such as row count, column names, and file size.

![File Preview Component](../assets/file-preview.png)

## API Endpoints

The Upload and Processing feature exposes the following API endpoints:

1. **Upload File**
   - **Endpoint**: `POST /api/upload/file`
   - **Description**: Uploads a dataset file and extracts metadata
   - **Request**: `multipart/form-data` with:
     - `file` (required): The dataset file to upload
     - `description` (optional): A description of the dataset
   - **Success Response**: 
     ```json
     {
       "success": true,
       "data": {
         "fileId": "file_123456",
         "fileName": "sample_dataset.csv",
         "fileSize": 1024,
         "rowCount": 100,
         "columns": ["id", "name", "age", "city"]
       }
     }
     ```

2. **Validate File**
   - **Endpoint**: `POST /api/upload/validate`
   - **Description**: Validates a dataset file without permanently uploading it
   - **Request**: `multipart/form-data` with:
     - `file` (required): The dataset file to validate
   - **Success Response**: 
     ```json
     {
       "success": true,
       "data": {
         "isValid": true,
         "validationMessages": []
       }
     }
     ```

3. **Dataset Preview**
   - **Endpoint**: `GET /api/datasets/:datasetId/preview`
   - **Description**: Retrieves a preview of the dataset's contents
   - **Parameters**:
     - `datasetId` (path parameter): The ID of the dataset
     - `rows` (query parameter, optional): Maximum number of rows to return (default: 10)
   - **Success Response**:
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

## Implementation Details

### File Upload Process

The file upload process follows these steps:

1. User selects a file through the drag-and-drop interface or file browser
2. Client-side validation checks file type and size
3. File is sent to the server via a multipart form request
4. Server processes the file and extracts metadata
5. File is stored in the designated storage location
6. Metadata is stored in the database
7. Preview data is generated and made available through the API
8. Success response is sent back to the client with file metadata

### File Processing

The platform supports processing of CSV and Excel files:

1. **CSV Processing**:
   - Uses the Papa Parse library to parse CSV files
   - Extracts headers from the first row
   - Counts the total number of rows
   - Validates data types and structure

2. **Excel Processing**:
   - Uses the xlsx library to read Excel files
   - Supports multiple sheets (first sheet is used by default)
   - Extracts headers from the first row
   - Counts the total number of rows
   - Validates data types and structure

3. **Data Preview Generation**:
   - Creates a sample of the data (default: first 10 rows)
   - Preserves column types and formatting
   - Makes the preview available through a dedicated API endpoint
   - Allows users to view the actual data before proceeding with metadata generation

### File Validation

The file validation service checks for the following issues:

- Invalid file format
- Empty file
- Missing column headers
- Inconsistent column count
- Missing values in required columns
- Invalid data types
- Duplicate rows
- Character encoding issues

### Error Handling

The feature implements comprehensive error handling:

- Client-side validation errors are displayed immediately
- Network errors during upload are caught and displayed
- Server-side processing errors are returned with descriptive messages
- Validation errors are categorized by severity (warning, error)

## Configuration Options

The feature can be configured with the following options:

- Maximum file size (default: 50MB)
- Accepted file types (default: .csv, .xlsx, .xls)
- Required columns (configurable per dataset type)
- Validation rules (configurable per dataset type)
- Preview row limit (default: 100 rows)

## Security Considerations

The feature implements several security measures:

- File type validation to prevent upload of malicious files
- File size limits to prevent denial of service attacks
- Content validation to detect potentially harmful data
- Temporary file storage with automatic cleanup
- Access control to restrict upload permissions

## Performance Considerations

The feature is optimized for performance:

- Streaming file upload to handle large files
- Chunked file processing to minimize memory usage
- Background processing for time-consuming operations
- Progress indicators for long-running operations
- Caching of processed data for quick access

## Accessibility

The feature is designed with accessibility in mind:

- Keyboard navigation for all interactive elements
- Screen reader support with ARIA attributes
- High contrast mode for visually impaired users
- Error messages that are clear and descriptive
- Alternative methods for file selection (drag-and-drop and button click)

## Future Enhancements

Planned enhancements for the feature include:

- Support for additional file formats (JSON, XML, etc.)
- Advanced validation rules with custom expressions
- Data transformation during upload (column renaming, type conversion, etc.)
- Batch upload of multiple files
- Resume interrupted uploads 