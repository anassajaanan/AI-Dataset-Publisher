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
    "license": "string",
    "author": "string"
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
    "license": "string",
    "author": "string"
  }
}
```

**Response**:
```json
{
  "message": "Metadata updated successfully",
  "metadata": {
    // Updated metadata object
  }
}
```

## User Interface

The MetadataEditor component provides a comprehensive interface for working with generated metadata:

1. **Language Selection**: Users can choose between English, Arabic, or bilingual metadata
2. **Generation**: Initiates the AI-powered metadata generation process
3. **Option Selection**: Displays multiple metadata options for the user to choose from
4. **Editing**: Allows users to edit the selected metadata with proper language support
5. **Tag Management**: Interface for adding and removing tags
6. **Saving**: Options to save drafts or submit the final metadata

### RTL Support

The component includes proper right-to-left (RTL) support for Arabic content:

- Text alignment is automatically adjusted based on the language
- Input fields and text areas have appropriate directionality
- Arabic labels and placeholders are provided for better user experience

## Schema Validation

The metadata generation service uses Zod schemas to validate the structure of generated metadata:

```typescript
// English metadata schema
const MetadataOption = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
});

// Bilingual metadata schema
const BilingualMetadataOption = MetadataOption.extend({
  titleArabic: z.string(),
  descriptionArabic: z.string(),
});
```

## Future Improvements

1. **Unit Testing**: Add comprehensive tests for the metadata generation service
2. **Additional Languages**: Extend support to more languages beyond English and Arabic
3. **Enhanced AI Models**: Explore fine-tuning models specifically for dataset metadata generation
4. **Caching**: Implement caching mechanisms to improve performance and reduce API calls
5. **Offline Mode**: Add fallback mechanisms for when the AI service is unavailable 