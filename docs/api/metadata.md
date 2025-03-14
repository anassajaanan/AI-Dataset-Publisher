# Metadata API

The Metadata API provides endpoints for generating, retrieving, and managing dataset metadata using AI-powered services.

## Endpoints

### Generate Metadata

```
POST /api/metadata/generate
```

Generates metadata for a dataset using AI services.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "language": "en",
  "includeFields": ["title", "description", "tags", "category"]
}
```

#### Parameters

- `datasetId`: ID of the dataset to generate metadata for (required)
- `language`: Language for metadata generation, either "en" (English) or "ar" (Arabic) (default: "en")
- `includeFields`: Array of metadata fields to generate (default: all fields)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "US Population Demographics 2020",
      "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
      "tags": ["demographics", "census", "population", "united states", "2020"],
      "category": "Demographics"
    },
    "confidence": {
      "title": 0.92,
      "description": 0.87,
      "tags": 0.85,
      "category": 0.94
    }
  }
}
```

### Save Metadata

```
POST /api/metadata/save
```

Saves metadata for a dataset.

#### Request

```json
{
  "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
  "metadata": {
    "title": "US Population Demographics 2020",
    "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
    "tags": ["demographics", "census", "population", "united states", "2020"],
    "category": "Demographics"
  },
  "isDraft": true
}
```

#### Parameters

- `datasetId`: ID of the dataset to save metadata for (required)
- `metadata`: Object containing metadata fields (required)
- `isDraft`: Boolean indicating whether this is a draft save (default: false)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "metadataId": "64f7e8a12b3c4d5e6f7a8b9d",
    "datasetId": "64f7e8a12b3c4d5e6f7a8b9c",
    "isDraft": true,
    "updatedAt": "2023-09-05T15:30:45Z"
  }
}
```

### Get Metadata

```
GET /api/metadata/:datasetId
```

Retrieves metadata for a dataset.

#### Parameters

- `datasetId`: ID of the dataset to retrieve metadata for (required)
- `version`: Version of metadata to retrieve (optional, default: latest)
- `includeDraft`: Boolean indicating whether to include draft metadata (optional, default: false)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "title": "US Population Demographics 2020",
      "description": "This dataset contains demographic information about the US population based on the 2020 census, including age, gender, ethnicity, and geographic distribution.",
      "tags": ["demographics", "census", "population", "united states", "2020"],
      "category": "Demographics"
    },
    "metadataId": "64f7e8a12b3c4d5e6f7a8b9d",
    "version": 2,
    "isDraft": false,
    "createdAt": "2023-09-05T14:45:30Z",
    "updatedAt": "2023-09-05T15:30:45Z"
  }
}
```

### Get Metadata History

```
GET /api/metadata/:datasetId/history
```

Retrieves the version history of metadata for a dataset.

#### Parameters

- `datasetId`: ID of the dataset to retrieve metadata history for (required)

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "metadataId": "64f7e8a12b3c4d5e6f7a8b9d",
        "version": 2,
        "isDraft": false,
        "createdBy": "user123",
        "createdAt": "2023-09-05T15:30:45Z"
      },
      {
        "metadataId": "64f7e8a12b3c4d5e6f7a8b9e",
        "version": 1,
        "isDraft": false,
        "createdBy": "user123",
        "createdAt": "2023-09-05T14:45:30Z"
      }
    ],
    "drafts": [
      {
        "metadataId": "64f7e8a12b3c4d5e6f7a8b9f",
        "isDraft": true,
        "createdBy": "user123",
        "createdAt": "2023-09-05T16:15:20Z"
      }
    ]
  }
}
```

## Error Codes

- `DATASET_NOT_FOUND` - The specified dataset does not exist
- `METADATA_NOT_FOUND` - No metadata exists for the specified dataset
- `INVALID_LANGUAGE` - The specified language is not supported
- `GENERATION_FAILED` - Metadata generation failed
- `INVALID_METADATA` - The provided metadata is invalid or incomplete 