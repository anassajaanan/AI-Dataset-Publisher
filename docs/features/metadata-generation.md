# Metadata Generation Feature

## Overview

The metadata generation feature uses AI to automatically generate high-quality metadata for datasets. It analyzes the content of uploaded files and produces structured metadata including titles, descriptions, tags, and categories in multiple languages.

## Implementation Details

### Architecture

The metadata generation feature consists of several components:

1. **MetadataGenerator Service**: Core service that integrates with OpenAI's API to generate metadata
2. **Metadata API Endpoints**: REST endpoints for requesting metadata generation and managing metadata
3. **MetadataEditor Component**: UI for reviewing, selecting, and editing generated metadata

### OpenAI Integration

- **Model**: GPT-4o (2024-08-06 version)
- **Prompt Engineering**: Carefully crafted prompts that include file information and content samples
- **Response Format**: Structured JSON responses validated with Zod schemas
- **Error Handling**: Custom error classes and fallback mechanisms

### Language Support

The metadata generation feature supports three language modes:

1. **English Only**: Generates metadata exclusively in English
2. **Arabic Only**: Generates metadata exclusively in Arabic
3. **Bilingual**: Generates metadata in both English and Arabic

Each language mode uses a different schema for validation and has specific prompt instructions to ensure high-quality output.

## API Endpoints

### `/api/metadata`

**Method**: POST

**Request Body**:
```json
{
  "datasetId": "string",
  "language": "en" | "ar" | "both"
}
```

**Response**:
```json
{
  "message": "Metadata generated successfully",
  "metadata": [
    {
      "title": "string",
      "titleArabic": "string (if language is 'both' or 'ar')",
      "description": "string",
      "descriptionArabic": "string (if language is 'both' or 'ar')",
      "tags": ["string"],
      "category": "string"
    },
    // Additional options...
  ]
}
```

### `/api/datasets/[id]/metadata`

**Method**: GET

**Response**:
```json
{
  "metadata": {
    "title": "string",
    "titleArabic": "string (if available)",
    "description": "string",
    "descriptionArabic": "string (if available)",
    "keywords": ["string"],
    "keywordsArabic": ["string (if available)"],
    "category": "string",
    "categoryArabic": "string (if available)",
    "author": "string",
    "language": "en | ar | both"
  }
}
```

**Method**: PUT

**Request Body**:
```json
{
  "metadata": {
    "title": "string",
    "titleArabic": "string (optional)",
    "description": "string",
    "descriptionArabic": "string (optional)",
    "tags": ["string"],
    "tagsArabic": ["string (optional)"],
    "category": "string",
    "categoryArabic": "string (optional)",
    "author": "string",
    "language": "en | ar | both"
  }
}
```

**Response**:
```