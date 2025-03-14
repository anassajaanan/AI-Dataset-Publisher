# Upload API

The Upload API provides endpoints for uploading and processing dataset files.

## Endpoints

### Upload Dataset File

```
POST /api/upload/file
```

Uploads a dataset file (CSV or Excel) and processes it to extract metadata.

#### Request

- Content-Type: `multipart/form-data`
- Body:
  - `file`: The dataset file to upload (required)
  - `description`: Optional description of the dataset

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "fileId": "64f7e8a12b3c4d5e6f7a8b9c",
    "fileName": "example_dataset.csv",
    "fileSize": 1024567,
    "fileType": "text/csv",
    "rowCount": 1500,
    "columnNames": ["id", "name", "age", "city"],
    "previewUrl": "/api/datasets/64f7e8a12b3c4d5e6f7a8b9c/preview"
  }
}
```

**Error (400 Bad Request)**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Invalid file type. Only CSV and Excel files are supported."
  }
}
```

### Validate Dataset File

```
POST /api/upload/validate
```

Validates a dataset file without uploading it permanently.

#### Request

- Content-Type: `multipart/form-data`
- Body:
  - `file`: The dataset file to validate (required)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "fileType": "text/csv",
    "rowCount": 1500,
    "columnNames": ["id", "name", "age", "city"],
    "validationMessages": []
  }
}
```

**Validation Issues (200 OK)**

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "fileType": "text/csv",
    "rowCount": 1500,
    "columnNames": ["id", "name", "age", "city"],
    "validationMessages": [
      {
        "type": "warning",
        "message": "Missing values detected in column 'age'",
        "details": {
          "column": "age",
          "rowsAffected": 15
        }
      }
    ]
  }
}
```

### Get Upload Status

```
GET /api/upload/status/:uploadId
```

Retrieves the status of an ongoing or completed upload.

#### Parameters

- `uploadId`: The ID of the upload (required)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "uploadId": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "completed",
    "progress": 100,
    "fileName": "example_dataset.csv",
    "fileSize": 1024567,
    "processingTime": 2.5,
    "completedAt": "2023-09-05T14:30:45Z"
  }
}
```

**In Progress (200 OK)**

```json
{
  "success": true,
  "data": {
    "uploadId": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "processing",
    "progress": 75,
    "fileName": "example_dataset.csv",
    "fileSize": 1024567,
    "startedAt": "2023-09-05T14:30:00Z"
  }
}
```

## Error Codes

- `INVALID_FILE_TYPE` - The uploaded file is not a supported format (CSV or Excel)
- `FILE_TOO_LARGE` - The file exceeds the maximum allowed size
- `EMPTY_FILE` - The file contains no data
- `INVALID_STRUCTURE` - The file structure is invalid or corrupted
- `PROCESSING_ERROR` - An error occurred while processing the file 