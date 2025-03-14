# Datasets API

The Datasets API provides endpoints for managing datasets, including listing, retrieving, updating, and publishing datasets.

## Endpoints

### List Datasets

```
GET /api/datasets
```

Retrieves a list of datasets with optional filtering and pagination.

#### Query Parameters

- `status`: Filter by dataset status (optional, e.g., "draft", "published", "pending_review")
- `category`: Filter by dataset category (optional)
- `search`: Search term to filter datasets by title or description (optional)
- `page`: Page number for pagination (optional, default: 1)
- `limit`: Number of datasets per page (optional, default: 10)
- `sortBy`: Field to sort by (optional, default: "updatedAt")
- `sortOrder`: Sort order, either "asc" or "desc" (optional, default: "desc")

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": "64f7e8a12b3c4d5e6f7a8b9c",
        "title": "US Population Demographics 2020",
        "description": "This dataset contains demographic information...",
        "category": "Demographics",
        "status": "published",
        "rowCount": 1500,
        "fileSize": 1024567,
        "createdAt": "2023-09-05T14:30:45Z",
        "updatedAt": "2023-09-05T16:45:30Z",
        "createdBy": "user123",
        "version": 2
      },
      {
        "id": "64f7e8a12b3c4d5e6f7a8b9d",
        "title": "Global Climate Data 2022",
        "description": "Climate measurements from around the world...",
        "category": "Environment",
        "status": "pending_review",
        "rowCount": 5200,
        "fileSize": 3567890,
        "createdAt": "2023-09-04T10:15:20Z",
        "updatedAt": "2023-09-04T11:30:15Z",
        "createdBy": "user456",
        "version": 1
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Get Dataset

```
GET /api/datasets/:datasetId
```

Retrieves detailed information about a specific dataset.

#### Parameters

- `datasetId`: ID of the dataset to retrieve (required)
- `version`: Version of the dataset to retrieve (optional, default: latest)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "dataset": {
      "id": "64f7e8a12b3c4d5e6f7a8b9c",
      "title": "US Population Demographics 2020",
      "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
      "category": "Demographics",
      "tags": ["demographics", "census", "population", "united states", "2020"],
      "status": "published",
      "rowCount": 1500,
      "columnNames": ["id", "age_group", "gender", "ethnicity", "state", "population"],
      "fileSize": 1024567,
      "fileType": "text/csv",
      "createdAt": "2023-09-05T14:30:45Z",
      "updatedAt": "2023-09-05T16:45:30Z",
      "publishedAt": "2023-09-05T16:45:30Z",
      "createdBy": {
        "id": "user123",
        "name": "John Doe"
      },
      "reviewedBy": {
        "id": "supervisor456",
        "name": "Jane Smith"
      },
      "version": 2,
      "downloadUrl": "/api/datasets/64f7e8a12b3c4d5e6f7a8b9c/download",
      "previewUrl": "/api/datasets/64f7e8a12b3c4d5e6f7a8b9c/preview"
    }
  }
}
```

### Update Dataset Status

```
PATCH /api/datasets/:datasetId/status
```

Updates the status of a dataset.

#### Request

```json
{
  "status": "pending_review",
  "comment": "Ready for supervisor review"
}
```

#### Parameters

- `datasetId`: ID of the dataset to update (required)
- `status`: New status for the dataset (required, one of: "draft", "pending_review", "published", "rejected")
- `comment`: Optional comment explaining the status change

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "pending_review",
    "previousStatus": "draft",
    "updatedAt": "2023-09-05T16:30:45Z",
    "updatedBy": "user123"
  }
}
```

### Publish Dataset

```
POST /api/datasets/:datasetId/publish
```

Publishes a dataset, making it available to users.

#### Request

```json
{
  "reviewComment": "Approved for publication",
  "notifyCreator": true
}
```

#### Parameters

- `datasetId`: ID of the dataset to publish (required)
- `reviewComment`: Optional comment from the reviewer
- `notifyCreator`: Boolean indicating whether to notify the dataset creator (default: true)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "published",
    "previousStatus": "pending_review",
    "publishedAt": "2023-09-05T16:45:30Z",
    "publishedBy": "supervisor456",
    "version": 2
  }
}
```

### Get Dataset Versions

```
GET /api/datasets/:datasetId/versions
```

Retrieves the version history of a dataset.

#### Parameters

- `datasetId`: ID of the dataset to retrieve versions for (required)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": 2,
        "status": "published",
        "updatedAt": "2023-09-05T16:45:30Z",
        "updatedBy": "user123",
        "changes": ["Updated metadata", "Fixed column names"]
      },
      {
        "version": 1,
        "status": "published",
        "updatedAt": "2023-09-01T10:30:15Z",
        "updatedBy": "user123",
        "changes": ["Initial publication"]
      }
    ]
  }
}
```

### Download Dataset

```
GET /api/datasets/:datasetId/download
```

Downloads the dataset file.

#### Parameters

- `datasetId`: ID of the dataset to download (required)
- `version`: Version of the dataset to download (optional, default: latest)
- `format`: Format to download the dataset in (optional, default: original format)

#### Response

The response is a file download with appropriate Content-Type and Content-Disposition headers.

### Get Dataset Preview

```
GET /api/datasets/:datasetId/preview
```

Retrieves a preview of the dataset contents.

#### Parameters

- `datasetId`: ID of the dataset to preview (required)
- `limit`: Maximum number of rows to include in the preview (optional, default: 100)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "columns": ["id", "age_group", "gender", "ethnicity", "state", "population"],
    "rows": [
      {
        "id": 1,
        "age_group": "18-24",
        "gender": "Male",
        "ethnicity": "Caucasian",
        "state": "California",
        "population": 1250000
      },
      {
        "id": 2,
        "age_group": "18-24",
        "gender": "Female",
        "ethnicity": "Caucasian",
        "state": "California",
        "population": 1300000
      }
      // Additional rows...
    ],
    "totalRows": 1500,
    "previewRows": 100
  }
}
```

## Error Codes

- `DATASET_NOT_FOUND` - The specified dataset does not exist
- `VERSION_NOT_FOUND` - The specified version does not exist
- `INVALID_STATUS` - The specified status is not valid
- `UNAUTHORIZED_ACTION` - The user is not authorized to perform the requested action
- `INVALID_TRANSITION` - The requested status transition is not allowed 