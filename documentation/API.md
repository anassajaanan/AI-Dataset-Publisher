# Dataset Publishing Platform - API Documentation

This document provides detailed information about the API endpoints available in the Dataset Publishing Platform.

## Base URL

All API endpoints are relative to the base URL of the application:

```
/api
```

## Authentication

Currently, the API does not implement authentication. Future versions will include JWT-based authentication.

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## API Endpoints

### Dataset Management

#### Upload Dataset

Uploads and processes a dataset file (CSV or Excel).

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

**Request Body**:
```
file: [Binary File Data]
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "datasetId": "uuid-string",
    "fileStats": {
      "filename": "example.csv",
      "fileSize": 1024,
      "rowCount": 100,
      "columns": ["column1", "column2", "column3"]
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file format or missing file
- `500 Internal Server Error`: Server processing error

#### List Datasets

Retrieves a list of datasets with optional filtering.

- **URL**: `/datasets`
- **Method**: `GET`
- **Query Parameters**:
  - `status` (optional): Filter by status (draft, pending_review, approved, published, rejected)
  - `search` (optional): Search term for dataset filename
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of items per page (default: 10)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": "uuid-string",
        "filename": "example.csv",
        "fileSize": 1024,
        "rowCount": 100,
        "columns": ["column1", "column2", "column3"],
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z",
        "latestVersion": {
          "id": "uuid-string",
          "versionNumber": 1,
          "status": "draft",
          "createdAt": "2023-01-01T00:00:00Z"
        },
        "hasMetadata": true
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Error Response**:
- `500 Internal Server Error`: Server processing error

#### Get Dataset by ID

Retrieves a specific dataset by ID.

- **URL**: `/datasets/[id]`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Dataset ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "dataset": {
      "id": "uuid-string",
      "filename": "example.csv",
      "fileSize": 1024,
      "rowCount": 100,
      "columns": ["column1", "column2", "column3"],
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "versions": [
        {
          "id": "uuid-string",
          "versionNumber": 1,
          "status": "draft",
          "createdAt": "2023-01-01T00:00:00Z"
        }
      ],
      "metadata": {
        "id": "uuid-string",
        "title": "Example Dataset",
        "titleArabic": "مثال مجموعة البيانات",
        "description": "This is an example dataset",
        "descriptionArabic": "هذه مجموعة بيانات مثال",
        "tags": ["example", "test"],
        "category": "Education",
        "isAIGenerated": true,
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Dataset not found
- `500 Internal Server Error`: Server processing error

### Metadata Management

#### Get Dataset Metadata

Retrieves metadata for a specific dataset.

- **URL**: `/datasets/[id]/metadata`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: Dataset ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "uuid-string",
      "title": "Example Dataset",
      "titleArabic": "مثال مجموعة البيانات",
      "description": "This is an example dataset",
      "descriptionArabic": "هذه مجموعة بيانات مثال",
      "tags": ["example", "test"],
      "category": "Education",
      "isAIGenerated": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "datasetId": "uuid-string",
      "versionId": "uuid-string"
    }
  }
}
```

**Error Responses**:
- `404 Not Found`: Dataset or metadata not found
- `500 Internal Server Error`: Server processing error

#### Update Dataset Metadata

Updates or creates metadata for a specific dataset.

- **URL**: `/datasets/[id]/metadata`
- **Method**: `PUT`
- **URL Parameters**:
  - `id`: Dataset ID
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "title": "Updated Dataset Title",
  "titleArabic": "عنوان مجموعة البيانات المحدثة",
  "description": "This is an updated description",
  "descriptionArabic": "هذا وصف محدث",
  "tags": ["updated", "example"],
  "category": "Government",
  "isAIGenerated": false,
  "versionId": "uuid-string" // Optional, if updating for a specific version
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "uuid-string",
      "title": "Updated Dataset Title",
      "titleArabic": "عنوان مجموعة البيانات المحدثة",
      "description": "This is an updated description",
      "descriptionArabic": "هذا وصف محدث",
      "tags": ["updated", "example"],
      "category": "Government",
      "isAIGenerated": false,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z",
      "datasetId": "uuid-string",
      "versionId": "uuid-string"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `404 Not Found`: Dataset not found
- `500 Internal Server Error`: Server processing error

#### Generate Metadata with AI

Generates metadata for a dataset using AI.

- **URL**: `/metadata`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "datasetId": "uuid-string",
  "language": "en" // or "ar" for Arabic
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "AI Generated Title",
      "description": "This is an AI-generated description based on the dataset content.",
      "tags": ["ai", "generated", "tags"],
      "category": "Technology"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing datasetId or invalid language
- `404 Not Found`: Dataset not found
- `500 Internal Server Error`: AI generation error

### Dataset Submission

#### Submit Dataset for Review

Submits a dataset for review.

- **URL**: `/datasets/[id]/submit`
- **Method**: `POST`
- **URL Parameters**:
  - `id`: Dataset ID
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "versionId": "uuid-string",
  "comments": "Please review this dataset for publication."
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Dataset submitted for review successfully",
    "version": {
      "id": "uuid-string",
      "versionNumber": 1,
      "status": "pending_review",
      "updatedAt": "2023-01-01T12:00:00Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing versionId or dataset not ready for submission
- `404 Not Found`: Dataset or version not found
- `500 Internal Server Error`: Server processing error

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_FILE_FORMAT` | The uploaded file is not in a supported format |
| `FILE_TOO_LARGE` | The uploaded file exceeds the maximum size limit |
| `MISSING_REQUIRED_FIELD` | A required field is missing in the request |
| `DATASET_NOT_FOUND` | The requested dataset does not exist |
| `VERSION_NOT_FOUND` | The requested dataset version does not exist |
| `METADATA_NOT_FOUND` | No metadata exists for the dataset |
| `INVALID_STATUS_TRANSITION` | The requested status change is not allowed |
| `AI_GENERATION_FAILED` | The AI metadata generation process failed |
| `DATABASE_ERROR` | An error occurred while accessing the database |
| `SERVER_ERROR` | An unexpected server error occurred |

## Rate Limiting

Currently, the API does not implement rate limiting. Future versions will include rate limiting to prevent abuse.

## Versioning

The current API version is v1. All endpoints are implicitly v1 and do not require a version prefix.

## Changelog

### v1.0.0 (Current)
- Initial API implementation
- Dataset upload, retrieval, and submission
- Metadata generation and management 