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

### Bilingual Metadata Generation

The platform provides robust support for generating metadata in both English and Arabic:

#### Prompt Engineering for Bilingual Content

For bilingual metadata generation, the system uses specialized prompts that instruct the AI to:

- Generate content in both English and Arabic
- Ensure cultural relevance for both languages
- Maintain consistency between language versions
- Use proper Arabic grammar and formatting

#### Schema Validation

Different Zod schemas are used to validate the generated metadata based on the selected language mode:

```typescript
// English-only schema
const englishMetadataSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  tags: z.array(z.string()).min(1).max(10),
  category: z.string()
});

// Arabic-only schema
const arabicMetadataSchema = z.object({
  titleArabic: z.string().min(3).max(100),
  descriptionArabic: z.string().min(10).max(1000),
  tagsArabic: z.array(z.string()).min(1).max(10),
  categoryArabic: z.string()
});

// Bilingual schema
const bilingualMetadataSchema = z.object({
  title: z.string().min(3).max(100),
  titleArabic: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  descriptionArabic: z.string().min(10).max(1000),
  tags: z.array(z.string()).min(1).max(10),
  tagsArabic: z.array(z.string()).min(1).max(10),
  category: z.string(),
  categoryArabic: z.string()
});
```

#### Language Detection and Fallback

The system includes logic to detect the appropriate language mode based on:

- User preference
- Dataset content analysis
- Available metadata fields

If generation fails in one language, the system can fall back to another language mode while providing appropriate user feedback.

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
      "tagsArabic": ["string"] (if language is 'both' or 'ar'),
      "category": "string",
      "categoryArabic": "string (if language is 'both' or 'ar')"
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
```json
{
  "message": "Metadata updated successfully",
  "metadata": {
    // Updated metadata object
  }
}
```

## Recent Enhancements

### March 2024 Updates

- Enhanced bilingual metadata generation with improved prompts
- Added robust validation for different language scenarios
- Improved error handling for language-specific operations
- Updated UI to better support editing bilingual metadata
- Added language toggle in the metadata editor interface